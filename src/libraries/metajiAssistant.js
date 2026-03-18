import fetch from 'node-fetch'
import { getMetajiConfig, getMetajiSessionDir } from './metajiWebhook.js'
import { getAgentApiConfig } from './agentApi.config.js'
import { loadAssistantHistory, appendAssistantHistory } from './metajiAssistantHistory.js'

const MAX_IMAGE_MB = 4
const MAX_PDF_MB = 8
const MAX_AUDIO_MINUTES = 5
const MAX_AUDIO_BYTES = 6 * 1024 * 1024 // fallback 6 MB (duração já limitada em minutos)

const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024
const MAX_PDF_BYTES = MAX_PDF_MB * 1024 * 1024

function getMimeForMessage(m) {
  const mt = m?.mtype || ''
  if (mt === 'imageMessage') {
    const raw = m?.msg?.mimetype || m?.message?.imageMessage?.mimetype
    return raw || 'image/jpeg'
  }
  if (mt === 'audioMessage') {
    const raw = m?.msg?.mimetype || m?.message?.audioMessage?.mimetype
    return raw || 'audio/ogg; codecs=opus'
  }
  if (mt === 'documentMessage') {
    const raw = m?.msg?.mimetype || m?.message?.documentMessage?.mimetype
    const fn = (m?.msg?.fileName || m?.message?.documentMessage?.fileName || '').toLowerCase()
    if (/\.pdf$/i.test(fn) || raw === 'application/pdf') return 'application/pdf'
    return null
  }
  return null
}

function isSupportedMediaMessage(m) {
  const mt = m?.mtype || ''
  if (mt === 'imageMessage') return true
  if (mt === 'audioMessage') return true
  if (mt === 'documentMessage') {
    const fn = (m?.msg?.fileName || m?.message?.documentMessage?.fileName || '').toLowerCase()
    const mimetype = m?.msg?.mimetype || m?.message?.documentMessage?.mimetype
    return /\.pdf$/i.test(fn) || mimetype === 'application/pdf'
  }
  return false
}

/**
 * Chama a API do assistente (agente IA). Se a mensagem for tratada pelo assistente,
 * envia a resposta e retorna true. Caso contrário retorna false.
 * Aceita texto e/ou mídia leve: imagens, áudio e PDF (sem vídeo).
 *
 * @param {import("baileys").WASocket} conn
 * @param {object} m mensagem
 * @returns {Promise<boolean>}
 */
export async function tryMetajiAssistant(conn, m) {
  const config = getMetajiConfig(conn || global.conn)
  if (!config.enabled || !config.baseUrl) {
    return false
  }

  const socket = conn && typeof conn.sendMessage === 'function'
    ? conn
    : (conn?.conn && typeof conn.conn.sendMessage === 'function' ? conn.conn : conn)
  if (!socket || typeof socket.sendMessage !== 'function') {
    return false
  }

  const text = (m?.text || '').trim()
  const hasMedia = isSupportedMediaMessage(m)
  if (!text && !hasMedia) {
    return false
  }

  const chatId = (m?.key?.remoteJid || m?.chat || '').toString().trim()
  if (!chatId) {
    return false
  }

  const senderName = (m?.pushName || m?.notify || '').trim() || undefined
  const senderJid = (m?.key?.participant && typeof m.key.participant === 'string')
    ? m.key.participant
    : (m?.chat || m?.key?.remoteJid || '')
  const senderIdPart = typeof senderJid === 'string' ? senderJid.replace(/@.*$/, '').trim() : ''
  const senderJidSuffix = typeof senderJid === 'string' ? (senderJid.includes('@') ? senderJid.slice(senderJid.indexOf('@')) : '') : ''
  // Telefone apenas quando for numero real (@s.whatsapp.net). Evita usar ID (@lid) ou grupo (@g.us) como "telefone".
  const senderNumber = senderJidSuffix === '@s.whatsapp.net' && senderIdPart
    ? (senderIdPart.startsWith('+') ? senderIdPart : `+${senderIdPart}`)
    : undefined
  const senderId = senderIdPart || undefined

  const sessionDir = getMetajiSessionDir(conn || global.conn)
  const { history, expired } = loadAssistantHistory(sessionDir, chatId)
  // Se o histórico expirou (10 min sem mensagens), encerra a conversa anterior e inicia outra.
  // Não enviamos aviso de "tempo acabou"; apenas um aviso curto por ausência.
  if (expired) {
    await socket.sendMessage(m.chat, { text: 'Encerrei sua conversa por ausência.' }).catch(() => {})
  }

  const media = []
  if (hasMedia && typeof m.download === 'function') {
    try {
      const mt = m.mtype || ''

      if (mt === 'audioMessage') {
        const secondsRaw = m?.msg?.seconds ?? m?.message?.audioMessage?.seconds
        const durationSeconds = typeof secondsRaw === 'string' ? parseFloat(secondsRaw) : (Number(secondsRaw) || 0)
        if (durationSeconds > MAX_AUDIO_MINUTES * 60) {
          await socket.sendMessage(m.chat, {
            text: `⏱️ O áudio é muito longo. Envie áudios de até ${MAX_AUDIO_MINUTES} minutos.`,
          })
          return true
        }
      }

      const buffer = await m.download()
      if (buffer && Buffer.isBuffer(buffer)) {
        let maxBytes = 0
        const mime = getMimeForMessage(m)
        if (!mime) {
          // documento não-PDF ignorado
        } else if (mt === 'imageMessage') {
          maxBytes = MAX_IMAGE_BYTES
        } else if (mt === 'audioMessage') {
          maxBytes = MAX_AUDIO_BYTES
        } else if (mt === 'documentMessage') {
          maxBytes = MAX_PDF_BYTES
        }
        if (maxBytes > 0 && buffer.length <= maxBytes && media.length < 5) {
          media.push({
            mimeType: mime.split(';')[0].trim(),
            data: buffer.toString('base64'),
          })
        } else if (maxBytes > 0 && buffer.length > maxBytes) {
          const tipo = mt === 'imageMessage' ? 'imagem' : mt === 'documentMessage' ? 'PDF' : 'áudio'
          const limite = mt === 'imageMessage' ? `${MAX_IMAGE_MB} MB` : mt === 'documentMessage' ? `${MAX_PDF_MB} MB` : '6 MB'
          await socket.sendMessage(m.chat, {
            text: `📎 O ${tipo} é muito grande. Limite: ${limite}.`,
          })
          return true
        }
      }
    } catch (err) {
      console.error('[MetaJI assistente] Erro ao baixar mídia:', err?.message || err)
    }
  }

  const messageText = text || (media.length > 0 ? '[O usuário enviou uma mídia]' : '')
  if (!messageText.trim() && media.length === 0) {
    return false
  }

  // 1) Agente por sessão (API externa): multi-sessão, identifica por x-api-secret + sessionName.
  const agentApi = getAgentApiConfig(conn || global.conn)
  if (agentApi.enabled && agentApi.sessionName) {
    try {
      const response = await fetch(`${agentApi.baseUrl}/bot-connect/session/agent/input`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-secret': agentApi.apiSecretKey,
        },
        body: JSON.stringify({
          sessionName: agentApi.sessionName,
          message: messageText,
          history: (!expired && history.length) ? history : undefined,
          context: (senderName || senderNumber || senderId || chatId) ? { senderName, senderNumber, senderId, chatId, chatType: chatId?.endsWith('@g.us') ? 'group' : 'private' } : undefined,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok && data.handled && data.reply?.text) {
        // Envia texto e, se houver, mídias (imagens) retornadas pelo agente.
        let replyText = data.reply.text
        // Se por algum motivo a API devolveu JSON como texto, tenta extrair o campo text.
        if (typeof replyText === 'string' && replyText.trim().startsWith('{') && replyText.includes('"text"')) {
          try {
            const obj = JSON.parse(replyText)
            if (obj && typeof obj.text === 'string') replyText = obj.text
          } catch {}
        }
        const replyMedia = Array.isArray(data.reply.media) ? data.reply.media : []
        if (replyMedia.length > 0) {
          for (const mediaItem of replyMedia.slice(0, 2)) {
            const mt = (mediaItem?.mimeType || '').toString()
            const b64 = (mediaItem?.data || '').toString()
            if (!mt.startsWith('image/') || !b64) continue
            const buffer = Buffer.from(b64, 'base64')
            await socket.sendMessage(m.chat, { image: buffer, caption: replyText })
          }
        } else {
          await socket.sendMessage(m.chat, { text: replyText })
        }

        // Salva histórico também no fluxo por sessão (senão a IA não recebe contexto nas próximas mensagens).
        appendAssistantHistory(sessionDir, chatId, messageText, replyText)
        return true
      }
    } catch (err) {
      console.error('[MetaJI agente sessão] Erro ao chamar API:', err?.message || err)
    }
  }

  // 2) Assistente owner (fluxo antigo: ownerApiKey, menus, flow, etc.)
  if (!config.ownerApiKey) {
    return false
  }
  try {
    const body = {
      chatId,
      message: messageText,
      history: (!expired && history.length) ? history : undefined,
      context: (senderName || senderNumber || senderId) ? { senderName, senderNumber, senderId } : undefined,
    }
    if (media.length > 0) body.media = media

    const response = await fetch(`${config.baseUrl}/bot-connect/owner/assistant/input`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-owner-api-key': config.ownerApiKey,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('[MetaJI assistente] API retornou status:', response.status, data?.message || '')
      return false
    }
    if (!data.handled) {
      console.log('[MetaJI assistente] API respondeu handled: false (nenhum agente/flow/IA respondeu)')
      return false
    }

    if (!data.reply?.text) {
      console.log('[MetaJI assistente] API respondeu handled: true mas sem reply.text')
      return false
    }

    // Sempre envia a resposta real da API. Se houver mídias (imagens), envia junto.
    const replyText = data.reply.text
    const replyMedia = Array.isArray(data.reply.media) ? data.reply.media : []
    if (replyMedia.length > 0) {
      for (const mediaItem of replyMedia.slice(0, 2)) {
        const mt = (mediaItem?.mimeType || '').toString()
        const b64 = (mediaItem?.data || '').toString()
        if (!mt.startsWith('image/') || !b64) continue
        const buffer = Buffer.from(b64, 'base64')
        await socket.sendMessage(m.chat, { image: buffer, caption: replyText })
      }
    } else {
      await socket.sendMessage(m.chat, { text: replyText })
    }

    appendAssistantHistory(sessionDir, chatId, messageText, replyText)
    return true
  } catch (err) {
    console.error('[MetaJI assistente] Erro ao chamar API:', err?.message || err)
    return false
  }
}

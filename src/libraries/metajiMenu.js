import fetch from 'node-fetch'
import { getMetajiConfig as getMetajiConfigFromWebhook } from './metajiWebhook.js'

/**
 * Monta uma mensagem "falsa" para usar como citacao, exibindo o texto da marca na bolha de citacao.
 * brandingText: vem da API (reply.brandingQuote) ou do config do bot (config.brandingFooter). Se vazio, retorna m.
 */
function getQuotedMessage(m, brandingText) {
  const chatId = m?.chat || m?.key?.remoteJid
  const text = (brandingText || '').trim()
  if (!chatId || !text) return m
  return {
    key: {
      remoteJid: chatId,
      fromMe: false,
      id: 'metaji-' + Date.now(),
    },
    message: { conversation: text },
  }
}

/**
 * Chama a API de menus hierárquicos. Se a mensagem for tratada (trigger de menu ou opção),
 * envia a resposta e retorna true. Caso contrário retorna false.
 * @param {import("baileys").WASocket} conn
 * @param {object} m mensagem
 * @returns {Promise<boolean>}
 */
export async function tryMetajiMenu(conn, m) {
  const config = getMetajiConfigFromWebhook(conn || global.conn)
  if (!config.enabled || !config.baseUrl || !config.ownerApiKey) {
    return false
  }
  const socket = conn && typeof conn.sendMessage === 'function' ? conn : (conn && conn.conn && typeof conn.conn.sendMessage === 'function' ? conn.conn : conn)
  if (!socket || typeof socket.sendMessage !== 'function') {
    return false
  }

  const text = (m?.text || '').trim()
  if (!text) {
    return false
  }

  // Usar sempre a mesma origem para o chatId (remoteJid) para a sessão do menu ser encontrada
  const chatId = (m?.key?.remoteJid || m?.chat || '').toString().trim()
  if (!chatId) {
    return false
  }

  try {
    const response = await fetch(`${config.baseUrl}/bot-connect/owner/menus/input`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-owner-api-key': config.ownerApiKey,
      },
      body: JSON.stringify({
        chatId,
        message: text,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok || !data.handled) {
      return false
    }

    const reply = data.reply
    // Se o menu marcou como tratado mas nao tem resposta para enviar, deixa o assistente tentar
    if (!reply) {
      return false
    }

    // Texto da citacao: prioridade para o que veio da API (portal do dono), senao config do bot
    const brandingText = (reply.brandingQuote != null ? reply.brandingQuote : config.brandingFooter || '').trim()

    function substituteVariables(str) {
      if (!str || typeof str !== 'string') return str
      const name = m?.pushName || m?.notify || 'Contato'
      const primeiroNome = (name || '').trim().split(/\s+/)[0] || name || 'Contato'
      // Em grupo: numero de quem enviou (participant). No privado: numero do chat (remoteJid).
      const senderJid = (m?.key?.participant && typeof m.key.participant === 'string')
        ? m.key.participant
        : (m?.chat || m?.key?.remoteJid || '')
      const telefone = (senderJid && typeof senderJid === 'string') ? senderJid.replace(/@.*$/, '') : ''
      const now = new Date()
      const h = now.getHours()
      const periodo = h >= 5 && h < 12 ? 'manhã' : h >= 12 && h < 18 ? 'tarde' : 'noite'
      const cumprimento = h >= 5 && h < 12 ? 'Bom dia' : h >= 12 && h < 18 ? 'Boa tarde' : 'Boa noite'
      const data = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      const dia = now.toLocaleDateString('pt-BR', { weekday: 'long' })
      const mes = now.toLocaleDateString('pt-BR', { month: 'long' })
      const ano = String(now.getFullYear())
      const diaNumero = String(now.getDate())
      const mesNumero = String(now.getMonth() + 1)
      return str
        .replace(/\{\{nome\}\}/gi, name)
        .replace(/\{\{primeiro_nome\}\}/gi, primeiroNome)
        .replace(/\{\{data\}\}/gi, data)
        .replace(/\{\{hora\}\}/gi, hora)
        .replace(/\{\{cumprimento\}\}/gi, cumprimento)
        .replace(/\{\{periodo\}\}/gi, periodo)
        .replace(/\{\{dia\}\}/gi, dia)
        .replace(/\{\{mes\}\}/gi, mes)
        .replace(/\{\{ano\}\}/gi, ano)
        .replace(/\{\{dia_numero\}\}/gi, diaNumero)
        .replace(/\{\{mes_numero\}\}/gi, mesNumero)
        .replace(/\{\{telefone\}\}/gi, telefone)
    }

    const quoted = getQuotedMessage(m, brandingText)

    if (reply.type === 'menu' && reply.text) {
      const finalText = substituteVariables(reply.text)
      await socket.sendMessage(m.chat, { text: finalText }, { quoted })
      return true
    }

    if (reply.type === 'response') {
      const rawCaption = reply.text || undefined
      const caption = substituteVariables(rawCaption)
      if (reply.imageUrl) {
        try {
          const imgRes = await fetch(reply.imageUrl)
          const buf = await imgRes.buffer()
          await socket.sendMessage(m.chat, { image: buf, caption: caption || undefined }, { quoted })
        } catch (err) {
          await socket.sendMessage(m.chat, { text: caption || reply.imageUrl }, { quoted })
        }
      } else if (reply.videoUrl) {
        try {
          const vidRes = await fetch(reply.videoUrl)
          const buf = await vidRes.buffer()
          await socket.sendMessage(m.chat, { video: buf, caption: caption || undefined }, { quoted })
        } catch (err) {
          await socket.sendMessage(m.chat, { text: caption || reply.videoUrl }, { quoted })
        }
      } else {
        const text = reply.link ? (caption ? `${caption}\n${reply.link}` : reply.link) : caption
        if (text) {
          await socket.sendMessage(m.chat, { text }, { quoted })
        }
      }
      return true
    }

    // Tratado pelo menu mas sem conteudo enviado: deixa o assistente responder
    return false
  } catch (err) {
    console.error('[MetaJI menu] Erro ao chamar API:', err?.message || err)
    return false
  }
}

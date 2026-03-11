import fs from 'fs'
import path from 'path'

const HISTORY_PREFIX = 'assistant-history-'
const TTL_MS = 10 * 60 * 1000 // 10 minutos

function historyPath(sessionDir, chatId) {
  const safe = String(chatId).replace(/[^a-zA-Z0-9.-]/g, '_')
  return path.join(sessionDir, `${HISTORY_PREFIX}${safe}.json`)
}

function pruneOld(entries) {
  if (!Array.isArray(entries)) return []
  const now = Date.now()
  return entries.filter((e) => e && typeof e.at === 'number' && now - e.at < TTL_MS)
}

/**
 * Carrega o histórico do assistente para um chatId (um arquivo por usuário).
 * @param {string} sessionDir pasta da sessão
 * @param {string} chatId ID do chat (remoteJid)
 * @returns {{ history: Array<{ role: 'user'|'model', text: string }>, expired: boolean }}
 */
export function loadAssistantHistory(sessionDir, chatId) {
  try {
    const filePath = historyPath(sessionDir, chatId)
    if (!fs.existsSync(filePath)) return { history: [], expired: false }
    const raw = fs.readFileSync(filePath, 'utf8')
    const rawEntries = JSON.parse(raw)
    const entries = pruneOld(Array.isArray(rawEntries) ? rawEntries : [])
    const hadConversation = (Array.isArray(rawEntries) ? rawEntries : []).length > 0
    const expired = hadConversation && entries.length === 0
    const history = entries.map((e) => ({ role: e.role, text: e.text || '' }))
    return { history, expired }
  } catch (_) {
    return { history: [], expired: false }
  }
}

/**
 * Salva no histórico do usuário a mensagem e a resposta (arquivo por chatId).
 * @param {string} sessionDir pasta da sessão
 * @param {string} chatId ID do chat
 * @param {string} userText mensagem do usuário
 * @param {string} modelText resposta do modelo
 */
export function appendAssistantHistory(sessionDir, chatId, userText, modelText) {
  try {
    const filePath = historyPath(sessionDir, chatId)
    let entries = []
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8')
      entries = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : []
    }
    const now = Date.now()
    entries.push({ role: 'user', text: userText, at: now })
    entries.push({ role: 'model', text: modelText, at: now })
    entries = pruneOld(entries)
    fs.writeFileSync(filePath, JSON.stringify(entries, null, 0), 'utf8')
  } catch (err) {
    console.error('[MetaJI assistente] Erro ao salvar histórico:', err?.message || err)
  }
}

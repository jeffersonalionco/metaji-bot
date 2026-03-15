/**
 * Configuração para o agente de IA da API (sessões de usuário).
 * Usado quando o bot está em modo multi-sessão e a API identifica a sessão por
 * x-api-secret + sessionName. A API verifica se há agente ativo para essa sessão
 * (tipo simples) e retorna a resposta.
 *
 * Rotas da API usadas:
 *   POST /bot-connect/session/agent/input
 *     Headers: x-api-secret (ou Authorization: Bearer <secret>)
 *     Body: { sessionName: string, message: string }
 *     Response: { handled: boolean, reply?: { text: string } }
 */

import path from 'path';
import { getMetajiConfig, getMetajiSessionDir } from './metajiWebhook.js';

/**
 * Retorna o sessionName no formato esperado pela API (igual ao armazenado em UserBotSession).
 * A API sanitiza com replace(/[^a-zA-Z0-9_-]/g, '_'), então usamos o mesmo.
 * @param {string} authDir - ex: "sessions/MysticSession1"
 * @returns {string} ex: "sessions_MysticSession1"
 */
export function getSessionNameForApi(authDir) {
  if (!authDir || typeof authDir !== 'string') return '';
  return authDir.replace(/[^a-zA-Z0-9_-]/g, '_').trim();
}

/**
 * Configuração do agente da API para a conexão atual.
 * @param {object} conn - conexão (baileys)
 * @returns {{ baseUrl: string, apiSecretKey: string, sessionName: string, enabled: boolean }}
 */
export function getAgentApiConfig(conn) {
  const config = getMetajiConfig(conn || global.conn);
  const baseUrl = (config.baseUrl || '').replace(/\/$/, '');
  const apiSecretKey = global.multiSession?.apiSecretKey ?? process.env.METAJI_SESSION_PASSWORD ?? '';
  const sessionDir = getMetajiSessionDir(conn || global.conn);
  const baseDir = global.__mainDir || process.cwd();
  const authDir = sessionDir && sessionDir !== baseDir
    ? path.relative(baseDir, sessionDir).replace(/\\/g, '/')
    : '';
  const sessionName = getSessionNameForApi(authDir);

  return {
    enabled: Boolean(baseUrl && apiSecretKey && (global.multiSession?.enabled ? sessionName : true)),
    baseUrl,
    apiSecretKey,
    sessionName,
  };
}

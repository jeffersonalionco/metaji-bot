import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

/**
 * Retorna o diretório da sessão atual (pasta onde fica metaji.json em multiSession).
 * Usado para salvar histórico do assistente por sessão.
 * @param {object} conn conexão
 * @returns {string}
 */
export function getMetajiSessionDir(conn) {
  let store = null;
  if (global.multiSession?.enabled) {
    if (conn && global.__sessionContextMap) {
      store = global.__sessionContextMap.get(conn);
    }
    if (store == null && typeof global.__multiSessionGetStore === 'function') {
      store = global.__multiSessionGetStore();
    }
  }
  const baseDir = global.__mainDir || process.cwd();
  if (global.multiSession?.enabled && store?._authDir) {
    return path.join(baseDir, store._authDir);
  }
  return baseDir;
}

let heartbeatTimer = null;
let outboundTimer = null;
const outboundInFlight = new Set();
const profilePhotoCache = new Map();
let lastSyncedConfigVersion = 0;
let lastSyncedApiConfigVersion = 0;
const MAX_EXECUTION_LOG_LENGTH = 4000;

/** Timeout em ms para chamadas à API MetaJI (evita fetch pendurado quando a API cai). */
const METAJI_FETCH_TIMEOUT_MS = Number(process.env.METAJI_FETCH_TIMEOUT_MS || 25000);

/** Evita vários ticks do heartbeat em paralelo (sync + escrita em api.js / config.js). */
let metajiHeartbeatTickRunning = false;

let metajiConfigErrorLogAt = 0;
let metajiConfigErrorSuppressed = 0;
const METAJI_ERROR_LOG_THROTTLE_MS = 45000;

function truncateForLog(text, maxLen = 180) {
  if (typeof text !== 'string') return '';
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen)}…`;
}

function logThrottledConfigError(status, detail) {
  const now = Date.now();
  if (now - metajiConfigErrorLogAt >= METAJI_ERROR_LOG_THROTTLE_MS) {
    const extra = metajiConfigErrorSuppressed > 0 ? ` (+${metajiConfigErrorSuppressed} falhas similares)` : '';
    console.error('[MetaJI config] Falha ao consultar API:', status, detail || '', extra);
    metajiConfigErrorLogAt = now;
    metajiConfigErrorSuppressed = 0;
  } else {
    metajiConfigErrorSuppressed += 1;
  }
}

/**
 * fetch com AbortSignal por timeout — libera o event loop e permite recuperação quando a API volta.
 */
async function fetchWithTimeout(url, init = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), METAJI_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function parseJsonBody(response) {
  const text = await response.text().catch(() => '');
  const trimmed = text.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed);
  } catch (_) {
    return { _nonJsonBody: true, _snippet: truncateForLog(trimmed, 160) };
  }
}

const METAJI_DEFAULTS = {
  enabled: false,
  baseUrl: '',
  ownerApiKey: '',
  webhookToken: '',
  heartbeatIntervalMs: 30000,
  pluginVersion: 'themystic-webhook-v1',
  brandingFooter: '',
};

function readMetajiJson(authDir) {
  try {
    const baseDir = global.__mainDir || process.cwd();
    const filePath = path.join(baseDir, authDir, 'metaji.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return { ...METAJI_DEFAULTS, ...JSON.parse(raw) };
    }
  } catch (_) {}
  return null;
}

export function getMetajiConfig(conn) {
  let store = null;
  if (global.multiSession?.enabled) {
    if (conn && global.__sessionContextMap) {
      store = global.__sessionContextMap.get(conn);
    }
    if (store == null && typeof global.__multiSessionGetStore === 'function') {
      store = global.__multiSessionGetStore();
    }
  }

  if (global.multiSession?.enabled && store?._authDir) {
    const fromFile = readMetajiJson(store._authDir);
    if (fromFile) {
      return {
        enabled: fromFile.enabled !== false,
        baseUrl: (fromFile.baseUrl || '').replace(/\/$/, ''),
        ownerApiKey: fromFile.ownerApiKey || '',
        webhookToken: fromFile.webhookToken || '',
        heartbeatIntervalMs: Number(fromFile.heartbeatIntervalMs || 30000),
        pluginVersion: fromFile.pluginVersion || 'themystic-webhook-v1',
        brandingFooter: (fromFile.brandingFooter || '').trim(),
        _source: 'metaji.json',
      };
    }
  }

  const config = (global.multiSession?.enabled && store?.metajiApi != null) ? store.metajiApi : (global.metajiApi || {});

  return {
    enabled: config.enabled !== false,
    baseUrl: (config.baseUrl || '').replace(/\/$/, ''),
    ownerApiKey: config.ownerApiKey || '',
    webhookToken: config.webhookToken || '',
    heartbeatIntervalMs: Number(config.heartbeatIntervalMs || 30000),
    pluginVersion: config.pluginVersion || 'themystic-webhook-v1',
    brandingFooter: (config.brandingFooter || '').trim(),
    _source: 'config.js',
  };
}

function getBotSnapshot(conn) {
  const jid = conn?.user?.jid || '';

  return {
    botIdentifier: jid || undefined,
    botName: conn?.user?.name || global.wm || 'TheMystic-Bot-MD',
    phoneNumber: jid ? jid.split('@')[0] : undefined,
    version: 'baileys',
  };
}

async function postWebhook(path, payload, conn) {
  const config = getMetajiConfig(conn);

  if (!config.enabled || !config.baseUrl || !config.webhookToken) {
    return {skipped: true};
  }

  try {
    const response = await fetchWithTimeout(`${config.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-token': config.webhookToken,
      },
      body: JSON.stringify({
        ...payload,
        pluginVersion: payload.pluginVersion || config.pluginVersion,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(
        '[MetaJI webhook] Falha ao enviar payload:',
        response.status,
        truncateForLog(body, 220),
      );
    }

    return {ok: response.ok};
  } catch (error) {
    const msg = error?.name === 'AbortError' ? `timeout após ${METAJI_FETCH_TIMEOUT_MS}ms` : (error?.message || error);
    console.error('[MetaJI webhook] Erro ao enviar webhook:', msg);
    return {ok: false};
  }
}

async function requestOwnerApi(pathName, options = {}, conn) {
  const config = getMetajiConfig(conn);

  if (!config.enabled || !config.baseUrl || !config.ownerApiKey) {
    return {skipped: true};
  }

  try {
    const response = await fetchWithTimeout(`${config.baseUrl}${pathName}`, {
      method: options.method || 'GET',
      headers: {
        ...(options.body ? {'Content-Type': 'application/json'} : {}),
        'x-owner-api-key': config.ownerApiKey,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await parseJsonBody(response);

    if (!response.ok) {
      const detail = data?._nonJsonBody
        ? `(resposta não JSON: ${data._snippet})`
        : (data?.message || '');
      logThrottledConfigError(response.status, detail);
      return {ok: false, data};
    }

    // 502/Cloudflare às vezes devolvem 200 com HTML de erro — não tratar como JSON da API.
    if (data && data._nonJsonBody) {
      logThrottledConfigError('invalid-json', data._snippet || '');
      return {ok: false, data};
    }

    return {ok: true, data};
  } catch (error) {
    const msg = error?.name === 'AbortError' ? `timeout após ${METAJI_FETCH_TIMEOUT_MS}ms` : (error?.message || error);
    logThrottledConfigError('network', msg);
    return {ok: false};
  }
}

/**
 * Busca mensagens pendentes na fila outbound da API e envia via WhatsApp.
 * Chamado no heartbeat para sessionName da sessão atual.
 */
async function pollAndSendOutbound(conn) {
  const config = getMetajiConfig(conn);
  if (!config.enabled || !config.baseUrl || !config.ownerApiKey) {
    if (config.enabled && config.baseUrl && !config.ownerApiKey) {
      // Sem ownerApiKey a API nao envia nada da fila (painel / quiz).
      try {
        const once = global.__metajiOutboundNoKeyLogged;
        if (!once) {
          global.__metajiOutboundNoKeyLogged = true;
          console.warn('[MetaJI outbound] ownerApiKey ausente em metaji.json — fila de envio (WhatsApp) desativada.');
        }
      } catch (_) {}
    }
    return;
  }

  let sessionName;
  try {
    const { getSessionNameForApi } = await import('./agentApi.config.js');
    const sessionDir = getMetajiSessionDir(conn);
    const baseDir = global.__mainDir || process.cwd();
    const authDir = sessionDir && sessionDir !== baseDir
      ? path.relative(baseDir, sessionDir).replace(/\\/g, '/')
      : '';
    sessionName = getSessionNameForApi(authDir);
  } catch (_) {
    return;
  }
  if (!sessionName) return;

  const { ok, data } = await requestOwnerApi(
    `/bot-connect/outbound?sessionName=${encodeURIComponent(sessionName)}`,
    { method: 'GET' },
    conn,
  );
  if (!ok || !data?.items?.length) return;

  const baseUrl = (config.baseUrl || '').replace(/\/$/, '');
  const authHeader = { 'x-owner-api-key': config.ownerApiKey };

  for (const item of data.items) {
    if (!item?.id || outboundInFlight.has(item.id)) continue;
    outboundInFlight.add(item.id);
    let status = 'failed';
    try {
      const jid = item.remoteJid;
      const readBinaryFromUrl = async (url) => {
        const raw = String(url ?? '')
        const absolute = raw.startsWith('/')
          ? `${baseUrl}${raw}`
          : raw
        const resp = await fetchWithTimeout(absolute);
        if (!resp.ok) throw new Error(`Falha ao baixar mediaUrl: ${resp.status}`);
        const arr = await resp.arrayBuffer();
        return Buffer.from(arr);
      };
      if (item.type === 'text') {
        await conn.sendMessage(jid, { text: item.text || '' });
        status = 'sent';
      } else if (item.type === 'image' && item.mediaBase64) {
        const buf = Buffer.from(item.mediaBase64, 'base64');
        await conn.sendMessage(jid, {
          image: buf,
          caption: item.text || undefined,
        });
        status = 'sent';
      } else if (item.type === 'image' && item.mediaUrl) {
        const buf = await readBinaryFromUrl(item.mediaUrl);
        await conn.sendMessage(jid, {
          image: buf,
          caption: item.text || undefined,
        });
        status = 'sent';
      } else if (item.type === 'video' && item.mediaBase64) {
        const buf = Buffer.from(item.mediaBase64, 'base64');
        await conn.sendMessage(jid, {
          video: buf,
          caption: item.text || undefined,
        });
        status = 'sent';
      } else if (item.type === 'video' && item.mediaUrl) {
        const buf = await readBinaryFromUrl(item.mediaUrl);
        await conn.sendMessage(jid, {
          video: buf,
          caption: item.text || undefined,
        });
        status = 'sent';
      }
    } catch (err) {
      console.error('[MetaJI outbound] Erro ao enviar mensagem:', item?.id, err?.message || err);
    }

    // Limpa arquivo temporário (upload-temp) após sucesso.
    if (status === 'sent' && typeof item.mediaUrl === 'string' && item.mediaUrl.includes('/media/wa/tmp/')) {
      try {
        const idx = item.mediaUrl.indexOf('/media/')
        const key = idx >= 0 ? item.mediaUrl.slice(idx + '/media/'.length) : null
        if (key && key.startsWith('wa/tmp/')) {
          await fetchWithTimeout(`${baseUrl}/bot-connect/owner/media-temp/${encodeURIComponent(key)}`, {
            method: 'DELETE',
            headers: { ...authHeader },
          })
        }
      } catch (_) {}
    }

    try {
      await fetchWithTimeout(`${baseUrl}/bot-connect/outbound/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ status }),
      });
    } catch (_) {}
    finally {
      outboundInFlight.delete(item.id);
    }
  }
}

function buildConfigFilePath() {
  return path.join(process.cwd(), 'config.js');
}

function buildApiFilePath() {
  return path.join(process.cwd(), 'api.js');
}

function updateRuntimeIdentity(values) {
  global.packname = values.packname;
  global.author = values.author;
  global.wm = values.wm;
  global.titulowm = values.titulowm;
  global.titulowm2 = values.titulowm2;
  global.igfg = values.igfg;
}

function updateRuntimeApiConfig(values) {
  global.openai_key = values.main.openaiKey;
  global.openai_org_id = values.main.openaiOrgId;
  global.MyApiRestBaseUrl = values.main.myApiRestBaseUrl;
  global.MyApiRestApikey = values.main.myApiRestApikey;
  global.MyApiRestBaseUrl2 = values.main.myApiRestBaseUrl2;
  global.MyApiRestBaseUrl3 = values.main.myApiRestBaseUrl3;
  global.APIs = values.providers;
  global.APIKeys = values.providerKeys;
}

function replaceAssignedGlobal(fileContent, key, value) {
  const pattern = new RegExp(`^global\\.${key}\\s*=.*$`, 'm');
  const replacement = `global.${key} = ${JSON.stringify(value)};`;

  if (!pattern.test(fileContent)) {
    throw new Error(`Campo global.${key} não encontrado em api.js`);
  }

  return fileContent.replace(pattern, replacement);
}

function buildObjectLiteral(objectValue, withSemicolon = false) {
  const lines = Object.entries(objectValue).map(
    ([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)}`,
  );

  return `{\n${lines.join(',\n')}\n}${withSemicolon ? ';' : ','}`;
}

function replaceObjectBlock(fileContent, objectName, objectValue, withSemicolon = false) {
  const pattern = withSemicolon
    ? new RegExp(`global\\.${objectName}\\s*=\\s*\\{[\\s\\S]*?\\n\\};`)
    : new RegExp(`global\\.${objectName}\\s*=\\s*\\{[\\s\\S]*?\\n\\},`);

  if (!pattern.test(fileContent)) {
    throw new Error(`Bloco global.${objectName} não encontrado em api.js`);
  }

  return fileContent.replace(
    pattern,
    `global.${objectName} = ${buildObjectLiteral(objectValue, withSemicolon)}`,
  );
}

async function applyRemoteBotIdentityConfig(values) {
  const configPath = buildConfigFilePath();
  let nextFileContent = fs.readFileSync(configPath, 'utf8');

  const assignments = {
    packname: values.packname,
    author: values.author,
    wm: values.wm,
    titulowm: values.titulowm,
    titulowm2: values.titulowm2,
    igfg: values.igfg,
  };

  for (const [key, value] of Object.entries(assignments)) {
    const pattern = new RegExp(`^global\\.${key}\\s*=.*$`, 'm');
    const replacement = `global.${key} = ${JSON.stringify(value)};`;

    if (!pattern.test(nextFileContent)) {
      throw new Error(`Campo global.${key} não encontrado em config.js`);
    }

    nextFileContent = nextFileContent.replace(pattern, replacement);
  }

  fs.writeFileSync(configPath, nextFileContent);
  updateRuntimeIdentity(values);
}

export async function syncMetajiRemoteBotConfig(conn) {
  const configResponse = await requestOwnerApi('/bot-connect/owner/config', {}, conn);

  if (!configResponse.ok || !configResponse.data?.botConfig) {
    return;
  }

  const remoteConfig = configResponse.data.botConfig;

  if (remoteConfig.version <= lastSyncedConfigVersion) {
    return;
  }

  await applyRemoteBotIdentityConfig(remoteConfig.values);
  lastSyncedConfigVersion = remoteConfig.version;

  await requestOwnerApi('/bot-connect/owner/config/ack', {
    method: 'POST',
    body: {
      appliedVersion: remoteConfig.version,
    },
  }, conn);
}

async function applyRemoteBotApiConfig(values) {
  const apiPath = buildApiFilePath();
  let nextFileContent = fs.readFileSync(apiPath, 'utf8');

  nextFileContent = replaceAssignedGlobal(nextFileContent, 'openai_key', values.main.openaiKey);
  nextFileContent = replaceAssignedGlobal(nextFileContent, 'openai_org_id', values.main.openaiOrgId);
  nextFileContent = replaceAssignedGlobal(nextFileContent, 'MyApiRestBaseUrl', values.main.myApiRestBaseUrl);
  nextFileContent = replaceAssignedGlobal(nextFileContent, 'MyApiRestApikey', values.main.myApiRestApikey);
  nextFileContent = replaceAssignedGlobal(nextFileContent, 'MyApiRestBaseUrl2', values.main.myApiRestBaseUrl2);
  nextFileContent = replaceAssignedGlobal(nextFileContent, 'MyApiRestBaseUrl3', values.main.myApiRestBaseUrl3);
  nextFileContent = replaceObjectBlock(nextFileContent, 'APIs', values.providers, false);
  nextFileContent = replaceObjectBlock(nextFileContent, 'APIKeys', values.providerKeys, true);

  fs.writeFileSync(apiPath, nextFileContent);
  updateRuntimeApiConfig(values);
}

export async function syncMetajiRemoteBotApiConfig(conn) {
  const configResponse = await requestOwnerApi('/bot-connect/owner/api-config', {}, conn);

  if (!configResponse.ok || !configResponse.data?.botApiConfig) {
    return;
  }

  const remoteConfig = configResponse.data.botApiConfig;

  if (remoteConfig.version <= lastSyncedApiConfigVersion) {
    return;
  }

  await applyRemoteBotApiConfig(remoteConfig.values);
  lastSyncedApiConfigVersion = remoteConfig.version;

  await requestOwnerApi('/bot-connect/owner/api-config/ack', {
    method: 'POST',
    body: {
      appliedVersion: remoteConfig.version,
    },
  }, conn);
}

export async function sendMetajiConnectionStatus(conn, status, metadata = {}) {
  return postWebhook('/webhooks/bot-connection/status', {
    ...getBotSnapshot(conn),
    status,
    heartbeatAt: new Date().toISOString(),
    metadata,
  }, conn);
}

export async function sendMetajiConnectionEvent(conn, eventType, options = {}) {
  return postWebhook('/webhooks/bot-connection/events', {
    ...getBotSnapshot(conn),
    eventType,
    status: options.status,
    message: options.message,
    occurredAt: new Date().toISOString(),
    payload: options.payload,
  }, conn);
}

// Eventos de WhatsApp para o Kanban do usuário (MVP).
export async function sendMetajiWhatsAppEvent(conn, waEvent) {
  const remoteJid = (waEvent?.remoteJid || '').toString().trim();
  let profilePhotoUrl = waEvent?.profilePhotoUrl || undefined;
  if (!profilePhotoUrl && remoteJid) {
    try {
      const now = Date.now();
      const cached = profilePhotoCache.get(remoteJid);
      if (cached && now - cached.at < 10 * 60 * 1000) {
        profilePhotoUrl = cached.url || undefined;
      } else if (typeof conn?.profilePictureUrl === 'function') {
        const url = await conn.profilePictureUrl(remoteJid, 'image').catch(() => null);
        if (url && typeof url === 'string') {
          profilePhotoUrl = url;
          profilePhotoCache.set(remoteJid, { url, at: now });
        } else {
          profilePhotoCache.set(remoteJid, { url: null, at: now });
        }
      }
    } catch (_) {}
  }
  return sendMetajiConnectionEvent(conn, 'STATUS_UPDATE', {
    message: 'wa_event',
    payload: {
      logCategory: 'wa',
      ...waEvent,
      ...(profilePhotoUrl ? { profilePhotoUrl } : {}),
    },
  });
}

// Snapshot de chats (para preencher o Kanban sem depender de novas mensagens).
export async function sendMetajiWhatsAppChatsSnapshot(conn, snapshot) {
  return sendMetajiConnectionEvent(conn, 'STATUS_UPDATE', {
    message: 'wa_chats_snapshot',
    payload: {
      logCategory: 'wa_chats_snapshot',
      ...snapshot,
    },
  });
}

function normalizeExecutionLogMessage(message) {
  if (typeof message !== 'string') {
    return '';
  }

  return message.replace(/\u001b\[[0-9;]*m/g, '').trim().slice(0, MAX_EXECUTION_LOG_LENGTH);
}

export async function sendMetajiExecutionLog(conn, message, payload = {}) {
  const normalizedMessage = normalizeExecutionLogMessage(message);

  if (!normalizedMessage) {
    return {skipped: true};
  }

  const normalizedPayload =
    payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};

  return sendMetajiConnectionEvent(conn, 'STATUS_UPDATE', {
    status: normalizedPayload.status,
    message: normalizedMessage,
    payload: {
      logCategory: 'execution',
      ...normalizedPayload,
    },
  });
}

export function startMetajiHeartbeat(conn) {
  stopMetajiHeartbeat();

  const config = getMetajiConfig(conn);

  if (!config.enabled || !config.baseUrl || !config.webhookToken) {
    return;
  }

  // Outbound (envio de mensagens do painel): roda mais frequente para reduzir latência percebida.
  // Mantemos um intervalo mínimo baixo, independente do heartbeat.
  outboundTimer = setInterval(async () => {
    await pollAndSendOutbound(conn).catch(() => {});
  }, 1200);

  heartbeatTimer = setInterval(() => {
    if (metajiHeartbeatTickRunning) {
      return;
    }
    metajiHeartbeatTickRunning = true;
    void (async () => {
      try {
        await syncMetajiRemoteBotConfig(conn).catch(() => {});
        await syncMetajiRemoteBotApiConfig(conn).catch(() => {});
        await sendMetajiConnectionStatus(conn, 'ONLINE', {
          source: 'heartbeat',
          configVersion: lastSyncedConfigVersion || null,
          apiConfigVersion: lastSyncedApiConfigVersion || null,
        }).catch(() => {});

        // Envia snapshot leve de chats periodicamente (MVP).
        try {
          const { getSessionNameForApi } = await import('./agentApi.config.js');
          const sessionDir = getMetajiSessionDir(conn);
          const baseDir = global.__mainDir || process.cwd();
          const authDir = sessionDir && sessionDir !== baseDir
            ? path.relative(baseDir, sessionDir).replace(/\\/g, '/')
            : '';
          const sessionName = getSessionNameForApi(authDir);
          if (sessionName) {
            const chats = conn?.chats ? Object.values(conn.chats) : [];
            const mapped = chats
              .filter((c) => c && typeof c === 'object' && typeof c.id === 'string')
              .slice(0, 200)
              .map((c) => ({
                remoteJid: c.id,
                chatTitle: c.name || c.subject || '',
                chatType: c.id?.endsWith('@g.us') ? 'group' : 'private',
                lastMessageAt: c.conversationTimestamp ? new Date(Number(c.conversationTimestamp) * 1000).toISOString() : undefined,
              }));
            if (mapped.length) {
              await sendMetajiWhatsAppChatsSnapshot(conn, { sessionName, chats: mapped }).catch(() => {});
            }
          }
        } catch (_) {}
      } finally {
        metajiHeartbeatTickRunning = false;
      }
    })().catch((err) => {
      console.error('[MetaJI heartbeat] Erro no tick:', err?.message || err);
      metajiHeartbeatTickRunning = false;
    });
  }, Math.max(config.heartbeatIntervalMs, 5000));
}

export function stopMetajiHeartbeat() {
  metajiHeartbeatTickRunning = false;
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (outboundTimer) {
    clearInterval(outboundTimer);
    outboundTimer = null;
  }
}

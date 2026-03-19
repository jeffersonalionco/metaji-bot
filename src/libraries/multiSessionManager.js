/**
 * Gerenciador de múltiplas sessões WhatsApp na mesma execução Node.
 * Inclui mini-servidor para solicitar novas sessões pelo navegador (QR na tela).
 * Rotas /api/* para gerenciar sessões externamente (exige apiSecretKey e ownerApiKey).
 * Este arquivo pode ser ofuscado separadamente.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { resolve, join } from 'path';
import { createServer } from 'http';

const pendingSessions = new Map();
/** Armazena info de sessões conectadas (para status API). sessionName -> { connectedAt, phoneNumber } */
const connectedSessionsInfo = new Map();
/** Último erro por sessão (para status API). sessionName -> { message, code, at } */
const sessionLastErrors = new Map();

function registerSession(session, sessions, index, getConnectionOptions, setupConn, onConnectionUpdate, onSessionDisconnected, onSessionRegistered) {
  const { conn, state, saveCreds } = session;
  setupConn(conn, state, saveCreds);
  conn.ev.on('connection.update', (update) => {
    if (typeof onConnectionUpdate === 'function') {
      const g = global;
      const prev = g.conn;
      g.conn = conn;
      try {
        onConnectionUpdate.call(conn, update);
      } finally {
        g.conn = prev;
      }
    }
    if (update.connection === 'close') {
      const authDirParts = (session.authDir || '').split(/[/\\]/);
      const safeNameForStatus = authDirParts[authDirParts.length - 1] || session.authDir || '';
      connectedSessionsInfo.delete(safeNameForStatus);
      const err = update.lastDisconnect?.error;
      const msg = err?.message || (err?.output?.payload?.message) || 'Sessao desconectada.';
      if (safeNameForStatus) sessionLastErrors.set(safeNameForStatus, { message: msg, code: err?.output?.statusCode ?? null, at: new Date().toISOString() });
      if (typeof onSessionDisconnected === 'function') onSessionDisconnected(conn);
      session.savedChats = conn.chats || {};
      session.conn = null;
      setTimeout(() => {
        reconnectSession(session, sessions, index, getConnectionOptions, setupConn, onConnectionUpdate, onSessionDisconnected, onSessionRegistered);
      }, 5000);
    }
  });
  conn.ev.on('creds.update', saveCreds);
  if (!global.conn) global.conn = conn;
}

async function reconnectSession(session, sessions, index, getConnectionOptions, setupConn, onConnectionUpdate, onSessionDisconnected, onSessionRegistered) {
  if (session._deleted) return;
  try {
    const { makeWASocket } = await import('baileys');
    const getChats = () => {
      const s = sessions[index];
      if (s?.conn?.chats) return s.conn.chats;
      if (s?.savedChats) return s.savedChats;
      return {};
    };
    const opts = getConnectionOptions(session.state, getChats);
    const newConn = makeWASocket(opts);
    session.conn = newConn;
    session.savedChats = null;
    registerSession(session, sessions, index, getConnectionOptions, setupConn, onConnectionUpdate, onSessionDisconnected, onSessionRegistered);
    if (typeof onSessionRegistered === 'function') await Promise.resolve(onSessionRegistered(newConn, session.authDir));
  } catch (err) {
    console.error('[multiSession] Erro ao reconectar sessão:', session.authDir, err?.message);
  }
}

export async function startMultiSession(config) {
  const { sessions: sessionsConfig, getConnectionOptions, setupConn, onConnectionUpdate, serverPort, makeWASocket: makeWASocketFromConfig, sessionsDir = '', apiSecretKey = '', maxSessions, onSessionRegistered, onSessionDisconnected } = config;
  const sessions = [];
  const restartMinutesRaw = config?.restartMinutes ?? process.env.METAJI_SESSIONS_RESTART_MINUTES;
  const restartMinutes = Number(restartMinutesRaw || 0);
  const maxSessionsRaw = maxSessions ?? process.env.METAJI_SESSIONS_MAX;
  // maxSessions = 0 (ou vazio) => sem limite
  const maxSessionsNum = Number(maxSessionsRaw || 0);
  const capacity = maxSessionsNum > 0 ? maxSessionsNum : Infinity;
  let restartLock = false;
  let restartTimer = null;
  const initialSessions = Array.isArray(sessionsConfig) ? sessionsConfig : [];
  const initialSessionsLimited = capacity !== Infinity ? initialSessions.slice(0, capacity) : initialSessions;
  const hasInitialSessions = initialSessionsLimited.length > 0;
  if (!hasInitialSessions && (!serverPort || serverPort <= 0)) return null;

  const baileys = await import('baileys');
  const useMultiFileAuthState = baileys.useMultiFileAuthState;
  const makeWASocket = typeof makeWASocketFromConfig === 'function' ? makeWASocketFromConfig : baileys.makeWASocket;

  if (serverPort && typeof serverPort === 'number' && serverPort > 0) {
    startSessionServer(sessions, { getConnectionOptions, setupConn, onConnectionUpdate, serverPort, makeWASocket, sessionsDir, apiSecretKey, maxSessions: capacity, onSessionRegistered, onSessionDisconnected });
  }

  // Inicia sessões existentes em "fila", com pequeno delay entre elas para evitar pico de conexões.
  for (let i = 0; i < (initialSessionsLimited || []).length; i++) {
    const cfg = initialSessionsLimited[i];
    const authDir = typeof cfg === 'string' ? cfg : (cfg?.authDir || cfg?.sessionPath);
    if (!authDir) continue;

    setTimeout(async () => {
      try {
        const index = i;
        const authPath = resolve(process.cwd(), authDir);
        if (!existsSync(authPath)) {
          try {
            mkdirSync(authPath, { recursive: true });
          } catch (_) {}
        }

        const { state, saveCreds } = await useMultiFileAuthState(authPath);
        const getChats = () => {
          const s = sessions[index];
          if (s?.conn?.chats) return s.conn.chats;
          if (s?.savedChats) return s.savedChats;
          return {};
        };

        const options = { ...getConnectionOptions(state, getChats), printQRInTerminal: false };
        const conn = makeWASocket(options);

        const session = {
          authDir,
          state,
          saveCreds,
          conn,
          savedChats: null,
        };
        sessions[index] = session;

        if (typeof onSessionRegistered === 'function') {
          await Promise.resolve(onSessionRegistered(session.conn, authDir));
        }
        registerSession(session, sessions, index, getConnectionOptions, setupConn, onConnectionUpdate, onSessionDisconnected, onSessionRegistered);
        console.log('[multiSession] Sessao inicializada apos restart:', authDir);
      } catch (err) {
        console.error('[multiSession] Erro ao iniciar sessao inicial:', authDir, err?.message || err);
      }
    }, i * 2000); // 2s entre cada sessao
  }

  // Restart automático (fechando e deixando o próprio gerenciador reconectar via registerSession()).
  if (Number.isFinite(restartMinutes) && restartMinutes > 0) {
    const intervalMs = restartMinutes * 60 * 1000;
    console.log('[multiSession] Restart automático habilitado:', { restartMinutes, intervalMs });
    restartTimer = setInterval(() => {
      if (restartLock) return;
      restartLock = true;
      try {
        const candidates = [];
        const seenConns = new Set();

        // Sessões já conectadas (lista principal).
        sessions
          .map((s) => s)
          .filter((s) => s && s.conn && !s._deleted)
          .forEach((s) => {
            if (seenConns.has(s.conn)) return;
            seenConns.add(s.conn);
            candidates.push({ label: s.authDir || 'session', conn: s.conn });
          });

        // Observacao: para evitar interromper sessões que estao apenas com QR/Pairing,
        // nao reiniciamos "pendingSessions" aqui (elas sao tratadas quando conectarem).

        console.log('[multiSession] Restart automático iniciando:', { total: candidates.length });

        // Stagger para evitar derrubar tudo ao mesmo tempo.
        candidates.forEach(({ label, conn }, n) => {
          setTimeout(() => {
            try {
              console.log('[multiSession] Restart sessão:', { label });
              if (typeof conn?.end === 'function') conn.end();
              else if (typeof conn?.logout === 'function') conn.logout();
            } catch (e) {
              console.error('[multiSession] Erro ao reiniciar sessão:', { label, error: e?.message || e });
            }
          }, n * 1500);
        });
      } finally {
        // Libera o lock depois de alguns minutos; o reconnect ocorre automaticamente pelos listeners.
        setTimeout(() => { restartLock = false }, Math.min(intervalMs, 2 * 60 * 1000));
      }
    }, intervalMs);
  }

  return { sessions };
}

const DISCONNECT_RESTART_REQUIRED = 515;

function startSessionServer(sessions, config) {
  const { getConnectionOptions, setupConn, onConnectionUpdate, makeWASocket, sessionsDir = '', apiSecretKey = '', maxSessions = Infinity, onSessionRegistered, onSessionDisconnected } = config;
  const serverCapacity = Number.isFinite(maxSessions) ? maxSessions : Infinity;

  function getSessionsLoggedCount() {
    return sessions.filter((s) => s && s.conn && !s._deleted).length;
  }

  function getSessionsPendingCount() {
    return pendingSessions.size;
  }

  function getSessionsOpenForConnection() {
    // "Aberto para conexão" = pendentes que ainda nao completaram login (QR/par de codigo).
    let open = 0;
    for (const p of pendingSessions.values()) {
      if (!p?.connected) open++;
    }
    return open;
  }

  function canCreateNewSession() {
    if (!Number.isFinite(serverCapacity)) return { ok: true };
    const logged = getSessionsLoggedCount();
    const pending = getSessionsPendingCount();
    const total = logged + pending;
    if (total >= serverCapacity) {
      return {
        ok: false,
        logged,
        pending,
        openForConnection: getSessionsOpenForConnection(),
        serverCapacity,
      };
    }
    return { ok: true, logged, pending, openForConnection: getSessionsOpenForConnection(), serverCapacity };
  }

  function getSessionPath(sessionName) {
    const safeName = String(sessionName || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!safeName) return null;
    return sessionsDir ? resolve(process.cwd(), sessionsDir, safeName) : resolve(process.cwd(), safeName);
  }

  function readMetajiSync(sessionPath) {
    try {
      const p = join(sessionPath, 'metaji.json');
      if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8'));
    } catch (_) {}
    return null;
  }

  function requireApiAuth(req) {
    if (!apiSecretKey) return { ok: false, code: 403, message: 'API desabilitada. Configure multiSession.apiSecretKey.' };
    const secret = req.headers['x-api-secret'] ?? req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (secret !== apiSecretKey) return { ok: false, code: 401, message: 'Chave de API invalida.' };
    return { ok: true };
  }

  function requireOwnerKey(sessionPath, req) {
    const metaji = readMetajiSync(sessionPath);
    if (!metaji?.ownerApiKey) return { ok: false, code: 403, message: 'Sessao sem ownerApiKey configurado em metaji.json.' };
    const key = req.headers['x-owner-api-key'] ?? req.headers['x-api-key'] ?? '';
    if (key !== metaji.ownerApiKey) return { ok: false, code: 403, message: 'Chave do dono nao confere com a sessao.' };
    return { ok: true };
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-secret, x-owner-api-key, x-api-key, Authorization',
  };

  function jsonResponse(res, code, data, extraHeaders = {}) {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders, ...extraHeaders });
    res.end(JSON.stringify(data));
  }

  function attachPendingListeners(conn, pending, safeName) {
    pending.conn = conn;
    if (conn.ev?.setMaxListeners) conn.ev.setMaxListeners(20);
    conn.ev.on('creds.update', async () => {
      try {
        await pending.saveCreds();
      } catch (e) {
        console.error('[multiSession] Erro ao salvar credenciais:', e?.message || e);
      }
    });
    conn.ev.on('connection.update', async (update) => {
      try {
        if (update.connection) console.log('[multiSession]', safeName, '->', update.connection);
        if (update.connection === 'close') {
          const err = update.lastDisconnect?.error;
          const code = err?.output?.statusCode ?? err?.output?.payload?.statusCode;
          const msg = err?.message || (err?.output?.payload?.message) || '';
          console.error('[multiSession]', safeName, 'fechou. Código:', code ?? '?', msg ? '| ' + msg : '');
          if (code === DISCONNECT_RESTART_REQUIRED && pendingSessions.get(safeName)) {
            console.log('[multiSession]', safeName, '-> reconectando em 3s (restart required)...');
            setTimeout(() => reconnectPendingSession(safeName), 3000);
            return;
          }
          if (pendingSessions.has(safeName)) {
            sessionLastErrors.set(safeName, {
              message: msg || 'Conexão encerrada.',
              code: code ?? null,
              at: new Date().toISOString(),
            });
            pendingSessions.delete(safeName);
          }
          return;
        }
        if (update.qr) pending.qr = update.qr;
            if (update.connection === 'open') {
              console.log('[multiSession] Sessão conectada:', safeName);
              pending.connected = true;
              pending.qr = null;
              const phoneNumber = conn?.user?.jid ? conn.user.jid.split('@')[0] : null;
              sessionLastErrors.delete(safeName);
              connectedSessionsInfo.set(safeName, {
                connectedAt: new Date().toISOString(),
                phoneNumber,
              });
              const idx = sessions.length;
              const authDir = sessionsDir ? join(sessionsDir, safeName) : safeName;
              sessions.push({
                authDir,
            state: pending.state,
            saveCreds: pending.saveCreds,
            conn: pending.conn,
            savedChats: null,
          });
              if (typeof onSessionRegistered === 'function') await Promise.resolve(onSessionRegistered(conn, authDir));
              registerSession(sessions[idx], sessions, idx, getConnectionOptions, setupConn, onConnectionUpdate, onSessionDisconnected, onSessionRegistered);
              pendingSessions.delete(safeName);
              if (typeof onConnectionUpdate === 'function') {
            const g = global;
            const prev = g.conn;
            g.conn = conn;
            try {
              onConnectionUpdate.call(conn, update);
            } finally {
              g.conn = prev;
            }
          }
        }
      } catch (err) {
        console.error('[multiSession] Erro em connection.update:', err?.message || err);
      }
    });
  }

  async function reconnectPendingSession(safeName) {
    if (!pendingSessions.has(safeName)) return;
    const pending = pendingSessions.get(safeName);
    try {
      const { useMultiFileAuthState } = await import('baileys');
      const authPath = sessionsDir ? resolve(process.cwd(), sessionsDir, safeName) : resolve(process.cwd(), safeName);
      const { state, saveCreds } = await useMultiFileAuthState(authPath);
      pending.state = state;
      pending.saveCreds = saveCreds;
      const getChats = () => ({});
      const baseOptions = getConnectionOptions(state, getChats);
      const options = {
        ...baseOptions,
        printQRInTerminal: false,
        mobile: false,
        browser: ['Chrome (Linux)', 'Chrome', '120.0'],
        msgRetryCounterCache: new Map(),
        userDevicesCache: new Map(),
      };
      const makeSocket = makeWASocket || (await import('baileys')).makeWASocket;
      const conn = makeSocket(options);
      attachPendingListeners(conn, pending, safeName);
    } catch (err) {
      console.error('[multiSession] Erro ao reconectar', safeName, ':', err?.message || err);
      pendingSessions.delete(safeName);
    }
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');
    const path = url.pathname.replace(/\/$/, '') || '/';
    const name = url.searchParams.get('name') || url.searchParams.get('session') || '';

    if (path === '/' || path === '') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getIndexHtml());
      return;
    }

    if (path === '/new' && (req.method === 'GET' || req.method === 'POST')) {
      const sessionName = name || `Session_${Date.now()}`;
      const safeName = sessionName.replace(/[^a-zA-Z0-9_-]/g, '_');
      if (pendingSessions.has(safeName)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(getQRPageHtml(safeName));
        return;
      }

      const allowed = canCreateNewSession();
      if (!allowed.ok) {
        res.writeHead(429, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(
          `<html><body style="font-family:system-ui;padding:2rem;max-width:520px;margin:0 auto;">` +
            `<h3>Limite de sessoes atingido</h3>` +
            `<p>O servidor suporta no maximo <b>${allowed.serverCapacity}</b> sessoes ativas.</p>` +
            `<p>Logadas: <b>${allowed.logged}</b> | Abertas para conexao: <b>${allowed.openForConnection}</b> | Pendentes total: <b>${allowed.pending}</b></p>` +
            `<p>Exclua alguma sessao antiga ou aguarde uma desconexao antes de criar outra.</p>` +
          `</body></html>`
        );
        return;
      }
      try {
        const { useMultiFileAuthState } = await import('baileys');
        const makeSocket = makeWASocket || (await import('baileys')).makeWASocket;
        const authPath = sessionsDir ? resolve(process.cwd(), sessionsDir, safeName) : resolve(process.cwd(), safeName);
        if (!existsSync(authPath)) mkdirSync(authPath, { recursive: true });
        const { state, saveCreds } = await useMultiFileAuthState(authPath);
        const getChats = () => ({});
        const baseOptions = getConnectionOptions(state, getChats);
        const options = {
          ...baseOptions,
          printQRInTerminal: false,
          mobile: false,
          browser: ['Chrome (Linux)', 'Chrome', '120.0'],
          msgRetryCounterCache: new Map(),
          userDevicesCache: new Map(),
        };
        const conn = makeSocket(options);
        const pending = { conn, state, saveCreds, qr: null, connected: false };
        pendingSessions.set(safeName, pending);
        attachPendingListeners(conn, pending, safeName);

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(getQRPageHtml(safeName));
      } catch (err) {
        console.error('[multiSession] Erro ao criar sessão:', err?.message);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Erro: ' + (err?.message || 'unknown'));
      }
      return;
    }

    const apiSessionsMatch = path.match(/^\/api\/sessions\/?$/);
    const apiSessionsHealthMatch = path === '/api/sessions/health' || path === '/api/sessions/health/';
    const apiSessionNameMatch = path.match(/^\/api\/sessions\/([^/]+)\/?$/);
    const apiSessionMetajiMatch = path.match(/^\/api\/sessions\/([^/]+)\/metaji\/?$/);
    const apiSessionStatusMatch = path.match(/^\/api\/sessions\/([^/]+)\/status\/?$/);

    if (path.startsWith('/api/')) {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, { ...corsHeaders, 'Content-Length': '0' });
        res.end();
        return;
      }
      const auth = requireApiAuth(req);
      if (!auth.ok) {
        jsonResponse(res, auth.code, { message: auth.message });
        return;
      }

      if (apiSessionsHealthMatch && req.method === 'GET') {
        // resumo de todas as sessoes conhecidas (ativas, pendentes ou com erro)
        const names = new Set();
        for (const s of sessions) {
          if (s?.authDir) {
            const parts = s.authDir.split(/[/\\]/);
            names.add(parts[parts.length - 1] || s.authDir);
          }
        }
        for (const key of pendingSessions.keys()) names.add(key);
        for (const key of connectedSessionsInfo.keys()) names.add(key);
        for (const key of sessionLastErrors.keys()) names.add(key);

        const result = [];
        for (const name of names) {
          const safeName = String(name || '').replace(/[^a-zA-Z0-9_-]/g, '_');
          if (!safeName) continue;
          const authDir = sessionsDir ? join(sessionsDir, safeName) : safeName;
          const isConnected = sessions.some(
            (s) => (s.authDir === authDir || s.authDir === safeName) && s.conn
          );
          const pending = pendingSessions.get(safeName);
          const connInfo = connectedSessionsInfo.get(safeName);
          const lastErr = sessionLastErrors.get(safeName);

          let status, loginStatus, message;
          if (isConnected) {
            status = 'connected';
            loginStatus = 'success';
            message = `Sessao ${safeName} efetuada com sucesso.`;
          } else if (pending) {
            status = pending.connected ? 'connected' : 'pending_qr';
            loginStatus = pending.connected ? 'success' : 'pending';
            message = pending.connected
              ? `Sessao ${safeName} conectada com sucesso.`
              : 'Aguardando escaneamento do QR code no WhatsApp.';
          } else if (lastErr) {
            status = 'error';
            loginStatus = 'error';
            message = lastErr.message || 'Sessao em erro. Exclua e crie uma nova.';
          } else if (connInfo) {
            status = 'connected';
            loginStatus = 'success';
            message = `Sessao ${safeName} conectada.`;
          } else {
            status = 'unknown';
            loginStatus = 'pending';
            message = 'Sessao nao encontrada ou ainda nao iniciada.';
          }

          result.push({
            sessionName: safeName,
            status,
            loginStatus,
            message,
            isActive: isConnected || Boolean(pending?.connected),
            lastError: lastErr
              ? { message: lastErr.message, code: lastErr.code, at: lastErr.at }
              : null,
            connectedAt: connInfo?.connectedAt || null,
          });
        }

        const capacityToReturn = Number.isFinite(serverCapacity) ? serverCapacity : null;
        const logged = getSessionsLoggedCount();
        const pending = getSessionsPendingCount();
        const openForConnection = getSessionsOpenForConnection();
        jsonResponse(res, 200, {
          serverCapacity: capacityToReturn,
          sessionsLogged: logged,
          sessionsPending: pending,
          sessionsOpenForConnection: openForConnection,
          sessions: result,
        });
        return;
      }

      if (apiSessionStatusMatch && req.method === 'GET') {
        const sessionName = apiSessionStatusMatch[1];
        const safeName = String(sessionName || '').replace(/[^a-zA-Z0-9_-]/g, '_');
        if (!safeName) {
          jsonResponse(res, 400, { message: 'Nome da sessao invalido.' });
          return;
        }
        const authDir = sessionsDir ? join(sessionsDir, safeName) : safeName;
        const isConnected = sessions.some(
          (s) => (s.authDir === authDir || s.authDir === safeName) && s.conn
        );
        const pending = pendingSessions.get(safeName);
        const connInfo = connectedSessionsInfo.get(safeName);
        const lastErr = sessionLastErrors.get(safeName);

        let status, loginStatus, message;
        if (isConnected) {
          status = 'connected';
          loginStatus = 'success';
          message = `Sessao ${safeName} efetuada com sucesso. Para testar use algum comando ou verifique o painel de status no menu.`;
        } else if (pending) {
          status = pending.connected ? 'connected' : 'pending_qr';
          loginStatus = pending.connected ? 'success' : 'pending';
          message = pending.connected
            ? `Sessao ${safeName} conectada com sucesso. Para testar use algum comando ou verifique o painel de status no menu.`
            : 'Aguardando escaneamento do QR code no WhatsApp.';
        } else if (lastErr) {
          status = 'error';
          loginStatus = 'error';
          message = lastErr.message || 'Sessao em erro. Exclua a sessao no painel e crie uma nova.';
        } else if (connInfo) {
          status = 'connected';
          loginStatus = 'success';
          message = `Sessao ${safeName} conectada. Para testar use algum comando ou verifique o painel de status no menu.`;
        } else {
          status = 'unknown';
          loginStatus = 'pending';
          message = 'Sessao nao encontrada ou ainda nao iniciada.';
        }

        const session = sessions.find(
          (s) => (s.authDir === authDir || s.authDir === safeName) && s.conn
        );
        const phoneNumber =
          session?.conn?.user?.jid?.split('@')[0] ||
          connInfo?.phoneNumber ||
          null;

        jsonResponse(res, 200, {
          sessionName: safeName,
          status,
          loginStatus,
          message,
          isActive: isConnected || Boolean(pending?.connected),
          phoneNumber,
          lastError: lastErr
            ? { message: lastErr.message, code: lastErr.code, at: lastErr.at }
            : null,
          connectedAt: connInfo?.connectedAt || null,
        });
        return;
      }

      if (apiSessionMetajiMatch && (req.method === 'GET' || req.method === 'PATCH')) {
        const sessionName = apiSessionMetajiMatch[1];
        const sessionPath = getSessionPath(sessionName);
        if (!sessionPath || !existsSync(sessionPath)) {
          jsonResponse(res, 404, { message: 'Sessao nao encontrada.' });
          return;
        }
        const ownerCheck = requireOwnerKey(sessionPath, req);
        if (!ownerCheck.ok) {
          jsonResponse(res, ownerCheck.code, { message: ownerCheck.message });
          return;
        }
        const metajiPath = join(sessionPath, 'metaji.json');
        if (req.method === 'GET') {
          try {
            const data = JSON.parse(readFileSync(metajiPath, 'utf8'));
            jsonResponse(res, 200, data);
          } catch (_) {
            jsonResponse(res, 404, { message: 'metaji.json nao encontrado.' });
          }
          return;
        }
        if (req.method === 'PATCH') {
          let body = '';
          for await (const chunk of req) body += chunk;
          try {
            const updates = JSON.parse(body || '{}');
            const current = existsSync(metajiPath) ? JSON.parse(readFileSync(metajiPath, 'utf8')) : {};
            const allowed = ['enabled', 'baseUrl', 'ownerApiKey', 'webhookToken', 'heartbeatIntervalMs', 'pluginVersion', 'brandingFooter'];
            const next = { ...current };
            for (const k of allowed) if (updates[k] !== undefined) next[k] = updates[k];
            writeFileSync(metajiPath, JSON.stringify(next, null, 2), 'utf8');
            jsonResponse(res, 200, { message: 'metaji.json atualizado.', config: next });
          } catch (e) {
            jsonResponse(res, 400, { message: 'Corpo JSON invalido.', error: String(e?.message || e) });
          }
          return;
        }
      }

      if (apiSessionNameMatch && req.method === 'DELETE') {
        const sessionName = apiSessionNameMatch[1];
        const safeName = String(sessionName || '').replace(/[^a-zA-Z0-9_-]/g, '_');
        const authDir = sessionsDir ? join(sessionsDir, safeName) : safeName;
        const force = url.searchParams.get('force') === 'true' || url.searchParams.get('force') === '1';
        const isConnected = sessions.some((s) => (s.authDir === authDir || s.authDir === sessionName) && s.conn);
        const sessionPath = getSessionPath(safeName);
        if (!sessionPath || !existsSync(sessionPath)) {
          jsonResponse(res, 404, { message: 'Sessao nao encontrada.' });
          return;
        }
        const ownerCheck = requireOwnerKey(sessionPath, req);
        if (!ownerCheck.ok) {
          jsonResponse(res, ownerCheck.code, { message: ownerCheck.message });
          return;
        }
        if (isConnected && !force) {
          jsonResponse(res, 409, { message: 'Impossivel remover: sessao esta conectada. Use ?force=true para excluir mesmo assim.' });
          return;
        }
        if (isConnected && force) {
          const session = sessions.find((s) => (s.authDir === authDir || s.authDir === sessionName) && s.conn);
          if (session) {
            session._deleted = true;
            if (typeof session.conn?.end === 'function') session.conn.end();
            else if (typeof session.conn?.logout === 'function') session.conn.logout();
            session.conn = null;
            connectedSessionsInfo.delete(safeName);
          }
        }
        try {
          rmSync(sessionPath, { recursive: true });
          jsonResponse(res, 200, { message: 'Sessao removida.', sessionName: safeName });
        } catch (e) {
          jsonResponse(res, 500, { message: 'Erro ao remover sessao.', error: String(e?.message || e) });
        }
        return;
      }

      if (apiSessionsMatch && req.method === 'POST') {
        let body = '';
        for await (const chunk of req) body += chunk;
        try {
          const data = JSON.parse(body || '{}');
          const sessionName = (data.name || data.session || '').trim() || `Session_${Date.now()}`;
          const safeName = sessionName.replace(/[^a-zA-Z0-9_-]/g, '_');
          if (!safeName) {
            jsonResponse(res, 400, { message: 'Nome da sessao invalido.' });
            return;
          }
          const authPath = sessionsDir ? resolve(process.cwd(), sessionsDir, safeName) : resolve(process.cwd(), safeName);
          console.log('[multiSession] POST /api/sessions -> create', {
            safeName,
            authPath,
          });
          if (existsSync(authPath) && existsSync(join(authPath, 'creds.json'))) {
            jsonResponse(res, 409, { message: 'Sessao ja existe e esta conectada.' });
            return;
          }
          if (pendingSessions.has(safeName)) {
            jsonResponse(res, 409, { message: 'Sessao ja esta sendo criada (QR pendente).' });
            return;
          }

          const allowed = canCreateNewSession();
          if (!allowed.ok) {
            jsonResponse(res, 429, {
              message: 'Limite maximo de sessoes atingido.',
              serverCapacity: allowed.serverCapacity,
              sessionsLogged: allowed.logged,
              sessionsPending: allowed.pending,
              sessionsOpenForConnection: allowed.openForConnection,
            });
            return;
          }
          const { useMultiFileAuthState } = await import('baileys');
          if (!existsSync(authPath)) mkdirSync(authPath, { recursive: true });
          const { state, saveCreds } = await useMultiFileAuthState(authPath);
          const getChats = () => ({});
          const baseOptions = getConnectionOptions(state, getChats);
          const makeSocket = makeWASocket || (await import('baileys')).makeWASocket;
          const conn = makeSocket({
            ...baseOptions,
            printQRInTerminal: false,
            mobile: false,
            browser: ['Chrome (Linux)', 'Chrome', '120.0'],
            msgRetryCounterCache: new Map(),
            userDevicesCache: new Map(),
          });
          const pending = { conn, state, saveCreds, qr: null, connected: false, pairingCode: null };
          pendingSessions.set(safeName, pending);
          attachPendingListeners(conn, pending, safeName);
          if (data.ownerApiKey) {
            const metajiPath = join(authPath, 'metaji.json');
            const metaji = {
              enabled: false,
              baseUrl: data.baseUrl || '',
              ownerApiKey: data.ownerApiKey,
              webhookToken: data.webhookToken || '',
              heartbeatIntervalMs: 30000,
              pluginVersion: 'themystic-webhook-v1',
              brandingFooter: '',
            };
            writeFileSync(metajiPath, JSON.stringify(metaji, null, 2), 'utf8');
          }
          let pairingCode = null;
          const rawPhone = (data.phoneNumber || data.phone || '').toString().trim();
          console.log('[multiSession] create-session payload', {
            safeName,
            hasOwnerApiKey: !!data.ownerApiKey,
            hasWebhookToken: !!data.webhookToken,
            rawPhone,
          });
          if (rawPhone) {
            try {
              if (conn.authState?.creds?.registered) {
                throw new Error('Sessao ja registrada. Exclua a sessao antes de gerar um novo codigo.');
              }
              // Versao mais permissiva: so exige digitos. Se quiser DDI, o painel pode orientar o usuario.
              let numero = rawPhone.replace(/[^0-9]/g, '');
              if (!numero) {
                throw new Error('Numero de WhatsApp invalido. Informe apenas numeros, ex: 45998331383 ou +5511999999999.');
              }
              console.log('[multiSession] requesting pairing code', { safeName, numero });
              pairingCode = await conn.requestPairingCode(numero);
              console.log('[multiSession] raw pairing code result', { safeName, pairingCode });
              pairingCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode;
              if (!pairingCode) {
                throw new Error('Nao foi possivel gerar o codigo de emparelhamento.');
              }
              pending.pairingCode = pairingCode;
            } catch (e) {
              // Se falhar ao gerar codigo, nao cair para fluxo de QR: retorna erro claro.
              console.error('[multiSession] erro ao gerar codigo de emparelhamento', safeName, e?.message || e);
              pendingSessions.delete(safeName);
              try {
                if (typeof conn?.end === 'function') conn.end();
                else if (typeof conn?.logout === 'function') conn.logout();
              } catch {}
              jsonResponse(res, 400, {
                message: e?.message || 'Erro ao gerar codigo de emparelhamento.',
              });
              return;
            }
          }
          jsonResponse(res, 201, {
            message: pairingCode
              ? 'Sessao criada. Use o codigo de emparelhamento no WhatsApp.'
              : 'Sessao criada. Escaneie o QR em GET /qr/' + safeName,
            sessionName: safeName,
            qrUrl: pairingCode ? null : '/qr/' + safeName,
            statusUrl: '/api/sessions/' + safeName + '/status',
            loginStatus: 'pending',
            loginMethod: pairingCode ? 'pairing_code' : 'qr',
            pairingCode: pairingCode || null,
            hint: pairingCode
              ? 'No WhatsApp, use o codigo de emparelhamento exibido no painel para conectar esta sessao.'
              : 'Apos escanear o QR, a sessao ficara ativa. Para conferir o status, consulte /api/sessions/' + safeName + '/status',
          });
        } catch (e) {
          jsonResponse(res, 400, { message: 'Erro ao criar sessao.', error: String(e?.message || e) });
        }
        return;
      }

      jsonResponse(res, 404, { message: 'Rota nao encontrada.' });
      return;
    }

    const qrMatch = path.match(/^\/qr\/(.+)$/);
    if (qrMatch) {
      const sessionName = qrMatch[1];
      const pending = pendingSessions.get(sessionName);
      const authDir = sessionsDir ? join(sessionsDir, sessionName) : sessionName;
      const session = sessions.find(s => s.conn && (s.authDir === authDir || s.authDir === sessionName));
      if (session && session.conn) {
        const phoneNumber = session.conn?.user?.jid?.split('@')[0] || null;
        const connInfo = connectedSessionsInfo.get(sessionName);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders });
        res.end(JSON.stringify({
          status: 'connected',
          sessionName,
          loginStatus: 'success',
          isActive: true,
          phoneNumber,
          message: `Sessao ${sessionName} efetuada com sucesso. Para testar use algum comando ou verifique o painel de status no menu.`,
          connectedAt: connInfo?.connectedAt || new Date().toISOString(),
        }));
        return;
      }
      if (pending?.connected) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders });
        res.end(JSON.stringify({
          status: 'connected',
          sessionName,
          loginStatus: 'success',
          isActive: true,
          message: `Sessao ${sessionName} efetuada com sucesso. Para testar use algum comando ou verifique o painel de status no menu.`,
        }));
        return;
      }
      if (pending && pending.qr) {
        try {
          const qrModule = await import('qrcode');
          const QRCode = qrModule.default || qrModule;
          const buffer = await QRCode.toBuffer(pending.qr, { type: 'png', margin: 2 });
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(buffer);
        } catch (_) {
          res.writeHead(500);
          res.end();
        }
        return;
      }
      res.writeHead(204);
      res.end();
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  const port = config.serverPort || 3456;
  server.setMaxListeners(20);
  server.on('error', (err) => {
    console.error('[multiSession] Erro ao subir servidor na porta ' + port + ':', err.message);
  });
  server.listen(port, '0.0.0.0', () => {
    console.log('[multiSession] Servidor de novas sessões ativo: http://127.0.0.1:' + port);
  });
}

function getIndexHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Nova sessão</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; max-width: 420px; margin: 2rem auto; padding: 1rem; }
    h1 { font-size: 1.25rem; }
    input { width: 100%; padding: 0.5rem; margin: 0.5rem 0; border: 1px solid #ccc; border-radius: 4px; }
    button { width: 100%; padding: 0.75rem; background: #25D366; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
    button:hover { opacity: 0.9; }
    .hint { font-size: 0.875rem; color: #666; margin-top: 1rem; }
  </style>
</head>
<body>
  <h1>Adicionar sessão WhatsApp</h1>
  <form action="/new" method="get">
    <label>Nome da sessão (pasta de auth)</label>
    <input type="text" name="name" placeholder="Ex: Sessao2" value="">
    <button type="submit">Criar e mostrar QR</button>
  </form>
  <p class="hint">Abra o WhatsApp no celular → Dispositivos vinculados → Vincular dispositivo e escaneie o QR que aparecer na próxima tela.</p>
</body>
</html>`;
}

function getQRPageHtml(sessionName) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QR - ${sessionName}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; max-width: 360px; margin: 2rem auto; padding: 1rem; text-align: center; }
    h1 { font-size: 1.1rem; }
    #qr { max-width: 280px; height: auto; margin: 1rem auto; border: 1px solid #eee; border-radius: 8px; }
    #status { margin-top: 1rem; font-weight: bold; color: #25D366; }
    .loading { color: #666; }
    a { display: inline-block; margin-top: 1rem; color: #25D366; }
  </style>
</head>
<body>
  <h1>Sessão: ${sessionName}</h1>
  <p id="status" class="loading">Carregando QR...</p>
  <img id="qr" alt="QR Code" style="display:none;">
  <br><a href="/">← Voltar</a>
  <script>
    const name = ${JSON.stringify(sessionName)};
    const img = document.getElementById('qr');
    const status = document.getElementById('status');
    function tick() {
      fetch('/qr/' + name).then(r => {
        if (r.status === 204) { status.textContent = 'Aguardando QR...'; setTimeout(tick, 2000); return; }
        if (r.headers.get('content-type')?.includes('json')) {
          r.json().then(() => { status.textContent = 'Conectado!'; img.style.display = 'none'; });
          return;
        }
        return r.blob();
      }).then(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        img.src = url;
        img.style.display = 'block';
        status.textContent = 'Escaneie o QR no WhatsApp';
        setTimeout(tick, 2000);
      }).catch(() => setTimeout(tick, 3000));
    }
    tick();
  </script>
</body>
</html>`;
}

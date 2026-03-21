process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import './api.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, readFileSync, writeFileSync, copyFileSync, watch, mkdirSync } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { format } from 'util';
import pino from 'pino';
import Pino from 'pino';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './src/libraries/simple.js';
import {
  sendMetajiConnectionEvent,
  sendMetajiExecutionLog,
  startMetajiHeartbeat,
  stopMetajiHeartbeat,
  syncMetajiRemoteBotApiConfig,
  syncMetajiRemoteBotConfig
} from './src/libraries/metajiWebhook.js';
import { initializeSubBots } from './src/libraries/subBotManager.js';
import { Low, JSONFile } from 'lowdb';
import store from './src/libraries/store.js';
import LidResolver from './src/libraries/LidResolver.js';

const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } = await import("baileys");
import readline from 'readline';
import NodeCache from 'node-cache';
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
let stopped = 'close';
protoType();
serialize();
const msgRetryCounterMap = new Map();
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
}; global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};
global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');
global.timestamp = { start: new Date };
global.videoList = [];
global.videoListXXX = [];
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[#!/.]')
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`));

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async function () {
      if (!global.db.READ) {
        clearInterval(this);
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
      }
    }, 1 * 1000));
  }
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = chain(global.db.data);
};
loadDatabase();

/* ------------------------------------------------*/

/**
 * Clase auxiliar para acceso a datos LID desde JSON
 */
class LidDataManager {
  constructor(cacheFile = './src/lidsresolve.json') {
    this.cacheFile = cacheFile;
  }

  /**
   * Cargar datos del archivo JSON
   */
  loadData() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error('❌ Error cargando cache LID:', error.message);
      return {};
    }
  }

  /**
   * Obtener información de usuario por LID
   */
  getUserInfo(lidNumber) {
    const data = this.loadData();
    return data[lidNumber] || null;
  }

  /**
   * Obtener información de usuario por JID
   */
  getUserInfoByJid(jid) {
    const data = this.loadData();
    for (const [key, entry] of Object.entries(data)) {
      if (entry && entry.jid === jid) {
        return entry;
      }
    }
    return null;
  }

  /**
   * Encontrar LID por JID
   */
  findLidByJid(jid) {
    const data = this.loadData();
    for (const [key, entry] of Object.entries(data)) {
      if (entry && entry.jid === jid) {
        return entry.lid;
      }
    }
    return null;
  }

  /**
   * Listar todos los usuarios válidos
   */
  getAllUsers() {
    const data = this.loadData();
    const users = [];
    
    for (const [key, entry] of Object.entries(data)) {
      if (entry && !entry.notFound && !entry.error) {
        users.push({
          lid: entry.lid,
          jid: entry.jid,
          name: entry.name,
          country: entry.country,
          phoneNumber: entry.phoneNumber,
          isPhoneDetected: entry.phoneDetected || entry.corrected,
          timestamp: new Date(entry.timestamp).toLocaleString()
        });
      }
    }
    
    return users.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    const data = this.loadData();
    let valid = 0, notFound = 0, errors = 0, phoneNumbers = 0, corrected = 0;
    
    for (const [key, entry] of Object.entries(data)) {
      if (entry) {
        if (entry.phoneDetected || entry.corrected) phoneNumbers++;
        if (entry.corrected) corrected++;
        if (entry.notFound) notFound++;
        else if (entry.error) errors++;
        else valid++;
      }
    }
    
    return {
      total: Object.keys(data).length,
      valid,
      notFound,
      errors,
      phoneNumbers,
      corrected,
      cacheFile: this.cacheFile,
      fileExists: fs.existsSync(this.cacheFile)
    };
  }

  /**
   * Obtener usuarios por país
   */
  getUsersByCountry() {
    const data = this.loadData();
    const countries = {};
    
    for (const [key, entry] of Object.entries(data)) {
      if (entry && !entry.notFound && !entry.error && entry.country) {
        if (!countries[entry.country]) {
          countries[entry.country] = [];
        }
        
        countries[entry.country].push({
          lid: entry.lid,
          jid: entry.jid,
          name: entry.name,
          phoneNumber: entry.phoneNumber
        });
      }
    }
    
    // Ordenar usuarios dentro de cada país
    for (const country of Object.keys(countries)) {
      countries[country].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return countries;
  }
}

// Instancia del manejador de datos LID
const lidDataManager = new LidDataManager();

/**
 * FUNCIÓN MEJORADA: Procesar texto para resolver LIDs - VERSION MÁS ROBUSTA
 */
async function processTextMentions(text, groupId, lidResolver) {
  if (!text || !groupId || !text.includes('@')) return text;
  
  try {
    // Regex más completa para capturar diferentes formatos de mención
    const mentionRegex = /@(\d{8,20})/g;
    const mentions = [...text.matchAll(mentionRegex)];

    if (!mentions.length) return text;

    let processedText = text;
    const processedMentions = new Set();
    const replacements = new Map(); // Cache de reemplazos para este texto

    // Procesar todas las menciones primero
    for (const mention of mentions) {
      const [fullMatch, lidNumber] = mention;
      
      if (processedMentions.has(lidNumber)) continue;
      processedMentions.add(lidNumber);
      
      const lidJid = `${lidNumber}@lid`;

      try {
        const resolvedJid = await lidResolver.resolveLid(lidJid, groupId);
        
        if (resolvedJid && resolvedJid !== lidJid && !resolvedJid.endsWith('@lid')) {
          const resolvedNumber = resolvedJid.split('@')[0];
          
          // Validar que el número resuelto sea diferente al LID original
          if (resolvedNumber && resolvedNumber !== lidNumber) {
            replacements.set(lidNumber, resolvedNumber);
          }
        }
      } catch (error) {
        console.error(`❌ Error procesando mención LID ${lidNumber}:`, error.message);
      }
    }

    // Aplicar todos los reemplazos
    for (const [lidNumber, resolvedNumber] of replacements.entries()) {
      // Usar regex global para reemplazar TODAS las ocurrencias
      const globalRegex = new RegExp(`@${lidNumber}\\b`, 'g'); // \\b para límite de palabra
      processedText = processedText.replace(globalRegex, `@${resolvedNumber}`);
    }

    return processedText;
  } catch (error) {
    console.error('❌ Error en processTextMentions:', error);
    return text;
  }
}

/**
 * FUNCIÓN AUXILIAR: Procesar contenido de mensaje recursivamente
 */
async function processMessageContent(messageContent, groupChatId, lidResolver) {
  if (!messageContent || typeof messageContent !== 'object') return;

  const messageTypes = Object.keys(messageContent);
  
  for (const msgType of messageTypes) {
    const msgContent = messageContent[msgType];
    if (!msgContent || typeof msgContent !== 'object') continue;

    // Procesar texto principal
    if (typeof msgContent.text === 'string') {
      try {
        const originalText = msgContent.text;
        msgContent.text = await processTextMentions(originalText, groupChatId, lidResolver);
      } catch (error) {
        console.error('❌ Error procesando texto:', error);
      }
    }

    // Procesar caption
    if (typeof msgContent.caption === 'string') {
      try {
        const originalCaption = msgContent.caption;
        msgContent.caption = await processTextMentions(originalCaption, groupChatId, lidResolver);
      } catch (error) {
        console.error('❌ Error procesando caption:', error);
      }
    }

    // Procesar contextInfo
    if (msgContent.contextInfo) {
      await processContextInfo(msgContent.contextInfo, groupChatId, lidResolver);
    }
  }
}

/**
 * FUNCIÓN AUXILIAR: Procesar contextInfo recursivamente
 */
async function processContextInfo(contextInfo, groupChatId, lidResolver) {
  if (!contextInfo || typeof contextInfo !== 'object') return;

  // Procesar mentionedJid en contextInfo
  if (contextInfo.mentionedJid && Array.isArray(contextInfo.mentionedJid)) {
    const resolvedMentions = [];
    for (const jid of contextInfo.mentionedJid) {
      if (typeof jid === 'string' && jid.endsWith?.('@lid')) {
        try {
          const resolved = await lidResolver.resolveLid(jid, groupChatId);
          resolvedMentions.push(resolved && !resolved.endsWith('@lid') ? resolved : jid);
        } catch (error) {
          resolvedMentions.push(jid);
        }
      } else {
        resolvedMentions.push(jid);
      }
    }
    contextInfo.mentionedJid = resolvedMentions;
  }

  // Procesar participant en contextInfo
  if (typeof contextInfo.participant === 'string' && contextInfo.participant.endsWith?.('@lid')) {
    try {
      const resolved = await lidResolver.resolveLid(contextInfo.participant, groupChatId);
      if (resolved && !resolved.endsWith('@lid')) {
        contextInfo.participant = resolved;
      }
    } catch (error) {
      console.error('❌ Error resolviendo participant en contextInfo:', error);
    }
  }

  // Procesar mensajes citados recursivamente
  if (contextInfo.quotedMessage) {
    await processMessageContent(contextInfo.quotedMessage, groupChatId, lidResolver);
  }

  // Procesar otros campos que puedan contener texto
  if (typeof contextInfo.stanzaId === 'string') {
    contextInfo.stanzaId = await processTextMentions(contextInfo.stanzaId, groupChatId, lidResolver);
  }
}

/**
 * FUNCIÓN MEJORADA: Procesar mensaje completo de forma más exhaustiva
 */
async function processMessageForDisplay(message, lidResolver) {
  if (!message || !lidResolver) return message;
  
  try {
    const processedMessage = JSON.parse(JSON.stringify(message)); // Deep copy
    const groupChatId = message.key?.remoteJid?.endsWith?.('@g.us') ? message.key.remoteJid : null;
    
    if (!groupChatId) return processedMessage;

    // 1. Resolver participant LID
    if (processedMessage.key?.participant?.endsWith?.('@lid')) {
      try {
        const resolved = await lidResolver.resolveLid(processedMessage.key.participant, groupChatId);
        if (resolved && resolved !== processedMessage.key.participant && !resolved.endsWith('@lid')) {
          processedMessage.key.participant = resolved;
        }
      } catch (error) {
        console.error('❌ Error resolviendo participant:', error);
      }
    }

    // 2. Procesar mentionedJid a nivel raíz
    if (processedMessage.mentionedJid && Array.isArray(processedMessage.mentionedJid)) {
      const resolvedMentions = [];
      for (const jid of processedMessage.mentionedJid) {
        if (typeof jid === 'string' && jid.endsWith?.('@lid')) {
          try {
            const resolved = await lidResolver.resolveLid(jid, groupChatId);
            resolvedMentions.push(resolved && !resolved.endsWith('@lid') ? resolved : jid);
          } catch (error) {
            resolvedMentions.push(jid);
          }
        } else {
          resolvedMentions.push(jid);
        }
      }
      processedMessage.mentionedJid = resolvedMentions;
    }

    // 3. Procesar el contenido del mensaje
    if (processedMessage.message) {
      await processMessageContent(processedMessage.message, groupChatId, lidResolver);
    }

    return processedMessage;
  } catch (error) {
    console.error('❌ Error procesando mensaje para display:', error);
    return message;
  }
}

/**
 * FUNCIÓN AUXILIAR: Extraer todo el texto de un mensaje para debugging
 */
function extractAllText(message) {
  if (!message?.message) return '';
  
  let allText = '';
  
  const extractFromContent = (content) => {
    if (!content) return '';
    let text = '';
    
    if (content.text) text += content.text + ' ';
    if (content.caption) text += content.caption + ' ';
    
    if (content.contextInfo?.quotedMessage) {
      const quotedTypes = Object.keys(content.contextInfo.quotedMessage);
      for (const quotedType of quotedTypes) {
        const quotedContent = content.contextInfo.quotedMessage[quotedType];
        text += extractFromContent(quotedContent);
      }
    }
    
    return text;
  };
  
  const messageTypes = Object.keys(message.message);
  for (const msgType of messageTypes) {
    allText += extractFromContent(message.message[msgType]);
  }
  
  return allText.trim();
}

/**
 * FUNCIÓN MEJORADA: Interceptar mensajes con mejor manejo de errores
 */
async function interceptMessages(messages, lidResolver) {
  if (!Array.isArray(messages)) return messages;

  const processedMessages = [];
  
  for (const message of messages) {
    try {
      // Procesar con lidResolver si existe
      let processedMessage = message;
      
      if (lidResolver && typeof lidResolver.processMessage === 'function') {
        try {
          processedMessage = await lidResolver.processMessage(message);
        } catch (error) {
          console.error('❌ Error en lidResolver.processMessage:', error);
          // Continuar con el procesamiento manual
        }
      }
      
      // Procesamiento adicional para display
      processedMessage = await processMessageForDisplay(processedMessage, lidResolver);
      
      processedMessages.push(processedMessage);
    } catch (error) {
      console.error('❌ Error interceptando mensaje:', error);
      processedMessages.push(message);
    }
  }

  return processedMessages;
}

const lidResolverMap = new Map();
let lidResolver = null;

let state, saveCreds;
if (global.multiSession?.enabled) {
  global.__multiSessionPending = true;
} else {
  const auth = await useMultiFileAuthState(global.authFile);
  state = auth.state;
  saveCreds = auth.saveCreds;
}
if (!global.multiSession?.enabled) {
const version22 = await fetchLatestBaileysVersion();
console.log(version22)
const version = version22?.version || [2, 3000, 1033893291];
let phoneNumber = global.botnumber || process.argv.find(arg => arg.startsWith('--phone='))?.split('=')[1];
const methodCodeQR = process.argv.includes('--method=qr');
const methodCode = !!phoneNumber || process.argv.includes('--method=code');
const MethodMobile = process.argv.includes("mobile");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

let opcion;
if (methodCodeQR) opcion = '1';
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.authFile}/creds.json`)) {
  do {
    opcion = await question('[ ℹ️ ] Seleccione una opción:\n1. Con código QR\n2. Con código de texto de 8 dígitos\n---> ');
    if (!/^[1-2]$/.test(opcion)) {
      console.log('[ ⚠️ ] Por favor, seleccione solo 1 o 2.\n');
    }
  } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${global.authFile}/creds.json`));
}

const filterStrings = [
  "Q2xvc2luZyBzdGFsZSBvcGVu",
  "Q2xvc2luZyBvcGVuIHNlc3Npb24=",
  "RmFpbGVkIHRvIGRlY3J5cHQ=",
  "U2Vzc2lvbiBlcnJvcg==",
  "RXJyb3I6IEJhZCBNQUM=",
  "RGVjcnlwdGVkIG1lc3NhZ2U="
];

console.info = () => { };
console.debug = () => { };
['log', 'warn', 'error'].forEach(methodName => {
  const originalMethod = console[methodName];
  console[methodName] = function () {
    const message = arguments[0];
    if (typeof message === 'string' && filterStrings.some(filterString => message.includes(Buffer.from(filterString, 'base64').toString()))) {
      arguments[0] = "";
    }
    originalMethod.apply(console, arguments);
  };
});

process.on('uncaughtException', (err) => {
  if (filterStrings.includes(Buffer.from(err.message).toString('base64'))) return;
  console.error('Uncaught Exception:', err);
});

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
  mobile: MethodMobile,
  browser: opcion === '1' ? ['TheMystic-Bot-MD', 'Safari', '2.0.0'] : methodCodeQR ? ['TheMystic-Bot-MD', 'Safari', '2.0.0'] : ['Ubuntu', 'Chrome', '20.0.04'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: false,
  getMessage: async (key) => {
    try {
      let jid = jidNormalizedUser(key.remoteJid);
      let msg = await store.loadMessage(jid, key.id);
      return msg?.message || "";
    } catch (error) {
      return "";
    }
  },
  msgRetryCounterCache: msgRetryCounterCache || new Map(),
  userDevicesCache: userDevicesCache || new Map(),
  defaultQueryTimeoutMs: undefined,
  cachedGroupMetadata: (jid) => global.conn.chats[jid] ?? {},
  keepAliveIntervalMs: 55000,
  maxIdleTimeMs: 60000,
  version,
};
global.connectionOptions = connectionOptions;

global.conn = makeWASocket(connectionOptions);
let conn = global.conn;
lidResolverMap.set(global.conn, new LidResolver(global.conn));
lidResolver = lidResolverMap.get(global.conn);

// Ejecutar análisis y corrección automática al inicializar (SILENCIOSO)
setTimeout(async () => {
  try {
    if (lidResolver) {
      // Ejecutar corrección automática de números telefónicos (sin logs)
      lidResolver.autoCorrectPhoneNumbers();
    }
  } catch (error) {
    console.error('❌ Error en análisis inicial:', error.message);
  }
}, 5000);

if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2';
    if (!conn.authState.creds.registered) {
      if (MethodMobile) throw new Error('No se puede usar un código de emparejamiento con la API móvil');

      let numeroTelefono;
      if (!!phoneNumber) {
        numeroTelefono = phoneNumber.replace(/[^0-9]/g, '');
        if (!Object.keys(PHONENUMBER_MCC).some(v => numeroTelefono.startsWith(v))) {
          console.log(chalk.bgBlack(chalk.bold.redBright("Comience con el código de país de su número de WhatsApp.\nEjemplo: +5219992095479\n")));
          process.exit(0);
        }
      } else {
        while (true) {
          numeroTelefono = await question(chalk.bgBlack(chalk.bold.yellowBright('Por favor, escriba su número de WhatsApp.\nEjemplo: +5219992095479\n')));
          numeroTelefono = numeroTelefono.replace(/[^0-9]/g, '');
          if (numeroTelefono.match(/^\d+$/) && Object.keys(PHONENUMBER_MCC).some(v => numeroTelefono.startsWith(v))) break;
          console.log(chalk.bgBlack(chalk.bold.redBright("Por favor, escriba su número de WhatsApp.\nEjemplo: +5219992095479.\n")));
        }
        rl.close();
      }

      setTimeout(async () => {
        try {
          console.log(chalk.cyan('[ DEBUG ] Generando código de emparejamiento...'), {
            numeroTelefono,
            registered: conn.authState?.creds?.registered,
          });
          let codigo = await conn.requestPairingCode(numeroTelefono);
          console.log(chalk.cyan('[ DEBUG ] Codigo bruto de emparejamiento:'), codigo);
          codigo = codigo?.match(/.{1,4}/g)?.join("-") || codigo;
          if (!codigo) {
            console.log(chalk.bgRed(chalk.white.bold('[ ERRO ] Nao foi possivel gerar o codigo de emparelhamento (codigo vazio).')));
            return;
          }
          console.log(chalk.yellow('[ ℹ️ ] introduce el código de emparejamiento en WhatsApp.'));
          console.log(chalk.black(chalk.bgGreen(`Su código de emparejamiento: `)), chalk.black(chalk.white(codigo)));
        } catch (err) {
          console.log(chalk.bgRed(chalk.white.bold('[ ERRO ] Falha ao gerar codigo de emparelhamento:')), err?.message || err);
        }
      }, 3000);
    }
  }
}

conn.isInit = false;
conn.well = false;
conn.logger.info(`[　ℹ️　] Cargando...\n`);
}

if (global.__multiSessionPending) {
  const { pathToFileURL } = await import('url');
  const { existsSync } = await import('fs');
  const { join, dirname } = await import('path');
  const { fileURLToPath } = await import('url');
  const __dirnameMain = dirname(fileURLToPath(import.meta.url));
  const obfuscatedPath = join(__dirnameMain, 'dist', 'multiSessionManager.obfuscated.js');
  const normalPath = join(__dirnameMain, 'src', 'libraries', 'multiSessionManager.js');
  const restartMinutes = Number(process.env.METAJI_SESSIONS_RESTART_MINUTES || 0);
  const forceSrc = String(process.env.METAJI_FORCE_MULTISESSION_SRC || '').toLowerCase() === '1';
  // Para garantir que a lógica do restart automático esteja presente (sem depender da dist ofuscada).
  const managerModulePath = (forceSrc || restartMinutes > 0) && existsSync(normalPath)
    ? pathToFileURL(normalPath).href
    : (existsSync(obfuscatedPath) ? pathToFileURL(obfuscatedPath).href : pathToFileURL(normalPath).href);
  const { startMultiSession } = await import(managerModulePath);
  const handlerModule = await import('./handler.js');

  const { AsyncLocalStorage } = await import('async_hooks');
  const asyncLocalStorage = new AsyncLocalStorage();
  const sessionContextMap = new Map();
  global.__sessionContextMap = sessionContextMap;
  global.__multiSessionGetStore = () => asyncLocalStorage.getStore();
  let _defaultDb = global.db;
  let _defaultOwner = Array.isArray(global.owner) ? [...global.owner] : global.owner;
  let _defaultAPIs = typeof global.APIs === 'object' && global.APIs ? { ...global.APIs } : {};
  let _defaultAPIKeys = typeof global.APIKeys === 'object' && global.APIKeys ? { ...global.APIKeys } : {};
  let _defaultOpts = global.opts;
  let _defaultPrefix = global.prefix;

  const SESSION_GLOBAL_KEYS = [
    'owner', 'opts', 'prefix', 'APIs', 'APIKeys',
    'packname', 'author', 'wm', 'titulowm', 'titulowm2', 'igfg', 'wait', 'defaultLenguaje', 'isBaileysFail',
    'suittag', 'prems', 'BASE_API_DELIRIUS', 'metajiApi', 'nomorown',
    'imagen1', 'imagen2', 'imagen3', 'imagen4', 'imagen5', 'mods',
    'd', 'locale', 'dia', 'fecha', 'mes', 'año', 'tiempo', 'wm2', 'gt', 'mysticbot', 'channel', 'md',
    'waitt', 'waittt', 'waitttt', 'pdoc', 'cmenut', 'cmenub', 'cmenuf', 'cmenua',
    'dmenut', 'dmenub', 'dmenub2', 'dmenuf', 'htjava', 'htki', 'htka', 'comienzo', 'fin',
    'botdate', 'bottime', 'fgif', 'multiplier', 'flaaa',
    'openai_key', 'openai_org_id', 'MyApiRestBaseUrl', 'MyApiRestApikey', 'MyApiRestBaseUrl2', 'MyApiRestBaseUrl3',
    'keysZens', 'keysxxx', 'keysxteammm', 'keysxteam', 'keysneoxrrr', 'keysneoxr', 'lolkeysapi', 'itsrose',
    'cheerio', 'fs', 'fetch', 'axios', 'moment', 'rpg', 'rpgg', 'rpgshop', 'rpgshopp',
  ];
  const _defaultSessionGlobals = { db: _defaultDb };
  for (const k of SESSION_GLOBAL_KEYS) {
    try {
      const v = global[k];
      _defaultSessionGlobals[k] = v === undefined ? undefined : (Array.isArray(v) ? [...v] : (typeof v === 'object' && v !== null && !(v instanceof RegExp) && !Buffer.isBuffer(v) ? { ...v } : v));
    } catch (_) {
      _defaultSessionGlobals[k] = global[k];
    }
  }

  function defineSessionGetter(key) {
    const def = _defaultSessionGlobals[key];
    Object.defineProperty(global, key, {
      get() {
        const s = asyncLocalStorage.getStore();
        if (s && key in s) return s[key];
        return def;
      },
      configurable: true,
      enumerable: true,
    });
  }

  function restoreSessionGetters() {
    defineSessionGetter('db');
    defineSessionGetter('owner');
    defineSessionGetter('APIs');
    defineSessionGetter('APIKeys');
    defineSessionGetter('opts');
    defineSessionGetter('prefix');
    for (const k of SESSION_GLOBAL_KEYS) {
      if (['db', 'owner', 'APIs', 'APIKeys', 'opts', 'prefix'].includes(k)) continue;
      defineSessionGetter(k);
    }
  }

  function defineSessionGetters() {
    restoreSessionGetters();
  }

  function makeGlobalsWritableForImport() {
    for (const k of SESSION_GLOBAL_KEYS) {
      try {
        const v = global[k];
        Object.defineProperty(global, k, {
          value: v,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } catch (_) {}
    }
  }

  function fixSessionJsImports(content) {
    if (typeof content !== 'string') return content;
    return content.replace(/from\s+'\.\/src\//g, "from '../../src/").replace(/from\s+"\.\/src\//g, 'from "../../src/');
  }

  async function buildSessionContext(authDir) {
    const basePath = join(__dirnameMain, authDir);
    const dbPath = join(basePath, 'database.json');
    const db = new Low(new JSONFile(dbPath));
    const ctx = { db, owner: _defaultOwner, APIs: _defaultAPIs, APIKeys: _defaultAPIKeys, opts: _defaultOpts, prefix: _defaultPrefix };
    for (const k of SESSION_GLOBAL_KEYS) {
      if (k !== 'db' && _defaultSessionGlobals[k] !== undefined) ctx[k] = _defaultSessionGlobals[k];
    }
    const configJsPath = join(basePath, 'config.js');
    const apiJsPath = join(basePath, 'api.js');
    try {
      if (existsSync(configJsPath)) {
        const savedMultiSession = global.multiSession;
        makeGlobalsWritableForImport();
        await import(pathToFileURL(configJsPath).href);
        for (const k of SESSION_GLOBAL_KEYS) {
          if (global[k] !== undefined) ctx[k] = global[k];
        }
        restoreSessionGetters();
        global.multiSession = savedMultiSession;
      }
    } catch (e) {
      restoreSessionGetters();
      if (!String(e?.message || e).includes('Cannot find module')) console.error('[multiSession] Erro ao carregar config.js da sessão:', authDir, e?.message);
    }
    try {
      const configPath = join(basePath, 'config.json');
      if (existsSync(configPath)) {
        const cfg = JSON.parse(readFileSync(configPath, 'utf8'));
        if (cfg.owner != null) ctx.owner = cfg.owner;
        if (cfg.opts != null) ctx.opts = cfg.opts;
        if (cfg.prefix != null) ctx.prefix = typeof cfg.prefix === 'string' ? new RegExp(cfg.prefix) : cfg.prefix;
        for (const k of SESSION_GLOBAL_KEYS) {
          if (k === 'db' || k === 'owner' || k === 'opts' || k === 'prefix') continue;
          if (cfg[k] !== undefined) ctx[k] = cfg[k];
        }
      }
    } catch (_) {}
    try {
      if (existsSync(apiJsPath)) {
        makeGlobalsWritableForImport();
        await import(pathToFileURL(apiJsPath).href);
        for (const k of SESSION_GLOBAL_KEYS) {
          if (global[k] !== undefined) ctx[k] = global[k];
        }
        restoreSessionGetters();
      }
    } catch (e) {
      restoreSessionGetters();
      if (!String(e?.message || e).includes('Cannot find module')) console.error('[multiSession] Erro ao carregar api.js da sessão:', authDir, e?.message);
    }
    try {
      const apiPath = join(basePath, 'api.json');
      if (existsSync(apiPath)) {
        const api = JSON.parse(readFileSync(apiPath, 'utf8'));
        if (api.APIs != null) ctx.APIs = api.APIs;
        if (api.APIKeys != null) ctx.APIKeys = api.APIKeys;
        for (const k of SESSION_GLOBAL_KEYS) {
          if (k === 'db' || k === 'APIs' || k === 'APIKeys') continue;
          if (api[k] !== undefined) ctx[k] = api[k];
        }
      }
    } catch (_) {}
    ctx._authDir = authDir;
    return ctx;
  }

  const METAJI_JSON_DEFAULTS = {
    enabled: true,
    baseUrl: 'https://api.metaji.com.br',
    ownerApiKey: '',
    webhookToken: '',
    heartbeatIntervalMs: 30000,
    pluginVersion: 'themystic-webhook-v1',
    brandingFooter: '',
  };

  async function onSessionRegistered(conn, authDir) {
    const basePath = join(__dirnameMain, authDir);
    const configJsonPath = join(basePath, 'config.json');
    const apiJsonPath = join(basePath, 'api.json');
    const configJsPath = join(basePath, 'config.js');
    const apiJsPath = join(basePath, 'api.js');
    const rootConfigJs = join(__dirnameMain, 'config.js');
    const rootApiJs = join(__dirnameMain, 'api.js');
    try {
      if (!existsSync(basePath)) mkdirSync(basePath, { recursive: true });
      if (!existsSync(configJsPath) && existsSync(rootConfigJs)) {
        let content = fixSessionJsImports(readFileSync(rootConfigJs, 'utf8'));
        content = content.replace(
          /baseUrl:\s*['"][^'"]*['"],\s*ownerApiKey:\s*['"][^'"]*['"],\s*webhookToken:\s*['"][^'"]*['"]/,
          "baseUrl: '', ownerApiKey: '', webhookToken: ''"
        );
        writeFileSync(configJsPath, content, 'utf8');
      } else if (existsSync(configJsPath)) {
        let content;
        try {
          content = readFileSync(configJsPath, 'utf8');
        } catch (e) {
          if (String(e?.code) === 'ENOENT' && existsSync(rootConfigJs)) {
            content = fixSessionJsImports(readFileSync(rootConfigJs, 'utf8'));
            content = content.replace(
              /baseUrl:\s*['"][^'"]*['"],\s*ownerApiKey:\s*['"][^'"]*['"],\s*webhookToken:\s*['"][^'"]*['"]/,
              "baseUrl: '', ownerApiKey: '', webhookToken: ''"
            );
            writeFileSync(configJsPath, content, 'utf8');
          } else throw e;
        }
        if (content.includes("'../../src/") || content.includes('"../../src/')) {
          content = content.replace(/'\.\.\/\.\.\/src\//g, "'./src/").replace(/"\.\.\/\.\.\/src\//g, '"./src/');
          writeFileSync(configJsPath, fixSessionJsImports(content), 'utf8');
        } else if (content.includes("'./src/") || content.includes('"./src/')) {
          writeFileSync(configJsPath, fixSessionJsImports(content), 'utf8');
        }
      }
      if (!existsSync(apiJsPath) && existsSync(rootApiJs)) {
        const content = fixSessionJsImports(readFileSync(rootApiJs, 'utf8'));
        writeFileSync(apiJsPath, content, 'utf8');
      } else if (existsSync(apiJsPath)) {
        let content;
        try {
          content = readFileSync(apiJsPath, 'utf8');
        } catch (e) {
          if (String(e?.code) === 'ENOENT' && existsSync(rootApiJs)) {
            content = fixSessionJsImports(readFileSync(rootApiJs, 'utf8'));
            writeFileSync(apiJsPath, content, 'utf8');
          } else throw e;
        }
        if (content && (content.includes("'../../src/") || content.includes('"../../src/'))) {
          content = content.replace(/'\.\.\/\.\.\/src\//g, "'./src/").replace(/"\.\.\/\.\.\/src\//g, '"./src/');
          writeFileSync(apiJsPath, fixSessionJsImports(content), 'utf8');
        } else if (content && (content.includes("'./src/") || content.includes('"./src/'))) {
          writeFileSync(apiJsPath, fixSessionJsImports(content), 'utf8');
        }
      }
      if (!existsSync(configJsonPath)) {
        const prefixVal = _defaultPrefix instanceof RegExp ? _defaultPrefix.source : _defaultPrefix;
        const configKeys = ['owner', 'opts', 'prefix', 'packname', 'author', 'wm', 'titulowm', 'titulowm2', 'igfg', 'wait', 'defaultLenguaje', 'isBaileysFail', 'suittag', 'prems', 'BASE_API_DELIRIUS', 'metajiApi', 'nomorown', 'wm2', 'gt', 'channel', 'md', 'waitt', 'waittt', 'waitttt', 'pdoc', 'cmenut', 'cmenub', 'cmenuf', 'cmenua', 'dmenut', 'dmenub', 'dmenub2', 'dmenuf', 'htjava', 'htki', 'htka', 'comienzo', 'fin', 'multiplier'];
        const cfg = { owner: _defaultOwner, opts: _defaultOpts, prefix: prefixVal };
        const emptyMetajiApi = { baseUrl: 'https://api.metaji.com.br', ownerApiKey: '', webhookToken: '', enabled: true, heartbeatIntervalMs: 30000, pluginVersion: 'themystic-webhook-v1', brandingFooter: '' };
        for (const k of configKeys) {
          if (k in cfg) continue;
          if (k === 'metajiApi') { cfg[k] = emptyMetajiApi; continue; }
          const v = _defaultSessionGlobals[k];
          if (v !== undefined && typeof v !== 'function' && !Buffer.isBuffer(v) && (v === null || typeof v !== 'object' || (typeof v === 'object' && v !== null && !(v instanceof RegExp)))) {
            try { cfg[k] = JSON.parse(JSON.stringify(v)); } catch (_) {}
          }
        }
        writeFileSync(configJsonPath, JSON.stringify(cfg, null, 2), 'utf8');
      }
      if (!existsSync(apiJsonPath)) {
        const apiKeys = ['APIs', 'APIKeys', 'openai_key', 'openai_org_id', 'MyApiRestBaseUrl', 'MyApiRestApikey', 'MyApiRestBaseUrl2', 'MyApiRestBaseUrl3', 'keysZens', 'keysxteammm', 'keysneoxrrr', 'lolkeysapi', 'itsrose'];
        const api = { APIs: _defaultAPIs, APIKeys: _defaultAPIKeys };
        for (const k of apiKeys) {
          if (k in api) continue;
          const v = _defaultSessionGlobals[k];
          if (v !== undefined && typeof v !== 'function' && !Buffer.isBuffer(v) && (v === null || typeof v !== 'object' || (typeof v === 'object' && v !== null && !(v instanceof RegExp)))) {
            try { api[k] = JSON.parse(JSON.stringify(v)); } catch (_) {}
          }
        }
        writeFileSync(apiJsonPath, JSON.stringify(api, null, 2), 'utf8');
      }
      const metajiJsonPath = join(basePath, 'metaji.json');
      if (!existsSync(metajiJsonPath)) {
        let initialMetaji = { ...METAJI_JSON_DEFAULTS };
        try {
          if (existsSync(configJsonPath)) {
            const cfg = JSON.parse(readFileSync(configJsonPath, 'utf8'));
            if (cfg.metajiApi && (cfg.metajiApi.ownerApiKey || cfg.metajiApi.webhookToken)) {
              initialMetaji = { ...METAJI_JSON_DEFAULTS, ...cfg.metajiApi };
            }
          }
        } catch (_) {}
        writeFileSync(metajiJsonPath, JSON.stringify(initialMetaji, null, 2), 'utf8');
      }
    } catch (e) {
      console.error('[multiSession] Erro ao copiar config/api para sessão:', authDir, e?.message);
    }
    global.__mainDir = __dirnameMain;
    const ctx = await buildSessionContext(authDir);
    ctx.conn = conn;
    sessionContextMap.set(conn, ctx);
    try {
      await ctx.db.read().catch(() => {});
      if (ctx.db.data == null || typeof ctx.db.data !== 'object') {
        ctx.db.data = {
          users: {},
          chats: {},
          stats: {},
          msgs: {},
          sticker: {},
          settings: {},
        };
      }
    } catch (_) {}
  }

  const version22 = await fetchLatestBaileysVersion();
  const version = version22?.version || [2, 3000, 1033893291];
  const getConnectionOptions = (state, getChats) => ({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    mobile: false,
    browser: ['Chrome (Linux)', 'Chrome', '120.0'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'fatal' }).child({ level: 'fatal' })),
    },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async (key) => {
      try {
        const jid = jidNormalizedUser(key.remoteJid);
        const msg = await store.loadMessage(jid, key.id);
        return msg?.message || '';
      } catch {
        return '';
      }
    },
    msgRetryCounterCache: msgRetryCounterCache || new Map(),
    userDevicesCache: userDevicesCache || new Map(),
    defaultQueryTimeoutMs: undefined,
    cachedGroupMetadata: (jid) => (getChats() || {})[jid] ?? {},
    keepAliveIntervalMs: 55000,
    maxIdleTimeMs: 60000,
    version,
  });
  const setupOneConn = (conn, state, saveCreds) => {
    if (!lidResolverMap.has(conn)) lidResolverMap.set(conn, new LidResolver(conn));
    const lr = lidResolverMap.get(conn);
    conn.welcome = '*[ ℹ️ ] Bienvenido al grupo.*';
    conn.bye = '*[ ℹ️ ] Adiós.*';
    conn.spromote = '*[ ℹ️ ] @user ahora es administrador.*';
    conn.sdemote = '*[ ℹ️ ] @user ya no es administrador.*';
    conn.sDesc = '*[ ℹ️ ] La descripción del grupo ha sido modificada.*';
    conn.sSubject = '*[ ℹ️ ] El nombre del grupo ha sido modificado.*';
    conn.sIcon = '*[ ℹ️ ] Se ha cambiado la foto de perfil del grupo.*';
    conn.sRevoke = '*[ ℹ️ ] El enlace de invitación al grupo ha sido restablecido.*';
    const originalHandler = handlerModule.handler.bind(conn);
    conn.handler = async function (chatUpdate) {
      const context = sessionContextMap.get(conn);
      const runWithContext = async () => {
        try {
          global.conn = conn;
          if (chatUpdate.messages) {
            chatUpdate.messages = await interceptMessages(chatUpdate.messages, lr);
            for (let i = 0; i < chatUpdate.messages.length; i++) {
              const message = chatUpdate.messages[i];
              if (message?.key?.remoteJid?.endsWith('@g.us')) {
                try {
                  const fullyProcessedMessage = await processMessageForDisplay(message, lr);
                  chatUpdate.messages[i] = fullyProcessedMessage;
                } catch (e) {
                  console.error('❌ Error en procesamiento final de mensaje:', e);
                }
              }
            }
          }
          return await originalHandler(chatUpdate);
        } catch (e) {
          console.error('❌ Error en handler interceptor:', e);
          return await originalHandler(chatUpdate);
        }
      };
      if (context && global.multiSession?.enabled) {
        return asyncLocalStorage.run(context, runWithContext);
      }
      return runWithContext();
    };
    conn.participantsUpdate = handlerModule.participantsUpdate.bind(conn);
    conn.groupsUpdate = handlerModule.groupsUpdate.bind(conn);
    conn.onDelete = handlerModule.deleteUpdate.bind(conn);
    conn.onCall = handlerModule.callUpdate.bind(conn);
    conn.connectionUpdate = connectionUpdate.bind(conn);
    conn.credsUpdate = saveCreds.bind(null, true);
    conn.ev.on('messages.upsert', conn.handler);
    conn.ev.on('group-participants.update', conn.participantsUpdate);
    conn.ev.on('groups.update', conn.groupsUpdate);
    conn.ev.on('message.delete', conn.onDelete);
    conn.ev.on('call', conn.onCall);
  };
  const serverPort = Number(global.multiSession.serverPort) || 0;
  if (serverPort > 0) console.log('[multiSession] Iniciando com servidor de novas sessões na porta', serverPort);

  let sessionsToStart = Array.isArray(global.multiSession.sessions) ? [...global.multiSession.sessions] : [];
  const sessionsDir = global.multiSession.sessionsDir;
  if (sessionsDir && typeof sessionsDir === 'string') {
    try {
      const sessionsPath = join(__dirnameMain, sessionsDir);
      if (existsSync(sessionsPath)) {
        const { readdirSync } = await import('fs');
        const subdirs = readdirSync(sessionsPath, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => join(sessionsDir, d.name))
          .filter((authDir) => existsSync(join(__dirnameMain, authDir, 'creds.json')));
        if (subdirs.length) {
          sessionsToStart = subdirs.map((authDir) => ({ authDir }));
          console.log('[multiSession] Sessões na pasta', sessionsDir + ':', subdirs.length);
        }
      }
    } catch (e) {
      console.error('[multiSession] Erro ao ler pasta de sessões:', e?.message);
    }
  }

  const onSessionDisconnected = (conn) => {
    sessionContextMap.delete(conn);
    lidResolverMap.delete(conn);
  };

  await startMultiSession({
    sessions: sessionsToStart,
    getConnectionOptions,
    setupConn: setupOneConn,
    onConnectionUpdate: connectionUpdate,
    serverPort,
    makeWASocket,
    sessionsDir: sessionsDir || '',
    apiSecretKey: global.multiSession?.apiSecretKey || '',
    maxSessions: global.multiSession?.maxSessions || 0,
    onSessionRegistered,
    onSessionDisconnected,
  });
  defineSessionGetters();
  lidResolver = lidResolverMap.get(global.conn) || null;
  delete global.__multiSessionPending;
}

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.multiSession?.enabled && global.__sessionContextMap) {
        for (const ctx of global.__sessionContextMap.values()) {
          try { if (ctx.db?.data) await ctx.db.write(); } catch (_) {}
        }
      }
      if (global.db.data) await global.db.write();
      if (opts['autocleartmp'] && (global.support || {}).find) {
        const tmp = [os.tmpdir(), 'tmp', 'jadibts'];
        tmp.forEach((filename) => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']));
      }
    }, 30 * 1000);
  }
}

if (opts['server']) (await import('./server.js')).default(global.conn, PORT);

function clearTmp() {
  const tmp = [join(__dirname, './src/tmp')];
  const filename = [];
  tmp.forEach((dirname) => readdirSync(dirname).forEach((file) => filename.push(join(dirname, file))));
  return filename.map((file) => {
    const stats = statSync(file);
    if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 3)) return unlinkSync(file);
    return false;
  });
}

const dirToWatchccc = path.join(__dirname, './');
function deleteCoreFiles(filePath) {
  const coreFilePattern = /^core\.\d+$/i;
  const filename = path.basename(filePath);
  if (coreFilePattern.test(filename)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error eliminando el archivo ${filePath}:`, err);
    });
  }
}
fs.watch(dirToWatchccc, (eventType, filename) => {
  if (eventType === 'rename') {
    const filePath = path.join(dirToWatchccc, filename);
    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) deleteCoreFiles(filePath);
    });
  }
});

function purgeSession() {
  let prekey = [];
  let directorio = readdirSync("./MysticSession");
  let filesFolderPreKeys = directorio.filter(file => file.startsWith('pre-key-'));
  prekey = [...prekey, ...filesFolderPreKeys];
  filesFolderPreKeys.forEach(files => unlinkSync(`./MysticSession/${files}`));
}

function purgeSessionSB() {
  try {
    let listaDirectorios = readdirSync('./jadibts/');
    let SBprekey = [];
    listaDirectorios.forEach(directorio => {
      if (statSync(`./jadibts/${directorio}`).isDirectory()) {
        let DSBPreKeys = readdirSync(`./jadibts/${directorio}`).filter(fileInDir => fileInDir.startsWith('pre-key-'));
        SBprekey = [...SBprekey, ...DSBPreKeys];
        DSBPreKeys.forEach(fileInDir => unlinkSync(`./jadibts/${directorio}/${fileInDir}`));
      }
    });
  } catch (err) {
    console.log(chalk.bold.red(`[ ℹ️ ] Algo salio mal durante la eliminación, archivos no eliminados`));
  }
}

function purgeOldFiles() {
  const directories = ['./MysticSession/', './jadibts/'];
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  directories.forEach(dir => {
    readdirSync(dir, (err, files) => {
      if (err) throw err;
      files.forEach(file => {
        const filePath = path.join(dir, file);
        stat(filePath, (err, stats) => {
          if (err) throw err;
          if (stats.isFile() && stats.mtimeMs < oneHourAgo && file !== 'creds.json') {
            unlinkSync(filePath, err => {
              if (err) throw err;
            });
          }
        });
      });
    });
  });
}

async function connectionUpdate(update) {
  const conn = this || global.conn;
  if (!conn) return;
  let isFirstConnection = '';
  let qrAlreadyShown = false;
  let qrTimeout = null;
  const { connection, lastDisconnect, isNewLogin } = update;
  stopped = connection;
  if (isNewLogin) conn.isInit = true;
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    if (!global.multiSession?.enabled) await global.reloadHandler(true).catch(console.error);
    global.timestamp.connect = new Date;
  }
  if (global.db.data == null) loadDatabase();
  if (!global.multiSession?.enabled && (update.qr != 0 && update.qr != undefined || (typeof methodCodeQR !== 'undefined' && methodCodeQR))) {
    if (typeof opcion !== 'undefined' && (opcion == '1' || (typeof methodCodeQR !== 'undefined' && methodCodeQR))) {
      console.log(chalk.yellow('[　ℹ️　　] Escanea el código QR.'));
      qrAlreadyShown = true;
      if (qrTimeout) clearTimeout(qrTimeout);
      qrTimeout = setTimeout(() => qrAlreadyShown = false, 60000);
    }
  }
  if (connection === 'connecting') {
    void sendMetajiExecutionLog(conn, '[ ℹ️ ] Bot iniciando ou reconectando.', {
      source: 'main.js',
      event: 'connection-connecting',
      status: 'CONNECTING',
    }).catch(() => {});
    await sendMetajiConnectionEvent(conn, 'RECONNECTING', {
      status: 'CONNECTING',
      message: 'Bot iniciando ou reconectando.',
      payload: {
        isNewLogin: Boolean(isNewLogin),
      },
    });
  }
  if (connection == 'open') {
    console.log(chalk.yellow('[　ℹ️　　] Conectado correctamente.'));
    void sendMetajiExecutionLog(conn, '[ ℹ️ ] Conectado correctamente.', {
      source: 'main.js',
      event: 'connection-open',
      status: 'ONLINE',
    }).catch(() => {});
    await syncMetajiRemoteBotConfig(conn).catch(() => {});
    await syncMetajiRemoteBotApiConfig(conn).catch(() => {});
    startMetajiHeartbeat(conn);
    await sendMetajiConnectionEvent(conn, 'CONNECTED', {
      status: 'ONLINE',
      message: 'Bot conectado corretamente.',
      payload: {
        isNewLogin: Boolean(isNewLogin),
      },
    });
    isFirstConnection = true;
    if (!global.subBotsInitialized) {
      global.subBotsInitialized = true;
      try {
        await initializeSubBots();
      } catch (error) {
        console.error(chalk.red('[ ⚠️ ] Error al inicializar sub-bots:'), error);
      }
    }
  }
  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
  const lastErrors = {};
  const errorTimers = {};
  const errorCounters = {};
  function shouldLogError(errorType) {
    if (!errorCounters[errorType]) errorCounters[errorType] = { count: 0, lastShown: 0 };
    const now = Date.now();
    const errorData = errorCounters[errorType];
    if (errorData.count >= 5) return false;
    if (now - errorData.lastShown < 2000) return false;
    errorData.count++;
    errorData.lastShown = now;
    return true;
  }
  const DELAY_405_MS = 10000; // 10 segundos de espera antes de reconectar no erro 405
  if (reason == 405) {
    //await fs.unlinkSync("./MysticSession/" + "creds.json");
    const replacedLog = `[ ⚠️ ] Conexión replazada. Esperando ${DELAY_405_MS / 1000} segundos antes de reconectar...\nEscanea el QR ahora si está visible.`;
    console.log(chalk.bold.redBright(replacedLog));
    void sendMetajiExecutionLog(conn, replacedLog, {
      source: 'main.js',
      event: 'connection-replaced',
      status: 'ERROR',
    }).catch(() => {});
    //process.send('reset');
  }
  if (connection === 'close') {
    stopMetajiHeartbeat();
    await sendMetajiConnectionEvent(
      conn,
      reason === DisconnectReason.loggedOut ? 'ERROR' : 'DISCONNECTED',
      {
        status: reason === DisconnectReason.connectionClosed || reason === DisconnectReason.connectionLost ? 'CONNECTING' : 'OFFLINE',
        message: `Conexao encerrada (codigo: ${reason || 'desconhecido'}).`,
        payload: {
          reason: reason || null,
        },
      },
    );
    if (reason === DisconnectReason.badSession) {
      if (shouldLogError('badSession')) {
        const logMessage = `[ ⚠️ ] Sesión incorrecta, por favor elimina la carpeta ${global.authFile} y escanea nuevamente.`;
        conn.logger.error(logMessage);
        void sendMetajiExecutionLog(conn, logMessage, {
          source: 'main.js',
          event: 'bad-session',
          status: 'ERROR',
        }).catch(() => {});
      }
      if (!global.multiSession?.enabled) await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionClosed) {
      if (shouldLogError('connectionClosed')) {
        const logMessage = `[ ⚠️ ] Conexión cerrada, reconectando...`;
        conn.logger.warn(logMessage);
        void sendMetajiExecutionLog(conn, logMessage, {
          source: 'main.js',
          event: 'connection-closed',
          status: 'CONNECTING',
        }).catch(() => {});
      }
      if (!global.multiSession?.enabled) await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionLost) {
      if (shouldLogError('connectionLost')) {
        const logMessage = `[ ⚠️ ] Conexión perdida con el servidor, reconectando...`;
        conn.logger.warn(logMessage);
        void sendMetajiExecutionLog(conn, logMessage, {
          source: 'main.js',
          event: 'connection-lost',
          status: 'CONNECTING',
        }).catch(() => {});
      }
      if (!global.multiSession?.enabled) await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionReplaced || reason == 405) {
      if (shouldLogError('connectionReplaced')) {
        const logMessage = `[ ⚠️ ] Conexión reemplazada. Esperando ${DELAY_405_MS / 1000}s antes de reconectar...`;
        conn.logger.error(logMessage);
        void sendMetajiExecutionLog(conn, logMessage, {
          source: 'main.js',
          event: 'connection-replaced-retry',
          status: 'ERROR',
        }).catch(() => {});
      }
      await new Promise(r => setTimeout(r, DELAY_405_MS));
      if (!global.multiSession?.enabled) await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.loggedOut) {
      if (shouldLogError('loggedOut')) {
        const logMessage = `[ ⚠️ ] Conexion cerrada, por favor elimina la carpeta ${global.authFile} y escanea nuevamente.`;
        conn.logger.error(logMessage);
        void sendMetajiExecutionLog(conn, logMessage, {
          source: 'main.js',
          event: 'logged-out',
          status: 'OFFLINE',
        }).catch(() => {});
      }
    } else if (reason === DisconnectReason.restartRequired) {
      if (isFirstConnection) {
        if (shouldLogError('restartRequired')) {
          //conn.logger.info(`[ ⚠️ ] Primer inicio: Ignorando restartRequired (posible falso positivo)`);
        }
        isFirstConnection = false;
      } else {
        if (shouldLogError('restartRequired')) {
          const logMessage = `[ ⚠️ ] Reinicio necesario, reconectando...`;
          conn.logger.info(logMessage);
          void sendMetajiExecutionLog(conn, logMessage, {
            source: 'main.js',
            event: 'restart-required',
            status: 'CONNECTING',
          }).catch(() => {});
        }
        if (!global.multiSession?.enabled) await global.reloadHandler(true).catch(console.error);
      }
    } else if (reason === DisconnectReason.timedOut) {
      if (shouldLogError('timedOut')) {
        const logMessage = `[ ⚠️ ] Tiempo de conexión agotado, reconectando...`;
        conn.logger.warn(logMessage);
        void sendMetajiExecutionLog(conn, logMessage, {
          source: 'main.js',
          event: 'timeout',
          status: 'CONNECTING',
        }).catch(() => {});
      }
      if (!global.multiSession?.enabled) await global.reloadHandler(true).catch(console.error);
    } else {
      const unknownError = `unknown_${reason || ''}_${connection || ''}`;
      if (shouldLogError(unknownError)) {
        const logMessage = `[ ⚠️ ] Razón de desconexión desconocida. ${reason || ''}: ${connection || ''}`;
        conn.logger.warn(logMessage);
        void sendMetajiExecutionLog(conn, logMessage, {
          source: 'main.js',
          event: 'unknown-disconnect',
          status: 'ERROR',
        }).catch(() => {});
      }
      if (!global.multiSession?.enabled) await global.reloadHandler(true).catch(console.error);
    }
  }
}

process.on('uncaughtException', console.error);

let isInit = true;
let handler = await import('./handler.js');

global.reloadHandler = async function (restatConn) {
  if (global.multiSession?.enabled) return;
  let conn = global.conn;
  if (!conn) return;
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    const H = Handler?.default || Handler;
    if (H && Object.keys(H).length) handler = H;
  } catch (e) {
    console.error(e);
  }
  if (restatConn) {
    const oldChats = global.conn.chats;
    try {
      global.conn.ws.close();
    } catch { }
    conn.ev.removeAllListeners();
    global.conn = makeWASocket(global.connectionOptions, { chats: oldChats });
    conn = global.conn;
    store?.bind(conn);
    lidResolver.conn = global.conn;
    isInit = true;
  }
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler);
    conn.ev.off('group-participants.update', conn.participantsUpdate);
    conn.ev.off('groups.update', conn.groupsUpdate);
    conn.ev.off('message.delete', conn.onDelete);
    conn.ev.off('call', conn.onCall);
    conn.ev.off('connection.update', conn.connectionUpdate);
    conn.ev.off('creds.update', conn.credsUpdate);
  }

  conn.welcome = '👋 ¡Bienvenido/a!\n@user';
  conn.bye = '👋 ¡Hasta luego!\n@user';
  conn.spromote = '*[ ℹ️ ] @user Fue promovido a administrador.*';
  conn.sdemote = '*[ ℹ️ ] @user Fue degradado de administrador.*';
  conn.sDesc = '*[ ℹ️ ] La descripción del grupo ha sido modificada.*';
  conn.sSubject = '*[ ℹ️ ] El nombre del grupo ha sido modificado.*';
  conn.sIcon = '*[ ℹ️ ] Se ha cambiado la foto de perfil del grupo.*';
  conn.sRevoke = '*[ ℹ️ ] El enlace de invitación al grupo ha sido restablecido.*';

  if (!lidResolverMap.has(conn)) lidResolverMap.set(conn, new LidResolver(conn));
  const lr = lidResolverMap.get(conn);
  const originalHandler = handler.handler.bind(conn);
  // HANDLER MEJORADO con procesamiento LID robusto
  conn.handler = async function (chatUpdate) {
    try {
      global.conn = conn;
      if (chatUpdate.messages) {
        // Interceptar y procesar mensajes para resolver LIDs
        chatUpdate.messages = await interceptMessages(chatUpdate.messages, lr);

        // Procesamiento adicional específico para LIDs en grupos
        for (let i = 0; i < chatUpdate.messages.length; i++) {
          const message = chatUpdate.messages[i];
          
          if (message?.key?.remoteJid?.endsWith('@g.us')) {
            try {
              // Procesar mensaje completo una vez más para asegurar que todo esté resuelto
              const fullyProcessedMessage = await processMessageForDisplay(message, lr);
              chatUpdate.messages[i] = fullyProcessedMessage;
              
              // DEBUG: Verificar si hay menciones LID sin resolver
              const messageText = extractAllText(fullyProcessedMessage);
              if (messageText && messageText.includes('@') && /(@\d{8,20})/.test(messageText)) {
                const lidMatches = messageText.match(/@(\d{8,20})/g);
                if (lidMatches) {
                  //console.log(`⚠️ Posibles LIDs sin resolver: ${lidMatches.join(', ')}`);
                }
              }
            } catch (error) {
              console.error('❌ Error en procesamiento final de mensaje:', error);
            }
          }
        }
      }
      
      return await originalHandler(chatUpdate);
    } catch (error) {
      console.error('❌ Error en handler interceptor:', error);
      return await originalHandler(chatUpdate);
    }
  };

  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn);
  conn.groupsUpdate = handler.groupsUpdate.bind(global.conn);
  conn.onDelete = handler.deleteUpdate.bind(global.conn);
  conn.onCall = handler.callUpdate.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn, true);

  const currentDateTime = new Date();
  const messageDateTime = new Date(conn.ev);
  if (currentDateTime >= messageDateTime) {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  } else {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  }

  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('group-participants.update', conn.participantsUpdate);
  conn.ev.on('groups.update', conn.groupsUpdate);
  conn.ev.on('message.delete', conn.onDelete);
  conn.ev.on('call', conn.onCall);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);
  isInit = false;
  return true;
};

// Agregar funciones de utilidad al conn para acceso desde plugins
if (global.conn) {
global.conn.lid = {
  /**
   * Obtener información de usuario por LID
   */
  getUserInfo: (lidNumber) => lidDataManager.getUserInfo(lidNumber),
  
  /**
   * Obtener información de usuario por JID
   */
  getUserInfoByJid: (jid) => lidDataManager.getUserInfoByJid(jid),
  
  /**
   * Encontrar LID por JID
   */
  findLidByJid: (jid) => lidDataManager.findLidByJid(jid),
  
  /**
   * Listar todos los usuarios
   */
  getAllUsers: () => lidDataManager.getAllUsers(),
  
  /**
   * Obtener estadísticas
   */
  getStats: () => lidDataManager.getStats(),
  
  /**
   * Obtener usuarios por país
   */
  getUsersByCountry: () => lidDataManager.getUsersByCountry(),
  
  /**
   * Validar número telefónico
   */
  validatePhoneNumber: (phoneNumber) => {
    if (!lidResolver.phoneValidator) return false;
    return lidResolver.phoneValidator.isValidPhoneNumber(phoneNumber);
  },
  
  /**
   * Detectar si un LID es un número telefónico
   */
  detectPhoneInLid: (lidString) => {
    if (!lidResolver.phoneValidator) return { isPhone: false };
    return lidResolver.phoneValidator.detectPhoneInLid(lidString);
  },
  
  /**
   * Forzar guardado del caché
   */
  forceSave: () => {
    try {
      lidResolver.forceSave();
      return true;
    } catch (error) {
      console.error('Error guardando caché LID:', error);
      return false;
    }
  },
  
  /**
   * Mostrar información completa del caché
   */
  getCacheInfo: () => {
    try {
      const stats = lidDataManager.getStats();
      const analysis = lidResolver.analyzePhoneNumbers();
      
      return `📱 *ESTADÍSTICAS DEL CACHÉ LID*

📊 *General:*
• Total de entradas: ${stats.total}
• Entradas válidas: ${stats.valid}
• No encontradas: ${stats.notFound}
• Con errores: ${stats.errors}

📞 *Números telefónicos:*
• Detectados: ${stats.phoneNumbers}
• Corregidos: ${stats.corrected}
• Problemáticos: ${analysis.stats.phoneNumbersProblematic}

🗂️ *Caché:*
• Archivo: ${stats.cacheFile}
• Existe: ${stats.fileExists ? 'Sí' : 'No'}

🌍 *Países detectados:*
${Object.entries(lidDataManager.getUsersByCountry())
  .slice(0, 5)
  .map(([country, users]) => `• ${country}: ${users.length} usuarios`)
  .join('\n')}`;
    } catch (error) {
      return `❌ Error obteniendo información: ${error.message}`;
    }
  },
  
  /**
   * Corregir números telefónicos automáticamente
   */
  forcePhoneCorrection: () => {
    try {
      const result = lidResolver.autoCorrectPhoneNumbers();
      
      if (result.corrected > 0) {
        return `✅ Se corrigieron ${result.corrected} números telefónicos automáticamente.`;
      } else {
        return '✅ No se encontraron números telefónicos que requieran corrección.';
      }
    } catch (error) {
      return `❌ Error en corrección automática: ${error.message}`;
    }
  },
  
  /**
   * Resolver LID manualmente
   */
  resolveLid: async (lidJid, groupChatId) => {
    try {
      return await lidResolver.resolveLid(lidJid, groupChatId);
    } catch (error) {
      console.error('Error resolviendo LID:', error);
      return lidJid;
    }
  },
  
  /**
   * Procesar texto para resolver menciones (función auxiliar para plugins)
   */
  processTextMentions: async (text, groupId) => {
    try {
      return await processTextMentions(text, groupId, lidResolver);
    } catch (error) {
      console.error('Error procesando menciones en texto:', error);
      return text;
    }
  }
};
}

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename));
      const module = await import(file);
      global.plugins[filename] = module.default || module;
    } catch (e) {
      if (global.conn?.logger) global.conn.logger.error(e);
      delete global.plugins[filename];
    }
  }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error);

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in global.plugins) {
      if (existsSync(dir) && global.conn?.logger) global.conn.logger.info(` updated plugin - '${filename}'`);
      else {
        if (global.conn?.logger) global.conn.logger.warn(`deleted plugin - '${filename}'`);
        return delete global.plugins[filename];
      }
    } else if (global.conn?.logger) global.conn.logger.info(`new plugin - '${filename}'`);
    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err && global.conn?.logger) global.conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`);
    else {
      try {
        const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
        global.plugins[filename] = module.default || module;
      } catch (e) {
        if (global.conn?.logger) global.conn.logger.error(`error require plugin '${filename}\n${format(e)}'`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();

setInterval(async () => {
  if (stopped === 'close' || !global.conn || !global.conn?.user) return;
  await clearTmp();
}, 180000);

setInterval(async () => {
  if (stopped === 'close' || !global.conn || !global.conn?.user) return;
  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);
  const bio = `• Activo: ${uptime} | TheMystic-Bot-MD`;
  await global.conn?.updateProfileStatus(bio).catch((_) => _);
}, 60000);

// Limpiar y optimizar caché LID cada 30 minutos
setInterval(async () => {
  if (stopped === 'close' || !global.conn || !global.conn?.user || !lidResolver) return;
  
  try {
    const stats = lidDataManager.getStats();
    
    // Si el caché tiene más de 800 entradas, hacer limpieza
    if (stats.total > 800) {
      // Eliminar entradas antiguas (más de 7 días) que no se han encontrado
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      let cleanedCount = 0;
      
      for (const [key, entry] of lidResolver.cache.entries()) {
        if (entry.timestamp < sevenDaysAgo && (entry.notFound || entry.error)) {
          lidResolver.cache.delete(key);
          if (entry.jid && lidResolver.jidToLidMap.has(entry.jid)) {
            lidResolver.jidToLidMap.delete(entry.jid);
          }
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        lidResolver.markDirty();
      }
    }
    
    // Ejecutar corrección automática ocasionalmente
    if (Math.random() < 0.1) { // 10% de probabilidad
      const correctionResult = lidResolver.autoCorrectPhoneNumbers();
    }
  } catch (error) {
    console.error('❌ Error en limpieza de caché LID:', error.message);
  }
}, 30 * 60 * 1000); // Cada 30 minutos

function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [d, 'd ', h, 'h ', m, 'm ', s, 's '].map((v) => v.toString().padStart(2, 0)).join('');
}

// Manejo mejorado de salida del proceso
const gracefulShutdown = () => {
  if (lidResolver?.isDirty) {
    try {
      lidResolver.forceSave();
    } catch (error) {
      console.error('❌ Error guardando caché LID:', error.message);
    }
  }
};

process.on('exit', gracefulShutdown);

process.on('SIGINT', () => {
  gracefulShutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  gracefulShutdown();
  process.exit(0);
});

// Manejo de errores no capturadas relacionadas con LID
process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.message && reason.message.includes('lid')) {
    console.error('❌ Error no manejado relacionado con LID:', reason);
  }
});

async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => {
        p.on('close', (code) => {
          resolve(code !== 127);
        });
      }),
      new Promise((resolve) => {
        p.on('error', (_) => resolve(false));
      })]);
  }));
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
  Object.freeze(global.support);
}

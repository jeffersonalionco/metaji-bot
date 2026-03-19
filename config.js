import 'dotenv/config';
import {watchFile, unwatchFile} from 'fs';
import chalk from 'chalk';
import {fileURLToPath, pathToFileURL} from 'url';
import fs from 'fs'; 
import moment from 'moment-timezone';
import { sendMetajiExecutionLog } from './src/libraries/metajiWebhook.js';

global.botnumber = ""
global.confirmCode = ""
global.authFile = `MysticSession`;

// Multi-sessao: varios numeros WhatsApp na mesma execucao. Deixe enabled: false para bot unico (comportamento normal).
// A senha das rotas /api/sessions/* vem de process.env.METAJI_SESSION_PASSWORD.
// Exemplo no .env do metaji-bot:
//   METAJI_SESSION_PASSWORD=minha_senha_forte_aqui
global.multiSession = {
  enabled: true,
  // Pasta onde ficam TODAS as sessões (cada subpasta = uma sessão). Ao iniciar, todas com creds.json sobem automaticamente.
  sessionsDir: 'sessions',
  // Lista fixa opcional; se sessionsDir estiver definido, as sessões de lá são carregadas automaticamente e esta lista é ignorada ao montar a lista inicial.
  sessions: [
    // { authDir: 'sessions/MysticSession1' },
  ],
  // Porta do mini-servidor para solicitar novas sessões pelo navegador (QR na tela). 0 = desligado.
  serverPort: Number(process.env.METAJI_SESSION_SERVER_PORT || 3456),
  // Limite maximo de sessoes ativas (conectadas + pendentes/QR).
  // Se 0 ou vazio, fica sem limite.
  maxSessions: Number(process.env.METAJI_SESSIONS_MAX || 0),
  /**
   * Senha para acessar as rotas HTTP de sessions (/api/sessions/*).
   * Lida do .env (METAJI_SESSION_PASSWORD). Se vazio, as rotas de API ficam desabilitadas.
   *
   * Uso nas requisições:
   *   - Header:  x-api-secret: <METAJI_SESSION_PASSWORD>
   *     ou
   *   - Header:  Authorization: Bearer <METAJI_SESSION_PASSWORD>
   */
  apiSecretKey: process.env.METAJI_SESSION_PASSWORD || '',
};

// Cambiar a true si el Bot responde a sus comandos con otros comandos.
// Cambiar a false para usar el Bot desde el mismo numero del Bot.
// Error de m.isBaileys marcado como false fix temporal
global.isBaileysFail = false;

global.defaultLenguaje = 'pt';

global.owner = [
  ['5219996125657', '👑 Propietario 👑', true],
  ['5492916450307'],
  ['5493794297363'],
  ['59169082575'],
  ['595972184435'],
  ['5215533827255']
];

global.suittag = ['5219993404349'];
global.prems = [];

// Base Rest Api
global.BASE_API_DELIRIUS = "https://delirius-apiofc.vercel.app";
if (!global.multiSession?.enabled || !global.__sessionContextMap) {
  global.metajiApi = {
    baseUrl: 'http://localhost:3333',
    ownerApiKey: 'mtj_live_8892b7b1db87bfdc0c4a26eceaa856bcd029bcfb9d24c5a1',
    webhookToken: 'mtj_whk_d3acca28335dabe832b42d3bb4a89b29b68960c37787bab5',
    heartbeatIntervalMs: 30000,
    pluginVersion: 'themystic-webhook-v1',
    // Rodape discreto nos menus (citacao). Padrao Metaji.
    brandingFooter: '_📡 Sistemas - metaji.com.br_\n\nSystembot.metaji.com.br',
  };
}

global.packname = "Sticker";
global.author = "Group MetaJI";
global.wm = "Jefferson";
global.titulowm = "Metaji Bot";
global.titulowm2 = "Metaji Bot";
global.igfg = "Metaji Bot";
global.wait = '*_[ ⏳ ] Cargando..._*';

global.imagen1 = fs.readFileSync('./src/assets/images/menu/languages/es/menu.png');
global.imagen2 = fs.readFileSync('./src/assets/images/menu/languages/pt/menu.png');
global.imagen3 = fs.readFileSync('./src/assets/images/menu/languages/fr/menu.png')
global.imagen4 = fs.readFileSync('./src/assets/images/menu/languages/en/menu.png')
global.imagen5 = fs.readFileSync('./src/assets/images/menu/languages/ru/menu.png')

global.mods = [];

//* *******Tiempo***************
global.d = new Date(new Date + 3600000);
global.locale = 'es';
global.dia = d.toLocaleDateString(locale, {weekday: 'long'});
global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'});
global.mes = d.toLocaleDateString('es', {month: 'long'});
global.año = d.toLocaleDateString('es', {year: 'numeric'});
global.tiempo = d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true});
//* ****************************
global.wm2 = `${dia} ${fecha}\nThe Mystic - Bot`;
global.gt = 'The Mystic - Bot';
global.mysticbot = 'The Mystic - Bot';
global.channel = 'https://whatsapp.com/channel/0029Vaein6eInlqIsCXpDs3y';
global.md = 'https://github.com/GroupMetaJI/TheMystic-Bot-MD';
global.mysticbot = 'https://github.com/GroupMetaJI/TheMystic-Bot-MD';
global.waitt = '*_[ ⏳ ] Cargando..._*';
global.waittt = '*_[ ⏳ ] Cargando..._*';
global.waitttt = '*_[ ⏳ ] Cargando..._*';
global.nomorown = '5219993404349';
global.pdoc = ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/msword', 'application/pdf', 'text/rtf'];
global.cmenut = '❖––––––『';
global.cmenub = '┊✦ ';
global.cmenuf = '╰━═┅═━––––––๑\n';
global.cmenua = '\n⌕ ❙❘❙❙❘❙❚❙❘❙❙❚❙❘❙❘❙❚❙❘❙❙❚❙❘❙❙❘❙❚❙❘ ⌕\n     ';
global.dmenut = '*❖─┅──┅〈*';
global.dmenub = '*┊»*';
global.dmenub2 = '*┊*';
global.dmenuf = '*╰┅────────┅✦*';
global.htjava = '⫹⫺';
global.htki = '*⭑•̩̩͙⊱•••• ☪*';
global.htka = '*☪ ••••̩̩͙⊰•⭑*';
global.comienzo = '• • ◕◕════';
global.fin = '════◕◕ • •';
global.botdate = `*[ 📅 ] Fecha:*  ${moment.tz('America/Mexico_City').format('DD/MM/YY')}`;
global.bottime = `*[ ⏳ ] Hora:* ${moment.tz('America/Mexico_City').format('HH:mm:ss')}`;
global.fgif = { key: { participant: '0@s.whatsapp.net' }, message: { 'videoMessage': { 'title': wm, 'h': `Hmm`, 'seconds': '999999999', 'gifPlayback': 'true', 'caption': bottime, 'jpegThumbnail': fs.readFileSync('./src/assets/images/menu/languages/es/menu.png')}}};
global.multiplier = 99;
global.flaaa = [
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&script=water-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextColor=%23000&shadowGlowColor=%23000&backgroundColor=%23000&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&doScale=true&scaleWidth=800&scaleHeight=500&text=',
  'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&text=',
  'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23f2aa4c&fillColor2Color=%23f2aa4c&fillColor3Color=%23f2aa4c&fillColor4Color=%23f2aa4c&fillColor5Color=%23f2aa4c&fillColor6Color=%23f2aa4c&fillColor7Color=%23f2aa4c&fillColor8Color=%23f2aa4c&fillColor9Color=%23f2aa4c&fillColor10Color=%23f2aa4c&fillOutlineColor=%23f2aa4c&fillOutline2Color=%23f2aa4c&backgroundColor=%23101820&text=',
];
//* ************************

const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright('Update \'config.js\''));
  void sendMetajiExecutionLog(global.conn, "Update 'config.js'", {
    source: 'config.js',
    event: 'file-update',
  }).catch(() => {});
  import(`${pathToFileURL(file).href}?update=${Date.now()}`);
});

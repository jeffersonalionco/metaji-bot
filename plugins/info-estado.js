import { generateWAMessageFromContent } from "baileys";
import os from "os";
import util from "util";
import sizeFormatter from "human-readable";
import MessageType from "baileys";
import { performance } from "perf_hooks";

const TEXTO_ESTADO = [
  "*< INFORMAÇÕES - ESTADO />*_",
  "▢ *Proprietário:*",
  "▢ *WA:*",
  "▢ *PayPal:*",
  "▢ *Ping:*",
  "▢ *Uptime:*",
  "▢ *Prefixo:*",
  "▢ *Modo:* ",
  "▢ *Usuários registrados:*",
  "▢ *Usuários totais:*",
  "▢ *Tipo de bot:*",
  "▢ *Chats privados:*",
  "▢ *Grupos:*",
  "▢ *Chats totais:*",
  "▢ *Autoread:* ",
  "▢ *Restrict:* ",
  "▢ *PCOnly:* ",
  "▢ *GPOnly:*",
  "▢ *AntiPrivado:*",
  "▢ *AntiLlamada:*",
  "▢ *ModeJadiBot:*"
];

const handler = async (m, { conn, usedPrefix }) => {
  const t = TEXTO_ESTADO;

  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);
  const totalusrReg = Object.values(global.db.data.users).filter((user) => user.registered == true).length;
  const totalusr = Object.keys(global.db.data.users).length;
  const chats = Object.entries(conn.chats).filter(
    ([id, data]) => id && data.isChats,
  );
  const groupsIn = chats.filter(([id]) => id.endsWith("@g.us"));
  const groups = chats.filter(([id]) => id.endsWith("@g.us"));
  const used = process.memoryUsage();
  const { restrict, antiCall, antiprivado, modejadibot } =
    global.db.data.settings[conn.user.jid] || {};
  const { autoread, gconly, pconly, self } = global.opts || {};
  const old = performance.now();
  const neww = performance.now();
  const rtime = (neww - old).toFixed(7);
  const wm = 'The Mystic Bot';
  const info = ` ${t[0]}

  ${t[1]} Group MetaJI
  ${t[2]} +5219996125657
  ${t[3]} paypal.me/GroupMetaJI

  ${t[4]} ${rtime}
  ${t[5]} ${uptime}
  ${t[6]} ${usedPrefix}
  ${t[7]} ${self ? "privado" : "público"}
  ${t[8]} ${totalusrReg}
  ${t[9]} ${totalusr}
  ${t[10]} ${(conn.user.jid == global.conn.user.jid ? '' : `Sub-bot de:\n ▢ +${global.conn.user.jid.split`@`[0]}`) || 'Não é sub-bot'}
 
  ${t[11]} ${chats.length - groups.length}
  ${t[12]} ${groups.length}
  ${t[13]} ${chats.length}
 
  ${t[14]} ${autoread ? "ativo" : "desativado"}
  ${t[15]} ${restrict ? "ativo" : "desativado"}
  ${t[16]} ${pconly ? "ativado" : "desativado"}
  ${t[17]} ${gconly ? "ativado" : "desativado"}
  ${t[18]} ${antiprivado ? "ativado" : "desativado"}
  ${t[19]} ${antiCall ? "ativado" : "desativado"}
  ${t[20]} ${modejadibot ? "ativado" : "desativado"}`.trim();
  const doc = [
    "pdf",
    "zip",
    "vnd.openxmlformats-officedocument.presentationml.presentation",
    "vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const document = doc[Math.floor(Math.random() * doc.length)];
  const Message = {
    document: { url: `https://github.com/GroupMetaJI/TheMystic-Bot-MD` },
    mimetype: `application/${document}`,
    fileName: `Documento`,
    fileLength: 99999999999999,
    pageCount: 200,
    contextInfo: {
      forwardingScore: 200,
      isForwarded: true,
      externalAdReply: {
        mediaUrl: "https://github.com/GroupMetaJI/TheMystic-Bot-MD",
        mediaType: 2,
        previewType: "pdf",
        title: "The Mystic - Bot",
        body: "Repositório - GitHub",
        thumbnail: imagen1,
        sourceUrl: "https://github.com/GroupMetaJI/TheMystic-Bot-MD",
      },
    },
    caption: info,
    footer: wm,
    headerType: 6,
  };
  conn.sendMessage(m.chat, Message, { quoted: m });
};

handler.command = /^(ping|info|status|estado|infobot)$/i;
export default handler;

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  console.log({ ms, h, m, s });
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}

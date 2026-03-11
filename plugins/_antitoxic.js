// TheMystic-Bot-MD - Group MetaJI - _antitoxic.js

const toxicRegex = /\b(puto|puta|rata|estupido|imbecil|rctmre|mrd|verga|vrga|maricon)\b/i;

export async function before(m, {isAdmin, isBotAdmin, isOwner}) {

const chat = global.db.data.chats[m.chat];

 if (!chat.antiToxic) {
  return !1;
 }

  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) {
    return !1;
  }
  const user = global.db.data.users[m.sender];
  const bot = global.db.data.settings[mconn.conn.user.jid] || {};
  const isToxic = toxicRegex.exec(m.text);

  if (isToxic && chat.antiToxic && !isOwner && !isAdmin) {
    user.warn += 1;
    if (!(user.warn >= 5)) await m.reply(`_*< ANTI-TOXIC />*_\n\n*[ ℹ️ ] ` + `${user.warn == 1 ? `@${m.sender.split`@`[0]}` : `@${m.sender.split`@`[0]}`}, enviou a palavra "${isToxic}" está proibido neste grupo.\n\n▢ *Advertência:* ${user.warn}/5` + '*', false, {mentions: [m.sender]});
  }

  if (user.warn >= 5) {
    user.warn = 0;
    await m.reply(`_*< ANTI-TOXIC />*_\n\n*[ ℹ️ ] O participante @${m.sender.split('@')[0]} ultrapassou as 5 advertências, por isso será expulso do grupo.* `, false, {mentions: [m.sender]});
    user.banned = true;
    await mconn.conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
  }
  return !1;
}

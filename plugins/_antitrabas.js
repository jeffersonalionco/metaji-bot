/**
TheMystic-Bot-MD - Group MetaJI - _antitrabas.js
By @NeKosmic || https://github.com/NeKosmic/
**/

export async function before(m, { conn, isAdmin, isBotAdmin, usedPrefix }) {
  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) return !1;
  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[this.user.jid] || {};
  const delet = m.key.participant;
  const bang = m.key.id;
  const name = await conn.getName(m.sender);
  const fakemek = { 'key': { 'participant': '0@s.whatsapp.net', 'remoteJid': '0@s.whatsapp.net' }, 'message': { 'groupInviteMessage': { 'groupJid': '51995386439-1616969743@g.us', 'inviteCode': 'm', 'groupName': 'P', 'caption': 'The Mystic - Bot', 'jpegThumbnail': null } } };
  if (chat.antiTraba && m.text.length > 5000) {
    if (isAdmin) return conn.sendMessage(m.chat, { text: `_*< ANTI-TRABAS />*_\n\n*[ ℹ️ ] O administrador @${m.sender.split('@')[0]} enviou uma mensagem que contém muitos caracteres.* `, mentions: [m.sender] }, { quoted: fakemek });
    conn.sendMessage(m.chat, { text: `*[ ! ] Foi detectada uma mensagem que contém muitos caracteres [ ! ]*\n${isBotAdmin ? '' : 'Não sou administrador, não posso fazer nada :/'}`.trim(), quoted: fakemek });
    if (isBotAdmin && bot.restrict) {
      conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
      setTimeout(() => {
        conn.sendMessage(m.chat, { text: `Marcar o chat como lido ✓ \n${'\n'.repeat(400)}\n=> O número : wa.me/${m.sender.split('@')[0]}\n=> Apelido ${name}\n[ ! ] Acabou de enviar um texto que contém muitos caracteres que pode causar falhas nos dispositivos `, mentions: [m.sender] }, { quoted: fakemek });
      }, 0);
      setTimeout(() => {
        conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      }, 1000);
    } else if (!bot.restrict) return m.reply('[ ! ] Para realizar ações de eliminação, meu dono precisa ativar o modo restrito! ');
  }
  return !0;
}

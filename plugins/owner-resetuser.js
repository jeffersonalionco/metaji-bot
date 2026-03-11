const handler = async (m, { conn, text }) => {
  const numberPattern = /\d+/g;
  let user = '';
  const numberMatches = text?.match(numberPattern);
  if (numberMatches) {
      const number = numberMatches.join('');
      user = number + '@s.whatsapp.net';
  } else if (m.quoted && await m?.quoted?.sender) {
      const quotedNumberMatches = await m?.quoted?.sender.match(numberPattern);
      if (quotedNumberMatches) {
          const number = quotedNumberMatches.join('');
          user = number + '@s.whatsapp.net';
      } else {
          return conn.sendMessage(m.chat, { text: `*[❗] Formato de usuário não reconhecido. Responda a uma mensagem, marque um usuário ou escreva seu número.*` }, { quoted: m });
      }
  } else {
      return conn.sendMessage(m.chat, { text: `*[❗] Formato de usuário não reconhecido. Responda a uma mensagem, marque um usuário ou escreva seu número.*` }, { quoted: m });
  }
  const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {};
  const participants = m.isGroup ? groupMetadata.participants : [];
  const users = m.isGroup ? participants.find(u => u.jid == user) : {};
  const userNumber = user.split('@')[0];
  const db = global.db || global.global?.db;
  if (!db?.data?.users[user] || db.data.users[user] == '') {
      return conn.sendMessage(m.chat, { text: `*[❗] O usuário @${userNumber} não está na minha base de dados.*`, mentions: [user] }, { quoted: m });
  }
  delete db.data.users[user];
  conn.sendMessage(m.chat, { text: `*[❗] Todos os dados do usuário @${userNumber} na base de dados foram eliminados.*`, mentions: [user] }, { quoted: m });
};
handler.tags = ['owner'];
handler.command = /(restablecerdatos|deletedatauser|resetuser)$/i;
handler.rowner = true;
export default handler;

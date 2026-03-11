const handler = async (m, {conn, participants, usedPrefix, command}) => {
  const BANtext = `*[❗] Marque uma pessoa ou responda a uma mensagem enviada pelo usuário que deseja banir.*\n*${usedPrefix + command} @${global.suittag}*`;
  if (!await await m.mentionedJid[0] && !m.quoted) return m.reply(BANtext, m.chat, {mentions: conn.parseMention(BANtext)});
  let who;
  if (m.isGroup) who = await await m.mentionedJid[0] ? await await m.mentionedJid[0] : await m?.quoted?.sender;
  else who = m.chat;
  const users = global.db.data.users;
  users[who].banned = true;
  m.reply(`*[❗] O usuário foi banido com sucesso.*\n*—◉ O usuário não poderá usar o bot até ser desbanido.*`);
};
handler.command = /^banuser$/i;
handler.rowner = true;
export default handler;

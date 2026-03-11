const handler = async (m, {conn, text}) => {
  if (!text) throw `*[❗] Marque a pessoa com @.*`;
  let who;
  if (m.isGroup) who = await await m.mentionedJid[0];
  else who = m.chat;
  if (!who) throw `*[❗] Marque a pessoa com @.*`;
  const users = global.db.data.users;
  users[who].banned = false;
  conn.reply(m.chat, `*[❗] O usuário foi desbanido com sucesso.*\n*—◉ O usuário já pode usar o bot.*`, m);
};
handler.help = ['unbanuser'];
handler.tags = ['owner'];
handler.command = /^unbanuser$/i;
handler.rowner = true;
export default handler;

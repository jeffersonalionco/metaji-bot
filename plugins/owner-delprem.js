const handler = async (m, {conn, text, usedPrefix, command}) => {
  let who;
  if (m.isGroup) who = await await m.mentionedJid[0] ? await await m.mentionedJid[0] : m.quoted ? await m?.quoted?.sender : false;
  else who = m.chat;
  const user = global.db.data.users[who];
  if (!who) throw `*[❗] Marque a pessoa com @ ou responda a alguma mensagem da pessoa que deseja remover dos usuários premium.*`;
  if (!user) throw `*[❗] O usuário não foi encontrado na minha base de dados.*`;
  if (user.premiumTime == 0) throw `*[❗] O usuário não é premium.*`;
  const txt = text.replace('@' + who.split`@`[0], '').trim();

  user.premiumTime = 0;
  user.premium = false;

  const textdelprem = `*[❗] @${who.split`@`[0]} foi removido dos usuários premium.*`;
  m.reply(textdelprem, null, {mentions: conn.parseMention(textdelprem)});
};
handler.help = ['delprem <@user>'];
handler.tags = ['owner'];
handler.command = /^(remove|-|del)prem$/i;
handler.group = true;
handler.rowner = true;
export default handler;

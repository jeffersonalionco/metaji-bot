import MessageType from "baileys";

const pajak = 0;
const handler = async (m, {conn, text}) => {
  let who;
  if (m.isGroup) who = await await m.mentionedJid[0];
  else who = m.chat;
  if (!who) throw `*[❗] Marque um usuário com @.*`;
  const txt = text.replace('@' + who.split`@`[0], '').trim();
  if (!txt) throw `*[❗] Digite a quantidade de experiência (XP) que deseja adicionar.*`;
  if (isNaN(txt)) throw `*[❗] Símbolo não permitido, apenas números!*`;
  const xp = parseInt(txt);
  let exp = xp;
  const pjk = Math.ceil(xp * pajak);
  exp += pjk;
  if (exp < 1) throw `*[❗] O número mínimo de experiência (XP) para adicionar é 1*`;
  const users = global.db.data.users;
  users[who].exp += xp;
  m.reply(`≡ *XP adicionado*
┌──────────────
▢  *Total:* ${xp}
└──────────────`);
};
handler.command = ['añadirxp', 'addexp'];
handler.rowner = true;
export default handler;

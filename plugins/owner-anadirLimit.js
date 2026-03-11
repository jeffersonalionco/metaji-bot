import MessageType from "baileys";

const pajak = 0;
const handler = async (m, {conn, text}) => {
  let who;
  if (m.isGroup) who = await await m.mentionedJid[0];
  else who = m.chat;
  if (!who) throw `*[❗] Marque um usuário com @.*`;
  const txt = text.replace('@' + who.split`@`[0], '').trim();
  if (!txt) throw `*[❗] Digite a quantidade de diamantes que deseja adicionar.*`;
  if (isNaN(txt)) throw `*[❗] Símbolo não permitido, apenas números!*`;
  const dmt = parseInt(txt);
  let limit = dmt;
  const pjk = Math.ceil(dmt * pajak);
  limit += pjk;
  if (limit < 1) throw `*[❗] O número mínimo de diamantes para adicionar é 1*`;
  const users = global.db.data.users;
  users[who].limit += dmt;
  m.reply(`≡ *Diamantes adicionados*
┌──────────────
▢ *Total:* ${dmt}
└──────────────`);
};
handler.command = ['añadirdiamantes', 'addd', 'dard', 'dardiamantes'];
handler.rowner = true;
export default handler;



const handler = async (m, {command, usedPrefix, text}) => {
  const M = m.constructor;
  const which = command.replace(/agregar/i, '');
  if (!m.quoted) throw '*[❗𝐈𝐍𝐅𝐎❗] Responda a um texto, mensagem, imagem, etc. e adicione um texto como palavra-chave*';
  if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] Use ${usedPrefix}list${which} para ver a lista de mensagens*`;
  const msgs = global.db.data.msgs;
  if (text in msgs) throw `*[❗𝐈𝐍𝐅𝐎❗] '${text}' já está registrado na lista de mensagens*`;
  msgs[text] = M.toObject(await m.getQuotedObj());
  m.reply(`*[❗𝐈𝐍𝐅𝐎❗] Mensagem adicionada com sucesso à lista como '${text}'\n*Acesse com ${usedPrefix}ver${which} ${text}*`);
};
handler.help = ['vn', 'msg', 'video', 'audio', 'img', 'sticker'].map((v) => 'add' + v + ' <text>');
handler.tags = ['database'];
handler.command = /^agregar(vn|msg|video|audio|img|sticker)$/;
handler.rowner = true;
export default handler;

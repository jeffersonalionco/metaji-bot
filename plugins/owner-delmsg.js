const handler = async (m, {command, usedPrefix, text}) => {
  const which = command.replace(/eliminar/i, '');
  if (!text) throw `*[❗] Use ${usedPrefix}list${which} para ver a lista.*`;
  const msgs = global.db.data.msgs;
  if (!(text in msgs)) throw `*[❗] '${text}' não está registrado na lista de mensagens.*`;
  delete msgs[text];
  m.reply(`*[❗] Mensagem com o nome '${text}' eliminada com sucesso da lista.*`);
};
handler.help = ['vn', 'msg', 'video', 'audio', 'img', 'sticker'].map((v) => 'del' + v + ' <text>');
handler.tags = ['database'];
handler.command = /^eliminar(vn|msg|video|audio|img|sticker)$/;
handler.rowner = true;
export default handler;

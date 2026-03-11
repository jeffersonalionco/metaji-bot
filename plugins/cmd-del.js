

const handler = async (m, {conn, usedPrefix, text, command}) => {
  const datas = global

  let hash = text;
  if (m.quoted && m.quoted.fileSha256) hash = m.quoted.fileSha256.toString('hex');
  if (!hash) throw `*[❗] Só pode atribuir textos ou comandos a stickers ou imagens, para obter o código atribuído use o comando ${usedPrefix}listcmd*`;
  const sticker = global.db.data.sticker;
  if (sticker[hash] && sticker[hash].locked) throw `*[❗] Apenas o dono pode realizar a exclusão*`;
  delete sticker[hash];
  m.reply(`*[ ✔ ] O texto/comando atribuído ao sticker/imagem foi removido da base de dados corretamente*`);
};
handler.command = ['delcmd'];
handler.rowner = true;
export default handler;

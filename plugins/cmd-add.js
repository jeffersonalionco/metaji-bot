
const handler = async (m, {conn, text, usedPrefix, command}) => {
  global.db.data.sticker = global.db.data.sticker || {};
  if (!m.quoted) throw `*[❗𝐈𝐍𝐅𝐎❗] Responda ao sticker ou imagem ao qual deseja adicionar um comando ou texto.*`;
  if (!m.quoted.fileSha256) throw `*[❗𝐈𝐍𝐅𝐎❗] Apenas é possível atribuir comandos ou textos a stickers e imagens.*`;
  if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] Erro de uso, texto faltando*\n*—◉ ${usedPrefix + command} <texto> <responder a sticker ou imagem>*\n\n*Exemplo de uso correto:*\n*—◉ ${usedPrefix + command} <#menu> <responder a sticker ou imagem>*`;
  const sticker = global.db.data.sticker;
  const hash = m.quoted.fileSha256.toString('base64');
  if (sticker[hash] && sticker[hash].locked) throw `*[❗𝐈𝐍𝐅𝐎❗] Apenas o proprietário pode realizar a modificação.*`;
  sticker[hash] = {text, mentionedJid: await m.mentionedJid, creator: m.sender, at: + new Date, locked: false};
  m.reply(`*[✔] O texto/comando atribuído ao sticker/imagem foi adicionado à base de dados corretamente.*`);
};
handler.command = ['setcmd', 'addcmd', 'cmdadd', 'cmdset'];
handler.rowner = true;
export default handler;

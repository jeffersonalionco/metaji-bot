import fs from 'fs';

let handler = async (m, { text }) => {
  if (!text) throw `Digite um nome para o arquivo de imagem com a extensão desejada (ex: nome.png, nome.jpg).`;
  if (!m.quoted || !m.quoted.fileSha256) throw `Responda à imagem que deseja salvar.`;
  let media = await m.quoted.download();
  const path = `src/${text}`;
  await fs.writeFileSync(path, media);
  m.reply(`Imagem salva como ${path}`);
};

handler.help = ['saveimage <nome>'];
handler.tags = ['tools'];
handler.command = /^(saveimage|sp)$/i;
handler.owner = true;

export default handler;

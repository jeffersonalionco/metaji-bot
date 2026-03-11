/* Desarrollado y Creado por: Group MetaJI */

const handler = async (m, {conn, usedPrefix, command}) => {
  if (!m.quoted) throw `*[❗𝐈𝐍𝐅𝐎❗] Responda a um vídeo que deseja converter em GIF com áudio*`;
  const q = m.quoted || m;
  const mime = (q.msg || q).mimetype || '';
  if (!/(mp4)/.test(mime)) throw `*[❗] O tipo de arquivo ${mime} não é correto, responda a um vídeo que deseja converter em GIF com áudio*`;
  m.reply(global.wait);
  const media = await q.download();
  conn.sendMessage(m.chat, {video: media, gifPlayback: true, caption: `*Aqui está seu GIF com áudio, ao abrir será reproduzido com áudio*`}, {quoted: m});
};

handler.help = ['togifaud'];
handler.tags = ['converter'];
handler.command = ['togifaud'];

export default handler;

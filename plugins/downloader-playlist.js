import yts from 'yt-search';

const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*[❗] Digite o nome da música, por favor use o comando mais o nome/título de uma música*\n\n*—◉ Exemplo:*\n*${usedPrefix + command} Begin you*`;
  try {
    const vids_ = {
      from: m.sender,
      urls: [],
    };
    if (!global.videoList) {
      global.videoList = [];
    }
    if (global.videoList[0]?.from == m.sender) {
      global.videoList.splice(0, global.videoList.length);
    }
    const results = await yts(text);
    const textoInfo = `*[❗] Você pode baixar o vídeo que quiser da seguinte forma:*
◉ ${usedPrefix}audio <numero>
◉ ${usedPrefix}video <numero>

*—◉ Exemplos:*
*◉ ${usedPrefix}audio 5*
*◉ ${usedPrefix}video 8*`.trim();
    const teks = results.all.map((v, i) => {
      const link = v.url;
      vids_.urls.push(link);
      return `[${i + 1}] ${v.title}
↳ 🫐 *Link:* ${v.url}
↳ 🕒 *Duração:* ${v.timestamp}
↳ 📥 *Enviado:* ${v.ago}
↳ 👁 *Visualizações:* ${v.views}`;
    }).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n');
    conn.sendFile(m.chat, results.all[0].thumbnail, 'yts.jpeg', textoInfo + '\n\n' + teks, m);
    global.videoList.push(vids_);
  } catch {
    await m.reply(`*[❗] Erro, por favor tente novamente com outro nome de música*`);
  }
};
handler.help = ['playlist *<texto>*'];
handler.tags = ['search'];
handler.command = /^playlist|playlist2$/i;
export default handler;

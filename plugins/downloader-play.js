import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) throw `_*< BAIXAR - PLAY />*_\n\n*[ ℹ️ ] Digite o título ou link do vídeo do YouTube.*\n\n*[ 💡 ] Exemplo:* ${usedPrefix + command} Good Feeling - Flo Rida_`;
  let additionalText = '';
  if (['play'].includes(command)) {
    additionalText = 'áudio';
  } else if (['play2'].includes(command)) {
    additionalText = 'vídeo';
  }

  const regex = "https://youtube.com/watch?v="
  const result = await search(args.join(' '))
  const body = `_*< BAIXAR - PLAY />*_\n\n▢ *Título:* ${result.title}\n▢ *Publicado:* ${result.ago}\n▢ *Duração:* ${result.duration.timestamp}\n▢ *Visualizações:* ${formatNumber(result.views)}\n▢ *Autor:* ${result.author.name}\n▢ *ID:* ${result.videoId}\n▢ *Tipo:* ${result.type}\n▢ *Link:* ${result.url}\n▢ *Canal:* ${result.author.url}\n\n*[ ℹ️ ] Enviando o ${additionalText}, aguarde...*`.trim();
  conn.sendMessage(m.chat, { image: { url: result.thumbnail }, caption: body }, { quoted: m });

  if (command === 'play') {
    try {
      const audiodlp = await tools.downloader.ytmp3(regex + result.videoId);
      const downloader = audiodlp.download;
      conn.sendMessage(m.chat, { audio: { url: downloader }, mimetype: "audio/mpeg" }, { quoted: m });
    } catch (error) {
      console.log('❌ Error en tools.downloader.ytmp3, intentando Ruby-core fallback...', error);
      try {
        const ruby = await (
          await fetch(
            `https://ruby-core.vercel.app/api/download/youtube/mp3?url=${encodeURIComponent(regex + result.videoId)}`
          )
        ).json();
        if (ruby?.status && ruby?.download?.url) {
          const audioLink = ruby.download.url;
          await conn.sendMessage(
            m.chat,
            { audio: { url: audioLink }, mimetype: "audio/mpeg" },
            { quoted: m }
          );
        } else {
          conn.reply(m.chat, `_*< BAIXAR - PLAY />*_\n\n*[ ℹ️ ] Ocorreu um erro. Por favor, tente novamente mais tarde.*`, m);
        }
      } catch (err2) {
        console.log('❌ Falla en fallback Ruby-core mp3:', err2);
        conn.reply(m.chat, `_*< BAIXAR - PLAY />*_\n\n*[ ℹ️ ] Ocorreu um erro. Por favor, tente novamente mais tarde.*`, m);
      }
    }
  }

  if (command === 'play2') {
    try {
      const videodlp = await tools.downloader.ytmp4(regex + result.videoId);
      const downloader = videodlp.download;
      conn.sendMessage(m.chat, { video: { url: downloader }, mimetype: "video/mp4" }, { quoted: m });
    } catch (error) {
      console.log('❌ Error en tools.downloader.ytmp4, intentando Ruby-core fallback...', error);
      try {
        const ruby = await (
          await fetch(
            `https://ruby-core.vercel.app/api/download/youtube/mp4?url=${encodeURIComponent(regex + result.videoId)}`
          )
        ).json();
        if (ruby?.status && ruby?.download?.url) {
          const videoLink = ruby.download.url;
          await conn.sendMessage(
            m.chat,
            { video: { url: videoLink }, mimetype: "video/mp4" },
            { quoted: m }
          );
        } else {
          conn.reply(m.chat, `_*< BAIXAR - PLAY />*_\n\n*[ ℹ️ ] Ocorreu um erro. Por favor, tente novamente mais tarde.*`, m);
        }
      } catch (err2) {
        console.log('❌ Falla en fallback Ruby-core mp4:', err2);
        conn.reply(m.chat, `_*< BAIXAR - PLAY />*_\n\n*[ ℹ️ ] Ocorreu um erro. Por favor, tente novamente mais tarde.*`, m);
      }
    }
  }
};

handler.help = ['play', 'play2'];
handler.tags = ['downloader'];
//handler.command = ['play', 'play2'];

export default handler;

async function search(query, options = {}) {
  const searchRes = await yts.search({ query, hl: 'es', gl: 'ES', ...options });
  return searchRes.videos[0];
}

function formatNumber(num) {
  return num.toLocaleString();
}

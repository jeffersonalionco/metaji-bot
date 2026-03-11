import fetch from 'node-fetch';
import cheerio from 'cheerio';

const handler = async (m, {conn, args, command, usedPrefix}) => {
  if (!db.data.chats[m.chat].modohorny && m.isGroup) {
    throw `*[❗] Comandos +18 estão desativados neste grupo. Se você for admin e quiser ativar, use* ${usedPrefix}enable modohorny*`;
  }
  if (!args[0]) {
    throw `*[❗] Informe um link válido do XNXX. Exemplo:* ${usedPrefix + command} https://www.xnxx.com/video-14lcwbe8/rubia_novia_follada_en_cuarto_de_bano*`;
  }
  try {
    await conn.reply(
      m.chat,
      '[❗] O vídeo está sendo processado, aguarde um momento...\n\n- O tempo de envio depende do tamanho e da duração do vídeo.',
      m,
    );
    let xnxxLink = '';
    if (args[0].includes('xnxx')) {
      xnxxLink = args[0];
    } else {
      const index = parseInt(args[0]) - 1;
      if (index >= 0) {
        if (Array.isArray(global.videoListXXX) && global.videoListXXX.length > 0) {
          const matchingItem = global.videoListXXX.find((item) => item.from === m.sender);
          if (matchingItem) {
            if (index < matchingItem.urls.length) {
              xnxxLink = matchingItem.urls[index];
            } else {
              throw `*[❗] Não encontrei link para esse número. Por favor informe um número entre 1 e ${matchingItem.urls.length}*`;
            }
          } else {
            throw `*[❗] Para usar por número (${usedPrefix + command} <número>), primeiro faça a busca de vídeos com* ${usedPrefix}xnxxsearch <texto>*`;
          }
        } else {
          throw `*[❗] Para usar por número (${usedPrefix + command} <número>), primeiro faça a busca de vídeos com* ${usedPrefix}xnxxsearch <texto>*`;
        }
      }
    }
    const res = await xnxxdl(xnxxLink);
    const json = await res.result.files;
    conn.sendMessage(m.chat, {document: {url: json.high}, mimetype: 'video/mp4', fileName: res.result.title}, {quoted: m});
  } catch {
    throw `*[❗] Erro, por favor tente novamente.*\n\n*- Verifique se o link é parecido com:*\n*◉ https://www.xnxx.com/video-14lcwbe8/rubia_novia_follada_en_cuarto_de_bano*`;
  }
};
handler.tags = ['nsfw'];
handler.help = ['xnxxdl'];
handler.command = /^(xnxxdl)$/i;
export default handler;

async function xnxxdl(URL) {
  return new Promise((resolve, reject) => {
    fetch(`${URL}`, {method: 'get'}).then((res) => res.text()).then((res) => {
      const $ = cheerio.load(res, {xmlMode: false});
      const title = $('meta[property="og:title"]').attr('content');
      const duration = $('meta[property="og:duration"]').attr('content');
      const image = $('meta[property="og:image"]').attr('content');
      const videoType = $('meta[property="og:video:type"]').attr('content');
      const videoWidth = $('meta[property="og:video:width"]').attr('content');
      const videoHeight = $('meta[property="og:video:height"]').attr('content');
      const info = $('span.metadata').text();
      const videoScript = $('#video-player-bg > script:nth-child(6)').html();
      const files = {
        low: (videoScript.match(/html5player\.setVideoUrlLow\('(.*?)'\);/) || [])[1],
        high: (videoScript.match(/html5player\.setVideoUrlHigh\('(.*?)'\);/) || [])[1],
        HLS: (videoScript.match(/html5player\.setVideoHLS\('(.*?)'\);/) || [])[1],
        thumb: (videoScript.match(/html5player\.setThumbUrl\('(.*?)'\);/) || [])[1],
        thumb69: (videoScript.match(/html5player\.setThumbUrl169\('(.*?)'\);/) || [])[1],
        thumbSlide: (videoScript.match(/html5player\.setThumbSlide\('(.*?)'\);/) || [])[1],
        thumbSlideBig: (videoScript.match(/html5player\.setThumbSlideBig\('(.*?)'\);/) || [])[1]};
      resolve({status: 200, result: {title, URL, duration, image, videoType, videoWidth, videoHeight, info, files}});
    }).catch((err) => reject({code: 503, status: false, result: err}));
  });
}

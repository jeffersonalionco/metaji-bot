/* Created By https://github.com/ALBERTO9883 */
import fetch from 'node-fetch';
import {googleImage} from '@bochilteam/scraper';

const handler = async (m, {text, conn}) => {
  if (!text) throw `*[❗] Digite o nome do pacote que deseja buscar.*`;
  try {
    const res2 = await googleImage(text);
    const sfoto = res2.getRandom();
    const json = await fetch(`https://api.lolhuman.xyz/api/stickerwa?apikey=${lolkeysapi}&query=${text}`);
    const jsons = await json.json();
    const {stickers} = jsons.result[0];
    const res = jsons.result.map((v, index) => `*🌅 • Resultado:* ${1 + index}\n*🥗 • Nome:* ${v.title}\n*🐢 • Autor:* ${v.author}\n*🍂 • Url:* ${v.url}`).join`\n\n───\n\n`;
    await conn.sendFile(m.chat, sfoto, 'error.jpg', res, m);
  } catch {
    await m.reply('*[❗] Erro, por favor tente novamente.*');
  }
};
handler.command = ['stickersearch2', 'searchsticker2', 'stickerssearch2', 'searchstickers2'];
export default handler;

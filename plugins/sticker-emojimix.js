import {sticker} from '../src/libraries/sticker.js';
import fetch from 'node-fetch';

const handler = async (m, {conn, text, args}) => {
 if (!args[0]) throw '*[❗] O uso deste comando deve ser #emojimix <emoji 1>&<emoji 2>*\n*Exemplo:*\n*#emojimix 🤨&😣*';
 const [emoji1, emoji2] = text.split`&`;
 const anu = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`);
 for (const res of anu.results) {
   const stiker = await sticker(false, res.url, global.packname, global.author);
   conn.sendFile(m.chat, stiker, null, {asSticker: true});
 }
};

handler.help = ['emojimix emot1|emot2>'];
handler.tags = ['sticker'];
handler.command = /^(emojimix)$/i;
export default handler;

const fetchJson = (url, options) => new Promise(async (resolve, reject) => {
  fetch(url, options)
    .then((response) => response.json())
    .then((json) => resolve(json))
    .catch((err) => reject(err));
});

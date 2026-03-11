import uploadImage from '../src/libraries/uploadImage.js';
import {sticker} from '../src/libraries/sticker.js';

const effects = ['jail', 'gay', 'glass', 'wasted', 'triggered', 'lolice', 'simpcard', 'horny'];

const handler = async (m, {conn, usedPrefix, text}) => {
 const effect = text.trim().toLowerCase();
 if (!effects.includes(effect)) {
   throw `
*_✳️ Uso correto do comando ✳️_*
*👉 Use:* ${usedPrefix}stickermaker (efeito)
- E responda a uma imagem
*✅ Exemplo:* ${usedPrefix}stickermaker jail
*Lista de efeitos:*
${effects.map((e) => `_> ${e}_`).join('\n')}
`.trim();
 }
 const q = m.quoted ? m.quoted : m;
 const mime = (q.msg || q).mimetype || '';
 if (!mime) throw '*_🔰 Nenhuma imagem encontrada_*\n\n*_✅ Responda a uma imagem_*';
 if (!/image\/(jpe?g|png)/.test(mime)) throw '*_⚠️ Formato não suportado_*\n\n*_👉🏻 Responda a uma imagem_*';
 const img = await q.download();
 const url = await uploadImage(img);
 const apiUrl = global.API('https://some-random-api.com/canvas/', encodeURIComponent(effect), { avatar: url });
 try {
   const stiker = await sticker(null, apiUrl, global.packname, global.author);
   conn.sendFile(m.chat, stiker, null, {asSticker: true});
 } catch (e) {
   m.reply('*_⚠️ Ocorreu um erro ao converter para sticker_*\n\n*_✳️ Enviando imagem..._*');
   await conn.sendFile(m.chat, apiUrl, 'image.png', null, m);
 }
};

handler.help = ['stickmaker (caption|reply media)'];
handler.tags = ['sticker'];
handler.command = /^(stickmaker|stickermaker|stickermarker|cs)$/i;
export default handler;

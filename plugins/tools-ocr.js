import fetch from 'node-fetch';
import uploadImage from '../src/libraries/uploadImage.js';

const handler = async (m, {conn}) => {
 const q = m.quoted ? m.quoted : m;
 const mime = (q || q.msg).mimetype || q.mediaType || '';
 if (/image/.test(mime)) {
   const img = await q.download();
   const url = await uploadImage(img);
   const res = await fetch(global.API('https://api.ocr.space', '/parse/imageurl', {apikey: '8e65f273cd88957', url}));
   if (res.status !== 200) throw res.statusText;
   const json = await res.json();
   m.reply(json?.ParsedResults?.[0]?.ParsedText);
 } else throw '*[❗] Erro, tente novamente. Não esqueça de responder a uma imagem*';
};

handler.command = /^ocr|totexto$/i;
export default handler;

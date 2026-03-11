import uploadImage from '../src/libraries/uploadImage.js';
import fetch from 'node-fetch';

const handler = async (m, {conn, text, usedPrefix, command}) => {
 const q = m.quoted ? m.quoted : m;
 const mime = (q.msg || q).mimetype || '';
 if (!mime) throw '*[❗] Responda ou marque uma imagem*';
 const img = await q.download?.();
 const url = await uploadImage(img);
 const anu = await fetch(`https://api.lolhuman.xyz/api/read-qr?apikey=${lolkeysapi}&img=${url}`);
 const json = await anu.json();
 await m.reply(`*O texto do código QR é:* ${json.result}`);
};

handler.command = /^(readqr)$/i;
export default handler;

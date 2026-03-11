import uploadImage from '../src/libraries/uploadImage.js';

const handler = async (m, {conn, usedPrefix, command, args, text}) => {
 const q = m.quoted ? m.quoted : m;
 const mime = (q.msg || q).mimetype || '';
 if (!mime) throw '⚠️ Responda a uma imagem ou vídeo.';
 if (!text) throw "⚠️ Insira o novo tamanho da imagem/vídeo.";
 if (isNaN(text)) throw '🔢 Apenas números';
 if (!/image\/(jpe?g|png)|video|document/.test(mime)) throw '⚠️ Formato não suportado';
 const img = await q.download();
 const url = await uploadImage(img);

 if (/image\/(jpe?g|png)/.test(mime)) {
   conn.sendMessage(m.chat, {image: {url: url}, caption: 'Aqui está', fileLength: `${text}`, mentions: [m.sender]}, {ephemeralExpiration: 24*3600, quoted: m});
 } else if (/video/.test(mime)) {
   return conn.sendMessage(m.chat, {video: {url: url}, caption: 'Aqui está', fileLength: `${text}`, mentions: [m.sender]}, {ephemeralExpiration: 24*3600, quoted: m});
 }
};

handler.tags = ['tools'];
handler.help = ['tamaño <quantidade>'];
handler.command = /^(length|filelength|edittamaño|totamaño|tamaño)$/i;
export default handler;

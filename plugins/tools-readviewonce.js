const {downloadContentFromMessage} = (await import("baileys"));

const handler = async (m, {conn}) => {
 if (!m.quoted) throw '*[❗] Responda a uma mensagem que foi enviada em visualização única (ver apenas uma vez)*';
 if (!m.quoted.viewOnce) throw '*[❗] A mensagem selecionada não é visualização única (ver apenas uma vez)*';
 const msg = m.quoted;
 const type = msg.mtype;

 try {
   const media = await downloadContentFromMessage(msg, type == 'imageMessage' ? 'image' : type == 'videoMessage' ? 'video' : 'audio');
   let buffer = Buffer.from([]);
   for await (const chunk of media) {
     buffer = Buffer.concat([buffer, chunk]);
   }

   if (/video/.test(type)) {
     return await conn.sendMessage(m.chat, {
       video: buffer,
       caption: msg?.caption || '',
       mimetype: 'video/mp4'
     }, { quoted: m });
   } else if (/image/.test(type)) {
     return await conn.sendMessage(m.chat, {
       image: buffer,
       caption: msg?.caption || '',
       mimetype: 'image/jpeg'
     }, { quoted: m });
   } else if (/audio/.test(type)) {
     return await conn.sendMessage(m.chat, {
       audio: buffer,
       ptt: true,
       mimetype: 'audio/ogg; codecs=opus'
     }, { quoted: m });
   }
 } catch (error) {
   console.error('Erro em readviewonce:', error);
   throw 'Erro ao processar o arquivo de visualização única';
 }
};

handler.help = ['readvo'];
handler.tags = ['tools'];
handler.command = /^(readviewonce|read|revelar|readvo)$/i;
export default handler;

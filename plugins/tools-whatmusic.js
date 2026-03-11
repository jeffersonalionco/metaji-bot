import { Shazam } from 'node-shazam';
import fetch from 'node-fetch';
import fs from 'fs';
import ytSearch from 'yt-search';
import CryptoJS from 'crypto-js';

const shazam = new Shazam();

const handler = async (m, { conn }) => {
 const q = m.quoted || m;
 const mime = (q.msg || q).mimetype || '';

 if (/audio|video/.test(mime)) {
   const media = await q.download();
   const ext = mime.split('/')[1];
   const baseFilePath = `./src/tmp/${m.sender}`;
   const tempPath = await getUniqueFileName(baseFilePath, ext);
   fs.writeFileSync(tempPath, media);

   let recognisePromise;
   if (/audio/.test(mime)) {
     recognisePromise = shazam.fromFilePath(tempPath, false, 'en');
   } else if (/video/.test(mime)) {
     recognisePromise = shazam.fromVideoFile(tempPath, false, 'en');
   }

   const recognise = await recognisePromise;

   if (!recognise || !recognise?.track) {
     fs.unlinkSync(tempPath);
     return m.reply('> *[❗] Erro: Áudio não encontrado.*');
   }

   const { title, subtitle, genres } = recognise.track;
   const apiTitle = `${title} - ${subtitle || ''}`.trim();

   let ytUrl = 'https://github.com/GroupMetaJI';
   try {
     const searchResult = await ytSearch(apiTitle);
     if (searchResult && searchResult.videos.length > 0) {
       ytUrl = searchResult.videos[0].url;
     }
   } catch (error) {
     console.log(error);
   }

   const texto = `𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 𝙳𝙰 𝙱𝚄𝚂𝙲𝙰\n\n• 📌 Título: ${title || 'Não encontrado'}\n• 👨‍🎤 Artista: ${subtitle || 'Não encontrado'}\n• 🌐 Gênero: ${genres?.primary || 'Não encontrado'}`;

   await conn.sendMessage(m.chat, { text: texto.trim(), contextInfo: { forwardingScore: 9999999, isForwarded: true }}, { quoted: m });

   fs.unlinkSync(tempPath);

   if (ytUrl !== 'https://github.com/GroupMetaJI') {
     try {
       const downloadResult = await yt.download(ytUrl);
       if (downloadResult && downloadResult.url) {
         const audiobuff = await conn.getFile(downloadResult.url);
         await conn.sendMessage(m.chat, {
           audio: audiobuff.data,
           fileName: `${title}.mp3`,
           mimetype: 'audio/mpeg'
         }, { quoted: m });
       }
     } catch (error) {
       console.log(error);
     }
   }
 } else {
   throw '*[❗] Responda a um áudio*';
 }
};

handler.command = /^(quemusica|quemusicaes|whatmusic|shazam)$/i;
export default handler;

async function getUniqueFileName(basePath, extension) {
  let fileName = `${basePath}.${extension}`;
  let counter = 1;
  while (fs.existsSync(fileName)) {
    fileName = `${basePath}_${counter}.${extension}`;
    counter++;
  }
  return fileName;
}

const yt = {
  generateToken: () => {
    const payload = JSON.stringify({ timestamp: Date.now() });
    const key = "dyhQjAtqAyTIf3PdsKcJ6nMX1suz8ksZ";
    const token = CryptoJS.AES.encrypt(payload, key).toString();
    return token;
  },
  download: async (youtubeUrl) => {
    const body = JSON.stringify({
      "url": youtubeUrl,
      "quality": 128,
      "trim": false,
      "startT": 0,
      "endT": 0,
      "token": yt.generateToken()
    });
    const result = await fetch("https://ds1.ezsrv.net/api/convert", {
      headers: { "content-type": "application/json" },
      body,
      method: "POST"
    });
    return await result.json();
  }
};

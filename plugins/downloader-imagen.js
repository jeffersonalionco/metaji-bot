import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*[❗] Exemplo de uso do comando: ${usedPrefix + command} Minecraft*`);
  }

  const api = await axios.get(`${global.BASE_API_DELIRIUS}/search/gimage?query=${text}`);
  const data = api.data.data;
  const filteredData = data.filter(image => {
    const url = image.url.toLowerCase();
    return url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png');
  });

  const random = Math.floor(Math.random() * filteredData.length);
  const image = filteredData[random];

  conn.sendFile(m.chat, image.url, 'error.jpg', `🔎 *Resultado de:* ${text}\n🔗 *Link:* ${image.origin.website.url}\n🌎 *Buscador:* Google`, m);
};

handler.help = ['image'];
handler.tags = ['internet', 'tools'];
handler.command = ['imagen', 'gimage', 'image'];

export default handler;
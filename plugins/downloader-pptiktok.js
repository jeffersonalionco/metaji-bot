import fetch from 'node-fetch';

const handler = async (m, {conn, args, text}) => {
  if (!text) throw `*[❗] Digite o nome de usuário do TikTok.*`;
  const res = `https://api.lolhuman.xyz/api/pptiktok/${text}?apikey=${lolkeysapi}`;
  conn.sendFile(m.chat, res, 'error.jpg', `*[ ✔ ] Aqui está a foto de perfil de ${text}*`, m, false);
};
handler.help = ['tiktokfoto'].map((v) => v + ' <username>');
handler.tags = ['downloader'];
handler.command = /^(tiktokfoto|pptiktok)$/i;
export default handler;

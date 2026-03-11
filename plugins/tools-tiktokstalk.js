import axios from 'axios';

const handler = async (m, { conn, text }) => {
 if (!text) return conn.reply(m.chat, '*[❗] Insira o comando mais o nome de usuário do TikTok que deseja ver*', m);
 try {
   const response = await axios.get("https://delirius-apiofc.vercel.app/tools/tiktokstalk", { params: { q: text } });
   const data = response.data;
   if (data.status && data.result) {
     const user = data.result.users;
     const stats = data.result.stats;
     const body = `*Usuário:* ${user.username || '-'}\n*Nome:* ${user.nickname || '-'}\n*Seguidores:* ${stats.followerCount || '-'}\n*Seguindo:* ${stats.followingCount || '-'}\n*Likes:* ${stats.likeCount || '-'}\n*Vídeos:* ${stats.videoCount || '-'}\n*Descrição:* ${user.signature || '-'}`.trim();
     const imageUrl = user.avatarLarger;
     const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
     const imageBuffer = Buffer.from(imageResponse.data, "binary");
     await conn.sendFile(m.chat, imageBuffer, 'profile.jpg', body, m);
   } else {
     throw '*[❗] Erro, não foi possível encontrar o nome de usuário inserido*';
   }
 } catch (e) {
   throw '*[❗] Erro, não foi possível encontrar o nome de usuário inserido*';
 }
};

handler.help = ['tiktokstalk'];
handler.tags = ['tools'];
handler.command = ['ttstalk', 'tiktokstalk'];

export default handler;

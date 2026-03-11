import {Anime} from '@shineiichijo/marika';

const client = new Anime();
const handler = async (m, {conn, text}) => {
  if (!text) return m.reply(`*[❗] Digite o nome de algum anime para buscar.*`);
  try {
    const anime = await client.searchAnime(text);
    const result = anime.data[0];
    const AnimeInfo = `
🎀 • *Título:* ${result.title}
🎋 • *Formato:* ${result.type}
📈 • *Estado:* ${result.status.toUpperCase().replace(/\_/g, ' ')}
🍥 • *Episódios totais:* ${result.episodes}
🎈 • *Duração:* ${result.duration}
✨ • *Baseado em:* ${result.source.toUpperCase()}
💫 • *Estreou:* ${result.aired.from}
🎗 • *Finalizado:* ${result.aired.to}
🎐 • *Popularidade:* ${result.popularity}
🎏 • *Favoritos:* ${result.favorites}
🎇 • *Classificação:* ${result.rating}
🏅 • *Ranking:* ${result.rank}
♦ • *Trailer:* ${result.trailer.url}
🌐 • *URL:* ${result.url}
🎆 • *Background:* ${result.background}
❄ • *Sinopse:* ${result.synopsis}`;
    conn.sendFile(m.chat, result.images.jpg.image_url, 'error.jpg', AnimeInfo, m);
  } catch {
    throw `*[❗] Erro, tente novamente.*`;
  }
};
handler.command = /^(anime|animeinfo)$/i;
export default handler;

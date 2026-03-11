import {toAudio} from '../src/libraries/converter.js';

const handler = async (m, {conn, usedPrefix, command}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q || q.msg).mimetype || q.mediaType || '';
  if (!/video|audio/.test(mime)) throw `*[❗𝐈𝐍𝐅𝐎❗] Responda ao vídeo ou nota de voz que deseja converter em áudio/MP3*`;
  const media = await q.download();
  if (!media) throw `*[❗𝐈𝐍𝐅𝐎❗] Desculpe, ocorreu um erro ao baixar seu vídeo, por favor tente novamente.*`;
  const audio = await toAudio(media, 'mp4');
  if (!audio.data) throw `*[❗𝐈𝐍𝐅𝐎❗] Desculpe, ocorreu um erro ao converter sua nota de voz em áudio/MP3, por favor tente novamente.*`;
  conn.sendMessage(m.chat, { audio: audio.data, mimetype: 'audio/mpeg' }, { quoted: m });
};

handler.help = ['tomp3'];
handler.tags = ['converter'];
handler.command = ['tomp3', 'toaudio'];

export default handler;

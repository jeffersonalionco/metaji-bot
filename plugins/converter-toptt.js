import {toPTT} from '../src/libraries/converter.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pt = require('../src/languages/pt.json');

const handler = async (m, {conn, usedPrefix, command}) => {
 const TOPTT = pt.plugins.convertidor_toptt;
  
 const q = m.quoted ? m.quoted : m;
 const mime = (m.quoted ? m.quoted : m.msg).mimetype || '';
 if (!/video|audio/.test(mime)) throw `*${TOPTT.texto1}*`;
 const media = await q.download?.();
 if (!media && !/video/.test(mime)) throw `*${TOPTT.texto2}*`;
 if (!media && !/audio/.test(mime)) throw `*${TOPTT.texto3}*`;
 const audio = await toPTT(media, 'mp4');
 if (!audio.data && !/audio/.test(mime)) throw `*${TOPTT.texto4}*`;
 if (!audio.data && !/video/.test(mime)) throw `*${TOPTT.texto5}*`;
 const aa = conn.sendFile(m.chat, audio.data, 'error.mp3', '', m, true, { mimetype: 'audio/mpeg' });
 if (!aa) return conn.sendMessage(m.chat, { audio: { url: media }, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
};

handler.help = ['tovn'];
handler.tags = ['converter'];
handler.command = ['tovn', 'toptt'];

export default handler;

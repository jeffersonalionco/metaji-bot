import uploadImage from '../src/libraries/uploadImage.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pt = require('../src/languages/pt.json');

const handler = async (m) => {
  const TOURL = pt.plugins.convertidor_tourl;

  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''
  if (!mime) throw `*${TOURL.texto1}*`;
  const buffer = await q.download();
  const link = await uploadImage(buffer);
  m.reply(`*${TOURL.texto2}* ${link}`);
};

handler.help = ['tourl'];
handler.tags = ['converter'];
handler.command = ['upload', 'uploader', 'tourl'];

export default handler;

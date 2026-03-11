import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pt = require('../src/languages/pt.json');
const VERDAD = pt.plugins.fun_verdad.texto3;

const handler = async (m, {conn}) => {
  conn.reply(m.chat, `*┌────「 𝚅𝙴𝚁𝙳𝙰𝙳 」─*\n*“${pickRandom(VERDAD)}”*\n*└────「 𝙼𝚈𝚂𝚃𝙸𝙲 」─*`, m);
};
handler.help = ['verdad'];
handler.tags = ['game'];
handler.command = /^verdad/i;
export default handler;

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}



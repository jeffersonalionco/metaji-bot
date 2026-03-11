import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pt = require('../src/languages/pt.json');
const PREGUNTA = pt.plugins.fun_pregunta.texto1;

const handler = async (m, { text }) => {
  m.reply(`
${PREGUNTA[0]}
  
${PREGUNTA[1]} ${text}
${PREGUNTA[2]} ${[PREGUNTA[3], PREGUNTA[4], PREGUNTA[5], PREGUNTA[6], PREGUNTA[7], PREGUNTA[8]].getRandom()}
`.trim(), null, await m.mentionedJid ? {
      mentions: await m.mentionedJid,
    } : {});

}
handler.help = ['pregunta <texto>?'];
handler.tags = ['game'];
handler.command = /^pregunta|preguntas|apakah$/i;
export default handler;

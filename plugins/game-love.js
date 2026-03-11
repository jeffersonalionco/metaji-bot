import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pt = require('../src/languages/pt.json');
const LOVE = pt.plugins.fun_love;

const handler = async (m, { conn, text }) => {
  const lovePercentage = Math.floor(Math.random() * 100);
  const isHighLove = lovePercentage >= 50;
  const loveMessages = LOVE.texto1;
  const notSoHighLoveMessages = LOVE.texto2;
  const loveDescription = isHighLove ? LOVE.texto3[0] : LOVE.texto3[1];
  const getRandomMessage = (messages) => messages[Math.floor(Math.random() * messages.length)];
  const loveMessage = isHighLove ? getRandomMessage(loveMessages) : getRandomMessage(notSoHighLoveMessages);
  const response =
    `━━━━━━━⬣ *LOVE* ⬣━━━━━━━\n` +
    `${LOVE.texto4[0]}, ${text} ${LOVE.texto4[1]} @${m.sender.split('@')[0]} ${loveDescription} ${LOVE.texto4[2]} ${lovePercentage}% ${LOVE.texto4[3]}\n\n` +
    `*❥ ${loveMessage}*\n` +
    `━━━━━━━⬣ *LOVE* ⬣━━━━━━━`    
  
  async function loading() {
var hawemod = [
"《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
"《 ████▒▒▒▒▒▒▒▒》30%",
"《 ███████▒▒▒▒▒》50%",
"《 ██████████▒▒》80%",
"《 ████████████》100%"
]
   let { key } = await conn.sendMessage(m.chat, {text: LOVE.texto5, mentions: conn.parseMention(response)}, {quoted: m})
 for (let i = 0; i < hawemod.length; i++) {
   await new Promise(resolve => setTimeout(resolve, 1000)); 
   await conn.sendMessage(m.chat, {text: hawemod[i], edit: key, mentions: conn.parseMention(response)}, {quoted: m}); 
  }
  await conn.sendMessage(m.chat, {text: response, edit: key, mentions: conn.parseMention(response)}, {quoted: m});         
 }
loading()    
};
handler.help = ['love'];
handler.tags = ['game'];
handler.command = /^(love|amor)$/i;
export default handler;

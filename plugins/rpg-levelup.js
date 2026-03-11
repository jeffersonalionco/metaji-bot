import { canLevelUp, xpRange } from '../src/libraries/levelling.js';
import { levelup } from '../src/libraries/canvas.js';


const handler = async (m, { conn }) => {
  const name = conn.getName(m.sender);
  const usertag = '@' + m.sender.split('@s.whatsapp.net')[0];
  const user = global.db.data.users[m.sender];
  if (!canLevelUp(user.level, user.exp, global.multiplier)) {
    const { min, xp, max } = xpRange(user.level, global.multiplier);
    const message = `
🏰 *Guilda de Aventureiros*
*Bem-vindo, ${usertag}!*

*◉ Nível atual:* ${user.level}
*◉ Rank atual:* ${user.role}
*◉ Pontos de Experiência:* ${user.exp - min}/${xp}

*—◉ Para subir de nível você precisa obter ${max - user.exp} pontos de experiência a mais. Continue interagindo com o Bot!*`.trim();
    return conn.sendMessage(m.chat, {text: message, mentions: [m.sender]}, {quoted: m});
  }
  const before = user.level * 1;
  while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++;
  if (before !== user.level) {
    const levelUpMessage = `🎉 Parabéns, ${name}! Você subiu para o nível ${user.level}`;
    const levelUpDetails = `
🚀 *Novo Nível Alcançado*

*◉ Nível anterior:* ${before}
*◉ Novo nível:* ${user.level}
*◉ Rank atual:* ${user.role}

*—◉ Continue explorando e realizando missões para alcançar novos patamares na Guilda de Aventureiros. Continue interagindo com o Bot!*`.trim();
    try {
      const levelUpImage = await levelup(levelUpMessage, user.level);
      conn.sendFile(m.chat, levelUpImage, 'levelup.jpg', levelUpDetails, m);
    } catch (e) {
      conn.sendMessage(m.chat, {text: levelUpDetails, mentions: [m.sender]}, {quoted: m});
    }
  }
};
handler.help = ['levelup'];
handler.tags = ['xp'];
handler.command = ['nivel', 'lvl', 'levelup', 'level'];
export default handler;

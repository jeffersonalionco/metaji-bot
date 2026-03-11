const handler = async (m, { conn, args, participants }) => {
 const users = Object.entries(global.db.data.users)
   .map(([key, value]) => ({
     ...value,
     jid: key,
     exp: Number(value.exp) || 0,
     limit: Number(value.limit) || 0,
     level: Number(value.level) || 0
   }))
   .filter(user =>
     user.jid &&
     user.jid.endsWith("@s.whatsapp.net")
   );

 const sortedExp = [...users].sort((a, b) => b.exp - a.exp); // Usar copia para no mutar 'users'
 const sortedLim = [...users].sort((a, b) => b.limit - a.limit);
 const sortedLevel = [...users].sort((a, b) => b.level - a.level);

 const len = Math.min(args[0] && !isNaN(args[0]) ? Math.max(parseInt(args[0]), 10) : 10, 100);

 const adventurePhrases = [
   ' lidere a aventura e forje seu caminho até o topo.',
   ' desafie o desconhecido e alcance novas alturas!',
   ' sua coragem te guiará ao topo da tabela.',
   ' a cada passo, esculpa sua lenda nesta grande aventura.',
   ' explore, compita e demonstre sua grandeza nesta tabela.',
   ' cada passo conta na sua jornada até o topo do ranking.',
   ' a emoção da competição te impulsiona para frente.',
   ' aventure-se e conquiste os primeiros lugares com determinação.'
 ];
 const randomPhrase = adventurePhrases[Math.floor(Math.random() * adventurePhrases.length)];

 const getText = (list, prop, unit) =>
   list.slice(0, len)
     .map(({ jid, [prop]: val }, i) => {
      const phoneNumber = jid?.split('@')[0] || 'Desconhecido';
      return `□ ${i + 1}. @${phoneNumber}\n□ wa.me/${phoneNumber}\n□ *${val} ${unit}`;
     })
     .join('\n\n');

 const body = `*< TABELA DOS AVENTUREIROS MAIS DESTACADOS />*\n□ ⚔️ ${randomPhrase} ⚔️\n\n` +
   `—◉ *TOP ${len} EXP 🌟*\n` +
   `*👤 Sua posição:* ${sortedExp.findIndex(u => u.jid === m.sender) + 1} de ${users.length}\n\n` +
   `${getText(sortedExp, 'exp', 'exp')}\n\n` +

   `—◉ *TOP ${len} DIAMANTES 💎*\n` +
   `*👤 Sua posição:* ${sortedLim.findIndex(u => u.jid === m.sender) + 1} de ${users.length}\n\n` +
   `${getText(sortedLim, 'limit', 'diamantes')}\n\n` +

   `—◉ *TOP ${len} NIVEL🎚️*\n` +
   `*👤 Sua posição:* ${sortedLevel.findIndex(u => u.jid === m.sender) + 1} de ${users.length}\n\n` +
   `${getText(sortedLevel, 'level', 'nível')}`.trim();

 await conn.sendMessage(m.chat, { text: body, mentions: conn.parseMention(body) }, { quoted: m });
};

handler.help = ['leaderboard'];
handler.tags = ['xp'];
handler.command = ['leaderboard', 'lb'];

export default handler;
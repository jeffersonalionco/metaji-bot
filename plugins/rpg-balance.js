const handler = async (m, {usedPrefix, conn}) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
  else who = m.sender;
  const name = conn.getName(who);
  m.reply(`
┌───⊷ 𝐁𝐀𝐋𝐀𝐍𝐂𝐄 ⊶
▢ *Nome:* ${name}
▢ *Diamantes:* ${global.db.data.users[who].limit}💎
└──────────────

*NOTA:*
*Você pode comprar diamantes 💎 usando os comandos*
❏ *${usedPrefix}buy <quantidade>*
❏ *${usedPrefix}buyall*`);
};
handler.help = ['bal'];
handler.tags = ['xp'];
handler.command = ['bal', 'diamantes', 'diamond', 'balance'];
export default handler;

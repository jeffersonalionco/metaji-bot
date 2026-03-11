const handler = async (m, {conn, isOwner}) => {
  const adv = Object.entries(global.db.data.users).filter((user) => user[1].warn);
  const warns = global.db.data.users.warn;
  const user = global.db.data.users;
  const imagewarn = './src/assets/images/menu/main/warn.jpg';
  const caption = `⚠️ Usuários advertidos

*╔═══════════════════·•*
║ Total: ${adv.length} Usuários
${adv ? '\n' + adv.map(([jid, user], i) => {
i++
return `
║
║ ${i}.- ${isOwner ? '@' + jid.split`@`[0] : jid} *(${user.warn}/3)*\n║\n║ - - - - - - - - -`.trim()}).join('\n') : ''}
*╚══════════════════·•*`;
  await conn.sendMessage(m.chat, {text: caption, mentions: await conn.parseMention(caption)}, {quoted: m});
};

handler.help = ['listwarn'];
handler.tags = ['group'];
handler.command = /^(listwarn)$/i;
handler.group = true;
handler.admin = true;
export default handler;

const handler = async (m, {conn, participants, usedPrefix, command}) => {
  if (!global.db.data.settings[conn.user.jid].restrict) throw `*[ ⚠️ ] O proprietário restringiu (enable restrict / disable restrict) o uso deste comando.*`;
  const kicktext = `*[❗] Marque uma pessoa ou responda a uma mensagem do grupo para eliminar o usuário.*\n\n*—◉ Exemplo:*\n*${usedPrefix + command} @${global.suittag}*`;
  const testi = m.mentionedJid[0]

  if (!testi && !m.quoted) return m.reply(kicktext, m.chat, {mentions: conn.parseMention(kicktext)});
  if (testi?.includes(conn.user.jid)) return;
  const user = await m.mentionedJid[0] ? await m.mentionedJid[0] : await m.quoted?.sender;
  const owr = m.chat.split`-`[0];
  await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
};
handler.tags = ['group'];
handler.help = ['kick2'];
handler.command = /^(kick2|echar2|hechar2|sacar2)$/i;
handler.admin = true;
handler.group = true;
handler.botAdmin = true;
export default handler;

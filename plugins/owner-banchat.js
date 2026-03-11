const handler = async (m, { conn }) => {
  const normalizeJid = (jid) => jid.split('@')[0];
  const thisBot = conn.user.jid;

  const testi = await await m.mentionedJid;
  if (testi && testi.length > 0) {
    const mentionedBot = testi[0];
    console.log(m);
    console.log(mentionedBot);

    if (normalizeJid(mentionedBot) !== normalizeJid(thisBot)) return;

    if (global.db.data.chats[m.chat].isBanned) {
      m.reply('⚠️ Este chat já está banido.');
      return;
    }

    global.db.data.chats[m.chat].isBanned = true;
    m.reply(`✅ Bot ${conn.user.name || 'atual'} banido especificamente deste chat.`);
    return;
  }

  if (global.db.data.chats[m.chat].isBanned) {
    m.reply('⚠️ Este chat já está banido.');
    return;
  }

  global.db.data.chats[m.chat].isBanned = true;
  m.reply('*[❗𝐈𝐍𝐅𝐎❗] Este chat foi banido com sucesso*\n\n*—◉ O bot não reagirá a nenhum comando até desbanir este chat*');
};

handler.help = ['banchat', 'banchat @bot'];
handler.tags = ['owner'];
handler.command = /^banchat$/i;
handler.rowner = true;
export default handler;

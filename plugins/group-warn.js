const handler = async (m, {conn, args, text, command, usedPrefix}) => {
  const datas = global

  const testi = await m?.mentionedJid
  if (testi.includes(conn.user.jid)) return;
  const pp = './src/assets/images/menu/main/warn.jpg';
  if (m.mentionedJid.length === 0 && args.length > 0) m.mentionedJid = conn.parseMention(text)
  let who;
  if (m.isGroup) {
    who = conn.parseMention(text).length > 0 ?
      conn.parseMention(text)[0] :
      m.quoted ?
      await m?.quoted?.sender :
      text;
  } else who = m.chat;
  const user = global.db.data.users[who];
  const bot = global.db.data.settings[conn.user.jid] || {};
  const dReason = 'Sem motivo';
  const msgtext = text || dReason;
  const sdms = msgtext.replace(/@\d+-?\d* /g, '');
  const warntext = `*[❗] Marque uma pessoa ou responda a uma mensagem do grupo para advertir o usuário*\n\n*—◉ Exemplo:* *${usedPrefix + command} @${global.suittag}*`;
  if (!who) {
    throw m.reply(warntext, m.chat, {mentions: conn.parseMention(warntext)});
  }
  user.warn += 1;
  const texto2 = ['Recebeu uma advertência neste grupo!\nMotivo:', '*ADVERTÊNCIAS'];
  await m.reply(
      `${
      user.warn == 1 ? `*@${who.split`@`[0]}*` : `*@${who.split`@`[0]}*`
      } ${texto2[0]} ${sdms}\n${texto2[1]} ${
        user.warn
      }/3*`,
      null,
      {mentions: [who]},
  );
  const texto3 = ['*[❗] O dono do bot não habilitou as restrições', 'Entre em contato com ele para habilitar*'];
  const texto4 = ['Te avisei várias vezes!!', '* Você ultrapassou as *3* advertências, agora será removido(a) 👽'];
  if (user.warn >= 3) {
    if (!bot.restrict) {
      return m.reply(
          `${texto3[0]} (#enable restrict) ${texto3[1]}`,
      );
    }
    user.warn = 0;
    await m.reply(
        `${texto4[0]}\n*@${
          who.split`@`[0]
        }* ${texto4[1]}`,
        null,
        {mentions: [who]},
    );
    await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
  }
  return !1;
};

handler.tags = ['group'];
handler.help = ['warn'];
handler.command = /^(advertir|advertencia|warn|warning)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;

const handler = async (m, {conn, args, usedPrefix, command}) => {
  const isClose = {
    'open': 'not_announcement',
    'close': 'announcement',
    'aberto': 'not_announcement',
    'cerrado': 'announcement',
    'abrir': 'not_announcement',
    'cerrar': 'announcement',
  }[args[0]?.toLowerCase() || ''];

  if (isClose === undefined) {
    throw `*[❗] Formato incorreto!!*

*┏━━━❲ ✨EXEMPLO✨ ❳━━━┓*
*┠┉↯ ${usedPrefix + command} abrir*
*┠┉↯ ${usedPrefix + command} cerrar*`.trim();
  }

  await conn.groupSettingUpdate(m.chat, isClose);
  m.reply(`*[ ✔ ] Grupo configurado corretamente*`);
};

handler.help = ['group open / close'];
handler.tags = ['group'];
handler.command = ['group', 'grupo'];
handler.admin = true;
handler.botAdmin = true;
export default handler;

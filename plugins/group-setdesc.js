const handler = async (m, {conn, args}) => {
  await conn.groupUpdateDescription(m.chat, `${args.join(' ')}`);
  m.reply(`*✅ A descrição do grupo foi modificada corretamente.*`);
};
handler.help = ['setdesc <text>'];
handler.tags = ['group'];
handler.command = /^setdesc$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;

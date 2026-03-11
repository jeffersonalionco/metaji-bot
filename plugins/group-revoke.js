/* Creditos a https://github.com/ALBERTO9883 */

const handler = async (m, {conn}) => {
  const datas = global

  const revoke = await conn.groupRevokeInvite(m.chat);
  await conn.reply(m.chat, `🔹️ *_O link do grupo foi redefinido com sucesso._*\n♾ • Link novo: ${'https://chat.whatsapp.com/' + revoke}`, m);
};
handler.help = ['revoke'];
handler.tags = ['group'];
handler.command = ['resetlink', 'revoke'];
handler.botAdmin = true;
handler.admin = true;
handler.group = true;
export default handler;

const handler = async (m, {conn, text, isROwner, isOwner}) => {
  const datas = global

  if (text) {
    global.db.data.chats[m.chat].sBye = text;
    m.reply('*[❗] Mensagem de despedida configurada corretamente para este grupo*');
  } else throw `*[❗] Informe a mensagem de despedida que deseja adicionar, use:*\n*- @user (menção)*`;
};
handler.help = ['setbye <text>'];
handler.tags = ['group'];
handler.command = ['setbye'];
handler.admin = true;
export default handler;

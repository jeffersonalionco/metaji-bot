const handler = async (m, {conn, text, isROwner, isOwner}) => {
  const datas = global

  const texto2 = ['*[❗] Informe a mensagem de boas-vindas que deseja adicionar, use:*', '*- @user (menção)*\n*- @group (nome do grupo)*\n*- @desc (descrição do grupo)*'];
  if (text) {
    global.db.data.chats[m.chat].sWelcome = text;
    m.reply('*[❗] Mensagem de boas-vindas configurada corretamente para este grupo*');
  } else throw `${texto2[0]}\n${texto2[1]}`;
};
handler.help = ['setwelcome <text>'];
handler.tags = ['group'];
handler.command = ['setwelcome'];
handler.admin = true;
export default handler;

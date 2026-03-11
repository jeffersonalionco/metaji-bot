const handler = async (m, {conn, text, participants}) => {
  const datas = global

  const texto1 = '*[❗] Este grupo está ativo, não tem fantasmas :D*';
  const texto2 = [
    '*[ ⚠ REVISÃO DE INATIVOS ⚠ ]*\n\n*GRUPO:*',
    '*MEMBROS DO GRUPO:*',
    '*[ 👻 LISTA DE FANTASMAS 👻 ]*',
    '*NOTA: Isso pode não ser 100% preciso, o bot inicia a contagem de mensagens a partir de quando foi ativado neste número*'
  ];

  const member = participants.map((u) => u.id);
  if (!text) {
    var sum = member.length;
  } else {
    var sum = text;
  }
  let total = 0;
  const sider = [];
  for (let i = 0; i < sum; i++) {
    const users = m.isGroup ? participants.find((u) => u.id == member[i]) : {};
    if ((typeof global.db.data.users[member[i]] == 'undefined' || global.db.data.users[member[i]].chat == 0) && !users.isAdmin && !users.isSuperAdmin) {
      if (typeof global.db.data.users[member[i]] !== 'undefined') {
        if (global.db.data.users[member[i]].whitelist == false) {
          total++;
          sider.push(member[i]);
        }
      } else {
        total++;
        sider.push(member[i]);
      }
    }
  }
  if (total == 0) return conn.reply(m.chat, texto1, m);
  m.reply(`${texto2[0]} ${await conn.getName(m.chat)}\n${texto2[1]} ${sum}\n\n${texto2[2]}\n${sider.map((v) => '  👉🏻 @' + v.replace(/@.+/, '')).join('\n')}\n\n${texto2[3]}`, null, {mentions: sider});
};
handler.help = ['fantasmas'];
handler.tags = ['group'];
handler.command = /^(verfantasmas|fantasmas|sider)$/i;
handler.admin = true;
handler.botAdmin = true;
export default handler;

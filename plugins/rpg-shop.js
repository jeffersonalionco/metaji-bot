

const xpperlimit = 350;
const handler = async (m, {conn, command, args}) => {
  const recibo = [
    '┌─「 *RECIBO DE PAGAMENTO* 」',
    '‣ *Compra realizada*',
    '‣ *Gasto*',
    '└──────────────',
  ];
  const semXp = '❎ Desculpe, você não tem *XP* suficiente para comprar';
  const diamantes = 'Diamantes💎';

  let count = command.replace(/^buy/i, '');
  count = count ? /all/i.test(count) ? Math.floor(global.db.data.users[m.sender].exp / xpperlimit) : parseInt(count) : args[0] ? parseInt(args[0]) : 1;
  count = Math.max(1, count);
  if (global.db.data.users[m.sender].exp >= xpperlimit * count) {
    global.db.data.users[m.sender].exp -= xpperlimit * count;
    global.db.data.users[m.sender].limit += count;
    conn.reply(m.chat, `
${recibo[0]}
${recibo[1]}
${recibo[2]} : -${xpperlimit * count} XP
‣ *Recebido* : + ${count}💎
${recibo[3]}`, m);
  } else conn.reply(m.chat, `${semXp} *${count}* ${diamantes}`, m);
};
handler.help = ['Buy', 'Buyall'];
handler.tags = ['xp'];
handler.command = ['buy', 'buyall'];

handler.disabled = false;

export default handler;

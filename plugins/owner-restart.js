const handler = async (m) => {
  if (!process.send) throw 'Dont: node main.js\nDo: node index.js';
  await m.reply('*[ ⚠ ] Reiniciando o bot...*\n\n*—◉ Aguarde um momento para voltar a usar o bot, pode levar alguns minutos.*');
  process.send('reset');
};
handler.help = ['restart'];
handler.tags = ['owner'];
handler.command = ['restart', 'reiniciar'];
handler.rowner = true;
export default handler;

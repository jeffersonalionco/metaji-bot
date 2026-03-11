import {createHash} from 'crypto';

const handler = async function(m, {args}) {
  if (!args[0]) throw '*[❗] Informe seu número de série. Se não lembra, use o comando #myns*';
  const user = global.db.data.users[m.sender];
  const sn = createHash('md5').update(m.sender).digest('hex');
  if (args[0] !== sn) throw '*[❗] Número de série incorreto. Verifique se digitou corretamente!*\n\n*Se não lembra, use o comando #myns*';
  user.registered = false;
  m.reply('*[ ✔ ] Operação realizada com sucesso. Você não está mais registrado no bot*');
};
handler.help = ['unreg <numero de serie>'];
handler.tags = ['xp'];
handler.command = /^unreg(ister)?$/i;
handler.register = true;
export default handler;

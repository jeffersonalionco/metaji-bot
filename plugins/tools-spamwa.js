const handler = async (m, {conn, text}) => {
  const [nomor, pesan, jumlah] = text.split('|');
  if (!nomor) throw `*[⚠️] Por favor, insira o número ao qual será enviado o spam de mensagens!*\n*Uso correto:*\n*—◉ #spamwa numero|texto|quantidade*\n*Exemplo:*\n*—◉ #spamwa 5511999999999|responde :v|25*`;
  if (!pesan) throw `*[⚠️] Por favor, insira a mensagem para fazer o spam!*\n*Uso correto:*\n*—◉ #spamwa numero|texto|quantidade*\n*Exemplo:*\n*—◉ #spamwa 5511999999999|responde :v|25*`;
  if (jumlah && isNaN(jumlah)) throw `*[⚠️] A quantidade deve ser um número!*\n*Uso correto:*\n*—◉ #spamwa numero|texto|quantidade*\n*Exemplo:*\n*—◉ #spamwa 5511999999999|responde :v|25*`;

  const fixedNumber = nomor.replace(/[-+<>@]/g, '').replace(/ +/g, '').replace(/^[0]/g, '62') + '@s.whatsapp.net';
  const fixedJumlah = jumlah ? jumlah * 1 : 10;
  if (fixedJumlah > 50) throw `*[⚠️] Mensagens demais! A quantidade deve ser menor que 50 mensagens*`;
  await m.reply(`*[❗] O spam de mensagens ao número ${nomor} foi realizado com êxito*\n*Quantidade enviada:*\n*—◉ ${fixedJumlah} vezes!*`);
  for (let i = fixedJumlah; i > 1; i--) {
    if (i !== 0) conn.reply(fixedNumber, pesan.trim(), m);
  }
};
handler.help = ['spamwa <number>|<mesage>|<no of messages>'];
handler.tags = ['tools'];
handler.command = /^spam(wa)?$/i;
handler.group = false;
handler.premium = true;
// handler.private = true
// handler.limit = true
export default handler;

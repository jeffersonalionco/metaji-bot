const toM = (a) => '@' + a.split('@')[0];
function handler(m, {groupMetadata}) {
  const ps = groupMetadata.participants.map((v) => v.id);
  const a = ps.getRandom();
  let b;
  do b = ps.getRandom();
  while (b === a);
  m.reply(`*${toM(a)}, você deveria se casar 💍 com ${toM(b)}, vocês fazem um belo casal 💓*`, null, {
    mentions: [a, b],
  });
}
handler.help = ['formarpareja'];
handler.tags = ['game'];
handler.command = ['formarpareja', 'formarparejas'];
handler.group = true;
export default handler;

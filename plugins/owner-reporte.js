const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] Digite um relatório*\n\n*Exemplo:*\n*${usedPrefix + command} ${usedPrefix}play o comando não funciona*`;
  if (text.length < 10) throw '*[❗𝐈𝐍𝐅𝐎❗] O relatório deve ter no mínimo 10 caracteres!*';
  if (text.length > 1000) throw '*[❗𝐈𝐍𝐅𝐎❗] O relatório deve ter no máximo 1000 caracteres!*';
  const teks = `*❒═════[𝐑𝐄𝐏𝐎𝐑𝐓𝐄]═════❒*\n*┬*\n*├❧ Número:* wa.me/${m.sender.split`@`[0]}\n*├❧ Mensagem:* ${text}\n*┴*`;
  conn.reply('5219992095479@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, null, {contextInfo: {mentionedJid: [m.sender]}});
  conn.reply('5493794297363@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, null, {contextInfo: {mentionedJid: [m.sender]}});
  m.reply('*[ ✔️ ] Relatório enviado com sucesso ao criador do bot, seu relatório será atendido o quanto antes. Se for falso ou spam será ignorado*');
};

handler.help = ['request'];
handler.tags = ['info'];
handler.command = ['solicitud', 'reportes', 'reporte', 'sugerencia', 'request', 'reports', 'report', 'suggest'];

export default handler;

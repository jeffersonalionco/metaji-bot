const handler = async (m, {isOwner, isAdmin, conn, text, participants, args, command, usedPrefix}) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return;
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }
  const pesan = args.join` `;
  const oi = `*Mensagem:* ${pesan}`;
  let teks = `*⺀I N V O C A N D O - G R U P O⺀*\n\n❏ ${oi}\n\n❏ *Etiquetas:*\n`;
  for (const mem of participants) {
    teks += `┣➥ @${mem.jid.split('@')[0]}\n`;
  }
  teks += `*└* 𝐁𝐲 𝐓𝐡𝐞 𝐌𝐲𝐬𝐭𝐢𝐜 - 𝐁𝐨𝐭\n\n*▌│█║▌║▌║║▌║▌║▌║█*`;
  conn.sendMessage(m.chat, {text: teks, mentions: participants.map((a) => a.jid)} );
};
handler.help = ['tagall <mensagem>', 'invocar <mensagem>'];
handler.tags = ['group'];
handler.command = /^(tagall|invocar|invocacion|todos|invocación)$/i;
handler.admin = true;
handler.group = true;
export default handler;

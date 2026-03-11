const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const why = `*[❗] Uso incorreto do comando.*\n\n*—◉ Exemplo de uso válido:*\n*◉ ${usedPrefix + command}* @${m.sender.split('@')[0]}\n*◉ ${usedPrefix + command}* ${m.sender.split('@')[0]}\n*◉ ${usedPrefix + command}* <responder>`;
  const who = await await m.mentionedJid[0] ? await await m.mentionedJid[0] : m.quoted ? await m?.quoted?.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;
  if (!who) return conn.reply(m.chat, why, m, {mentions: [m.sender]});
  switch (command) {
    case 'addowner':
      const nuevoNumero = who;
      global.owner.push([nuevoNumero]);
      await conn.reply(m.chat, `*[❗] Novo número adicionado com sucesso à lista de owners.*`, m);
      break;
    case 'delowner':
      const numeroAEliminar = who;
      const index = global.owner.findIndex(owner => owner[0] === numeroAEliminar);
      if (index !== -1) {
        global.owner.splice(index, 1);
        await conn.reply(m.chat, `*[❗] O número foi removido com sucesso da lista de owners.*`, m);
      } else {
        await conn.reply(m.chat, `*[❗] O número informado não existe na lista de owners.*`, m);
      }
      break;
  }
};
handler.command = /^(addowner|delowner)$/i;
handler.rowner = true;
export default handler;

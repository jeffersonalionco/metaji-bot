/*              Codigo Creado Por Group MetaJI
      (https://github.com/GroupMetaJI/TheMystic-Bot-MD)
*/


const handler = async (m, {conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin, isSuperAdmin}) => {
  if (!args[0]) return m.reply(`*[❗] Digite o prefixo de algum país para buscar números neste grupo, exemplo: ${usedPrefix + command} 52*`);
  if (isNaN(args[0])) return m.reply(`*[❗] Digite o prefixo de algum país para buscar números neste grupo, exemplo: ${usedPrefix + command} 52*`);
  const lol = args[0].replace(/[+]/g, '');
  const ps = participants.map((u) => u.id).filter((v) => v !== conn.user.jid && v.startsWith(lol || lol));
  const bot = global.db.data.settings[conn.user.jid] || {};
  if (ps == '') return m.reply(`*[❗] Neste grupo não há nenhum número com o prefixo +${lol}*`);
  const numeros = ps.map((v)=> '⭔ @' + v.replace(/@.+/, ''));
  const delay = (time) => new Promise((res)=>setTimeout(res, time));
  switch (command) {
    case 'listanum': case 'listnum':
      conn.reply(m.chat, `*Lista de números com o prefixo +${lol} que estão neste grupo:*\n\n` + numeros.join`\n`, m, {mentions: ps});
      break;
    case 'kicknum':
      if (!bot.restrict) return m.reply(`*[❗𝐈𝐍𝐅𝐎❗] O proprietário do bot não habilitou as restrições (#enable restrict) - Entre em contato com ele para habilitar*`);
      if (!isBotAdmin) return m.reply(`*[❗𝐈𝐍𝐅𝐎❗] O bot não é administrador, não pode remover as pessoas*`);
      conn.reply(m.chat, `*[❗] Iniciando eliminação de números com o prefixo +${lol}, a cada 10 segundos será eliminado um usuário*`, m);
      const ownerGroup = m.chat.split`-`[0] + '@s.whatsapp.net';
      const users = participants.map((u) => u.id).filter((v) => v !== conn.user.jid && v.startsWith(lol || lol));
      for (const user of users) {
        const error = `@${user.split('@')[0]} já foi eliminado ou abandonou o grupo`;
        if (user !== ownerGroup + '@s.whatsapp.net' && user !== global.conn.user.jid && user !== global.owner + '@s.whatsapp.net' && user.startsWith(lol || lol) && user !== isSuperAdmin && isBotAdmin && bot.restrict) {
          await delay(2000);
          const responseb = await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
          if (responseb[0].status === '404') m.reply(error, m.chat, {mentions: conn.parseMention(error)});
          await delay(10000);
        } else return m.reply(`*[❗] Erro*`);
      }
      break;
  }
};

handler.tags = ['group'];
handler.help = ['kicknum', 'listnum']
handler.command = /^(listanum|kicknum|listnum)$/i;
handler.group = handler.botAdmin = handler.admin = true;
handler.fail = null;
export default handler;

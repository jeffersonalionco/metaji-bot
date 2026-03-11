const handler = async (m, { conn }) => {
  let txt = '';
try {
  const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);
  const totalGroups = groups.length;
  for (let i = 0; i < groups.length; i++) {
    const [jid, chat] = groups[i];
    const groupMetadata = ((conn.chats[jid] || {}).metadata || (await conn.groupMetadata(jid).catch((_) => null))) || {};
    const participants = groupMetadata.participants || [];
    const bot = participants.find((u) => conn.decodeJid(u.id) === conn.user.jid) || {};
    const isBotAdmin = bot?.admin || false;
    const isParticipant = participants.some((u) => conn.decodeJid(u.id) === conn.user.jid);
    const participantStatus = isParticipant ? '👤 Participante' : '❌ Ex-participante';
    const totalParticipants = participants.length;
    txt += `*◉ Grupo:* ${i + 1}
*➤ Nome:* ${await conn.getName(jid)}
*➤ ID:* ${jid}
*➤ Admin:* ${isBotAdmin ? '✔ Sim' : '❌ Não'}
*➤ Estado:* ${participantStatus}
*➤ Total de Participantes:* ${totalParticipants}
*➤ Link:* ${isBotAdmin ? `https://chat.whatsapp.com/${await conn.groupInviteCode(jid) || '--- (Erro) ---'}` : '--- (Não é admin) ---'}\n\n`;
  }
  m.reply(`*Lista de grupos do Bot* 🤖\n\n*—◉ Total de grupos:* ${totalGroups}\n\n${txt}`.trim());
} catch {
  const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);
  const totalGroups = groups.length;
  for (let i = 0; i < groups.length; i++) {
    const [jid, chat] = groups[i];
    const groupMetadata = ((conn.chats[jid] || {}).metadata || (await conn.groupMetadata(jid).catch((_) => null))) || {};
    const participants = groupMetadata.participants || [];
    const bot = participants.find((u) => conn.decodeJid(u.id) === conn.user.jid) || {};
    const isBotAdmin = bot?.admin || false;
    const isParticipant = participants.some((u) => conn.decodeJid(u.id) === conn.user.jid);
    const participantStatus = isParticipant ? '👤 Participante' : '❌ Ex-participante';
    const totalParticipants = participants.length;
    txt += `*◉ Grupo:* ${i + 1}
*➤ Nome:* ${await conn.getName(jid)}
*➤ ID:* ${jid}
*➤ Admin:* ${isBotAdmin ? '✔ Sim' : '❌ Não'}
*➤ Estado:* ${participantStatus}
*➤ Total de Participantes:* ${totalParticipants}
*➤ Link:* ${isBotAdmin ? '--- (Erro) ---' : '--- (Não é admin) ---'}\n\n`;
  }
  m.reply(`*Lista de grupos do Bot* 🤖\n\n*—◉ Total de grupos:* ${totalGroups}\n\n${txt}`.trim());
 }
};
handler.help = ['groups', 'grouplist'];
handler.tags = ['info'];
handler.command = /^(groups|grouplist|listadegrupo|gruposlista|listagrupos|listgroup)$/i;
handler.rowner = true;
handler.private = true
export default handler;

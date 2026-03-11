export function before(m) {
 const user = global.db.data.users[m.sender];
 if (user.afk > -1) {
 m.reply(`*[❗𝐈𝐍𝐅𝐎❗] Você deixou de estar inativo (AFK)*\n*Depois de estar inativo (AFK) pelo motivo: ${user.afkReason ? user.afkReason : ''}*\n\n*—◉ Tempo de inatividade (AFK): ${(new Date - user.afk).toTimeString()}*`.trim());
   user.afk = -1;
   user.afkReason = '';
 }
const getQuotedSender = async () => {
    try {
      return m.quoted ? await m.quoted?.sender : null;
    } catch {
      return null;
    }
  };
  (async () => {
    const quotedSender = await getQuotedSender();
    const jids = [...new Set([...(await m.mentionedJid || []), ...(quotedSender ? [quotedSender] : [])])];
 for (const jid of jids) {
 const user = global.db.data.users[jid];
 if (!user) {
   continue;
 }
 const afkTime = user.afk;
 if (!afkTime || afkTime < 0) {
   continue;
 }
 const reason = user.afkReason || '';
 m.reply(`*[❗] NÃO MARQUE ASSIM [❗]*\n\n*—◉ O usuário que você marcou está inativo (AFK)*\n*—◉ Motivo da inatividade (AFK): ${reason ? reason : 'O usuário não especificou um motivo'}*\n*—◉ Tempo transcorrido de inatividade (AFK): ${(new Date - afkTime).toTimeString()}*`.trim());
 }
 })();  
 return true;
}

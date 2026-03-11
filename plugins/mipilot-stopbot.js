async function handler(m, {conn, usedPrefix}) {
   if (conn.user.jid == global.conn.user.jid) return m.reply('*[❗] Você não pode desligar o Bot principal.*')
   m.reply('*[❗] Você deixará de ser um Sub Bot em 5 segundos...*')
   conn.fstop = true
   conn.ws.close()
}
handler.command = handler.help = ['stop', 'byebot'];
handler.tags = ['jadibot'];
handler.owner = true
export default handler; 
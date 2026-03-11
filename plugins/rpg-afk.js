const handler = async (m, {conn, text}) => {
 const user = global.db.data.users[m.sender];
 user.afk = + new Date;
 user.afkReason = text;
 m.reply(`*[❗𝐈𝐍𝐅𝐎❗] O usuário ${conn.getName(m.sender)} estará inativo (AFK), por favor não o marque*\n\n*—◉ Motivo da inatividade (AFK): ${text ? ': ' + text : ''}*
`);
};
handler.help = ['afk'];
handler.tags = ['xp'];
handler.command = ['afk']

export default handler;

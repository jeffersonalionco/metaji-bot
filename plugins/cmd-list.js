

const handler = async (m, {conn}) => {
  const datas = global

  conn.reply(m.chat, `
*< LISTA DE COMANDOS / TEXTOS ATRIBUÍDOS />*

${Object.entries(global.db.data.sticker).map(([key, value], index) => `*${index + 1}.-*\n*CÓDIGO:* ${value.locked ? `*(bloqueado)* ${key}` : key}\n*COMANDO/TEXTO* ${value.text}`).join('\n\n')}
`.trim(), null, {mentions: Object.values(global.db.data.sticker).map((x) => x.mentionedJid).reduce((a, b) => [...a, ...b], [])});
};
handler.command = ['listcmd', 'cmdlist'];
handler.rowner = true;
export default handler;

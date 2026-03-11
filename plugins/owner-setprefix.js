

const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*[❗] Nenhum prefixo encontrado, por favor insira o prefixo que deseja definir. Exemplo:* ${usedPrefix + command} /`;
  global.prefix = new RegExp('^[' + (text || global.opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
  await m.reply(`*[❗] O prefixo atual do Bot foi definido como ${text}*`);
};
handler.help = ['setprefix'].map((v) => v + ' [prefix]');
handler.tags = ['owner'];
handler.command = /^(setprefix)$/i;
handler.rowner = true;
export default handler;

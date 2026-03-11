import fetch from 'node-fetch';

const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
const handler = async (m, {args, usedPrefix, command}) => {
  if (!args[0]) throw `_*< BAIXAR - GITCLONE />*_\n\n*[ ℹ️ ] Digite um link do GitHub.*\n\n*[ 💡 ] Exemplo:* _${usedPrefix + command} https://github.com/GroupMetaJI/TheMystic-Bot-MD_`;
  if (!regex.test(args[0])) throw `_*< BAIXAR - GITCLONE />*_\n\n*[ ℹ️ ] O link fornecido está incorreto.*`;
  let [_, user, repo] = args[0].match(regex) || [];
  repo = repo.replace(/.git$/, '');
  const url = `https://api.github.com/repos/${user}/${repo}/zipball`;
  const filename = (await fetch(url, {method: 'HEAD'})).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1];
  m.reply(`_*< BAIXAR - GITCLONE />*_\n\n*[ ℹ️ ] Enviando o arquivo, aguarde...*\n\n*[ ℹ️ ] Se não for enviado, pode ser por exceder o limite de tamanho.*`);
  conn.sendFile(m.chat, url, filename, null, m);
};
handler.command = /^(gitclone)$/i;
export default handler;

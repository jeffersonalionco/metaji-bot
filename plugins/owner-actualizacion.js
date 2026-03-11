import axios from 'axios';

let previousCommitSHA = '';
let previousUpdatedAt = '';
let previousCommitUser = '';
const owner = 'GroupMetaJI';
const repo = 'TheMystic-Bot-MD';
const handler = async (m, {conn}) => {
 conn.sendMessage(m.chat, {text: `*[❗] Comando ativado com sucesso, te notificaremos quando houver alguma alteração no repositório oficial.*`}, {quoted: m});
try {
  async function checkRepoUpdates() {
    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`);
      const {sha, commit: {message}, html_url, author: { login } } = response.data[0];

      if (sha !== previousCommitSHA || message !== previousUpdatedAt) {
        previousCommitSHA = sha;
        previousUpdatedAt = message;
        previousCommitUser = login
        conn.sendMessage(m.chat, {text: `*[❗] O repositório foi atualizado!*\n*- Repositório:* ${html_url}\n*- Mensagem do commit:* ${message}\n*- Commit por:* ${login}`}, {quoted: m});
      }
    } catch (error) {
      console.error(error)
      m.reply(`*[❗] Erro ao verificar o repositório*`);
    }
  }
  setInterval(checkRepoUpdates, 6000);
} catch (e) {
m.reply(e)
}
};
handler.command = /^(actualizacion|actualizaciones)/i;
handler.rowner = true;
export default handler;

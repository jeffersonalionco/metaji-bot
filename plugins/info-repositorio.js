import moment from 'moment-timezone';
import fetch from 'node-fetch';

const TEXTO_REPO = [
  "_*< INFORMAÇÕES - REPOSITÓRIO />*_",
  "▢ *Nome:*",
  "TheMystic-Bot-MD",
  "▢ *Visitantes:*",
  "▢ *Tamanho:*",
  "▢ *Atualização:*",
  "▢ *URL:*",
  "https://github.com/GroupMetaJI/TheMystic-Bot-MD",
  "Forks ·",
  "Stars ·",
  "Issues\n\n",
  "*[ ℹ️ ] Você pode baixar este repositório enviando o comando:*"
];

const handler = async (m, { conn, args, usedPrefix }) => {
  const t = TEXTO_REPO;
  const res = await fetch('https://api.github.com/repos/GroupMetaJI/TheMystic-Bot-MD');
  const json = await res.json();
  let txt = `${t[0]}\n\n`;
  txt += `${t[1]} ${json?.name || t[2]}\n\n`;
  txt += `${t[3]} ${json?.watchers_count || '-'}\n\n`;
  txt += `${t[4]} ${(json?.size / 1024).toFixed(2) || '-'} MB\n\n`;
  txt += `${t[5]} ${moment(json?.updated_at).format('DD/MM/YY - HH:mm:ss') || '-'}\n\n`;
  txt += `${t[6]} ${json?.html_url || t[7]}\n\n`;
  txt += `${json?.forks_count || '-'} ${t[8]} ${json?.stargazers_count || '-'} ${t[9]} ${json?.open_issues_count || '-'} ${t[10]}`;
  txt += `${t[11]}\n_${usedPrefix}gitclone ${json?.html_url || 'https://github.com/GroupMetaJI/TheMystic-Bot-MD'}_`;
  await conn.sendMessage(m.chat, { text: txt.trim(), mentions: [...txt.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'), contextInfo: { forwardingScore: 9999999, isForwarded: true, mentionedJid: [...txt.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net') } }, { quoted: m });
};
handler.command = ['script', 'repositorio', 'repo'];
export default handler;

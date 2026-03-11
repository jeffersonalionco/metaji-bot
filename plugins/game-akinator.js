import fetch from 'node-fetch';

const handler = async (m, {conn, usedPrefix, command, text}) => {
  if (m.isGroup) return;
  const aki = global.db.data.users[m.sender].akinator;
  if (text == 'end') {
    if (!aki.sesi) return m.reply('*[❗] Você não está em uma sessão (partida) do Akinator no momento.*');
    aki.sesi = false;
    aki.soal = null;
    m.reply('*[✅] Sessão (partida) do Akinator encerrada com sucesso.*');
  } else {
    if (aki.sesi) return conn.reply(m.chat, '*[❗] Você ainda está em uma sessão (partida) do Akinator.*', aki.soal);
    try {
      const res = await fetch(`https://api.lolhuman.xyz/api/akinator/start?apikey=${lolkeysapi}`);
      const anu = await res.json();
      if (anu.status !== 200) throw '*[❗] Erro, tente novamente mais tarde.*';
      const {server, frontaddr, session, signature, question, progression, step} = anu.result;
      aki.sesi = true;
      aki.server = server;
      aki.frontaddr = frontaddr;
      aki.session = session;
      aki.signature = signature;
      aki.question = question;
      aki.progression = progression;
      aki.step = step;
      let txt = `🎮 *AKINATOR* 🎮\n\n*Jogador:* @${m.sender.split('@')[0]}*\n*Pergunta:* ${question}*\n\n`;
      txt += '*0 - Sim*\n';
      txt += '*1 - Não*\n';
      txt += '*2 - Não sei*\n';
      txt += '*3 - Provavelmente sim*\n';
      txt += '*4 - Provavelmente não*\n\n';
      txt += `*Use o comando* ${usedPrefix + command} end *para sair da sessão (partida) do Akinator.*`;
      const soal = await conn.sendMessage(m.chat, {text: txt, mentions: [m.sender]}, {quoted: m});
      aki.soal = soal;
    } catch {
      m.reply('*[❗] Erro, tente novamente mais tarde.*');
    }
  }
};
handler.menu = ['akinator'];
handler.tags = ['game'];
handler.command = /^(akinator)$/i;
export default handler;

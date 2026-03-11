import fetch from 'node-fetch';

import translate from '@vitalets/google-translate-api';

export async function before(m) {
  const teks = `*0 - Sim*\n*1 - Não*\n*2 - Não sei*\n*3 - Provavelmente sim*\n*4 - Provavelmente não*\n*5 - Voltar para a pergunta anterior*`;

  if (global.db.data.users[m.sender].banned) return;
  if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !m.text) return !0;
  const aki = global.db.data.users[m.sender].akinator;
  if (!aki.sesi || m.quoted.id != aki.soal.key.id) return;
  if (!somematch(['0', '1', '2', '3', '4', '5'], m.text)) return this.sendMessage(m.chat, {text: `*[❗] Responda com os números 0, 1, 2, 3, 4 ou 5.*\n\n${teks}`}, {quoted: aki.soal});
  const {server, frontaddr, session, signature, question, progression, step} = aki;
  if (step == '0' && m.text == '5') return m.reply('*[❗] Você já está na primeira pergunta.*');
  let res; let anu; let soal;
  try {
    if (m.text == '5') res = await fetch(`https://api.lolhuman.xyz/api/akinator/back?apikey=${lolkeysapi}&server=${server}&session=${session}&signature=${signature}&step=${step}`);
    else res = await fetch(`https://api.lolhuman.xyz/api/akinator/answer?apikey=${lolkeysapi}&server=${server}&frontaddr=${frontaddr}&session=${session}&signature=${signature}&step=${step}&answer=${m.text}`);
    anu = await res.json();
    if (anu.status != '200') {
      aki.sesi = false;
      aki.soal = null;
      return m.reply('*[❗] A sessão do Akinator expirou, o jogo foi encerrado.*');
    }
    anu = anu.result;
    if (anu.name) {
      await this.sendMessage(
        m.chat,
        { image: { url: anu.image }, caption: `🎮 *AKINATOR* 🎮\n\nO Akinator acha que seu personagem é *${anu.name}*\n_${anu.description}_`, mentions: [m.sender] },
        { quoted: m },
      );
      aki.sesi = false;
      aki.soal = null;
    } else {
      const resultes = await translate(`${anu.question}`, {to: 'pt', autoCorrect: true});
      soal = await this.sendMessage(
        m.chat,
        { text: `🎮 *AKINATOR* 🎮\n*Progresso:* ${anu.step} (${anu.progression.toFixed(2)}%)\n\n*Jogador:* @${m.sender.split('@')[0]}*\n*Pergunta:* ${resultes.text}*\n\n${teks}`, mentions: [m.sender] },
        { quoted: m },
      );
      aki.soal = soal;
      aki.step = anu.step;
      aki.progression = anu.progression;
    }
  } catch (e) {
    aki.sesi = false;
    aki.soal = null;
    m.reply('*[❗] Erro, tente novamente mais tarde.*');
  }
  return !0;
}
function somematch( data, id ) {
  const res = data.find((el) => el === id );
  return res ? true : false;
}

const timeout = 60000;
const poin = 500;
const poin_lose = -100;
const poin_bot = 200;


const handler = async (m, { conn, usedPrefix, text }) => {
  conn.suit = conn.suit ? conn.suit : {};
  if (Object.values(conn.suit).find((room) => room.id.startsWith('suit') && [room.p, room.p2].includes(m.sender))) throw '*[❗] Termine sua partida antes de iniciar outra.*';
  const textquien = `*Quem você quer desafiar? Marque a pessoa*\n\n*—◉ Exemplo:*\n${usedPrefix}suit @${global.suittag}`;
  const testi = await m.mentionedJid[0]
  if (!testi) return m.reply(textquien, m.chat, { mentions: conn.parseMention(textquien) });
  if (Object.values(conn.suit).find((room) => room.id.startsWith('suit') && [room.p, room.p2].includes(testi))) throw '*[❗] A pessoa que você quer desafiar ainda está jogando outra partida. Aguarde ela terminar.*';
  const id = 'suit_' + new Date() * 1;
  const caption = `🎮 *PvP - Pedra, Papel ou Tesoura* 🎮\n\n@${m.sender.split`@`[0]} desafiou @${testi.split`@`[0]}!\n\n@${testi.split`@`[0]}, responda com *aceitar* ou *recusar*.`;
  const imgplaygame = `https://www.merca2.es/wp-content/uploads/2020/05/Piedra-papel-o-tijera-0003318_1584-825x259.jpeg`;
  conn.suit[id] = {
    chat: await conn.sendMessage(m.chat, { text: caption }, { mentions: await conn.parseMention(caption) }),
    id: id,
    p: m.sender,
    p2: testi,
    status: 'wait',
    waktu: setTimeout(() => {
      if (conn.suit[id]) conn.reply(m.chat, '[ ⏳ ] Tempo de espera finalizado, o PvP foi cancelado por falta de resposta.', m);

      delete conn.suit[id];
    }, timeout), poin, poin_lose, poin_bot, timeout,
  };
};
handler.command = /^pvp|suit(pvp)?$/i;
handler.group = true;
handler.game = true;
export default handler;



const handler = (m) => m;
handler.before = async function(m) {
  this.suit = this.suit ? this.suit : {};
  if (db.data.users[m.sender].suit < 0) db.data.users[m.sender].suit = 0;
  const room = Object.values(this.suit).find((room) => room.id && room.status && [room.p, room.p2].includes(m.sender));
  if (room) {
    let win = '';
    let tie = false;
    if (m.sender == room.p2 && /^(acc(ept)?|accept|aceitar|aceito|terima|aceptar|gas|sim|ok|bora|vamos|nao|não|negativo|gamau|rechazar|recusar|recuso|ga(k.)?bisa)/i.test(m.text) && m.isGroup && room.status == 'wait') {
      if (/^(tolak|gamau|rechazar|ga(k.)?bisa|nao|não|negativo|recusar|recuso)/i.test(m.text)) {
        const textno = `*[❗] @${room.p2.split`@`[0]} recusou o PvP, o jogo foi cancelado.*`;
        m.reply(textno, null, {mentions: this.parseMention(textno)});
        delete this.suit[room.id];
        return !0;
      }
      room.status = 'play';
      room.asal = m.chat;
      clearTimeout(room.waktu);
      const textplay = `🎮 PvP iniciado entre @${room.p.split`@`[0]} e @${room.p2.split`@`[0]}!\n\nEscolham uma opção no chat privado do bot:\n*wa.me/${conn.user.jid.split`@`[0]}*`;
      m.reply(textplay, m.chat, {mentions: this.parseMention(textplay)});
      const comienzop = `🎮 *PvP - Pedra, Papel ou Tesoura* 🎮\n\nVocê é o *Jogador 1*.\n\nEscolha uma opção respondendo com:\n- pedra\n- papel\n- tesoura\n\nPrêmio: +${room.poin} XP\nDerrota: ${room.poin_lose} XP\n\nVocê tem ${Math.floor(room.timeout / 1000)}s para escolher.`;
      const comienzop2 = `🎮 *PvP - Pedra, Papel ou Tesoura* 🎮\n\nVocê é o *Jogador 2*.\n\nEscolha uma opção respondendo com:\n- pedra\n- papel\n- tesoura\n\nPrêmio: +${room.poin} XP\nDerrota: ${room.poin_lose} XP\n\nVocê tem ${Math.floor(room.timeout / 1000)}s para escolher.`;

      if (!room.pilih) this.sendMessage(room.p, {text: comienzop}, {quoted: m});
      if (!room.pilih2) this.sendMessage(room.p2, {text: comienzop2}, {quoted: m});
      room.waktu_milih = setTimeout(() => {
        const iniciativa = '[❗] Ninguém escolheu uma opção. O PvP foi cancelado.';
        if (!room.pilih && !room.pilih2) this.sendMessage(m.chat, {text: iniciativa}, {quoted: m});
        else if (!room.pilih || !room.pilih2) {
          win = !room.pilih ? room.p2 : room.p;
          const textnull = `*[❗] @${(room.pilih ? room.p2 : room.p).split`@`[0]} não escolheu nenhuma opção a tempo. PvP encerrado.*`;
          this.sendMessage(m.chat, {text: textnull}, {quoted: m}, {mentions: this.parseMention(textnull)});
          db.data.users[win == room.p ? room.p : room.p2].exp += room.poin;
          db.data.users[win == room.p ? room.p : room.p2].exp += room.poin_bot;
          db.data.users[win == room.p ? room.p2 : room.p].exp -= room.poin_lose;
        }
        delete this.suit[room.id];
        return !0;
      }, room.timeout);
    }
    const jwb = m.sender == room.p;
    const jwb2 = m.sender == room.p2;
    const g = /^(tijera|tesoura)$/i;
    const b = /^pedra$/i;
    const k = /^papel$/i;
    const reg = /^(tijera|tesoura|pedra|papel)/i;
    if (jwb && reg.test(m.text) && !room.pilih && !m.isGroup) {
      room.pilih = reg.exec(m.text.toLowerCase())[0];
      room.text = m.text;
      m.reply(`*[ ✔ ] Você escolheu ${m.text}. Volte para o grupo e ${room.pilih2 ? `veja o resultado*` : 'aguarde o resultado*'}`);
      if (!room.pilih2) this.reply(room.p2, '*[❗] Seu oponente já escolheu. Agora é a sua vez de escolher!*', 0);
    }
    if (jwb2 && reg.test(m.text) && !room.pilih2 && !m.isGroup) {
      room.pilih2 = reg.exec(m.text.toLowerCase())[0];
      room.text2 = m.text;
      m.reply(`*[ ✔ ] Você escolheu ${m.text}. Volte para o grupo e ${room.pilih ? `veja o resultado*` : 'aguarde o resultado*'}`);
      if (!room.pilih) this.reply(room.p, '*[❗] Seu oponente já escolheu. Agora é a sua vez de escolher!*', 0);
    }
    const stage = room.pilih;
    const stage2 = room.pilih2;
    if (room.pilih && room.pilih2) {
      clearTimeout(room.waktu_milih);
      if (b.test(stage) && g.test(stage2)) win = room.p;
      else if (b.test(stage) && k.test(stage2)) win = room.p2;
      else if (g.test(stage) && k.test(stage2)) win = room.p;
      else if (g.test(stage) && b.test(stage2)) win = room.p2;
      else if (k.test(stage) && b.test(stage2)) win = room.p;
      else if (k.test(stage) && g.test(stage2)) win = room.p2;
      else if (stage == stage2) tie = true;
      this.reply(room.asal, `
*👑 Resultado do PvP 👑*${tie ? '\n*—◉ Empate!!*' : ''}
*@${room.p.split`@`[0]} (${room.text})* ${tie ? '' : room.p == win ? ` *GANHOU 🥳 +${room.poin}XP*` : ` *PERDEU 🤡 ${room.poin_lose}XP*`}
*@${room.p2.split`@`[0]} (${room.text2})* ${tie ? '' : room.p2 == win ? ` *GANHOU 🥳 +${room.poin}XP*` : ` *PERDEU 🤡 ${room.poin_lose}XP*`}
`.trim(), m, {mentions: [room.p, room.p2]} );
      if (!tie) {
        db.data.users[win == room.p ? room.p : room.p2].exp += room.poin;
        db.data.users[win == room.p ? room.p : room.p2].exp += room.poin_bot;
        db.data.users[win == room.p ? room.p2 : room.p].exp += room.poin_lose;
      }
      delete this.suit[room.id];
    }
  }
  return !0;
};
handler.exp = 0;
export default handler;
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const timeout = 60000;
const poin = 500;
const handler = async (m, {conn, usedPrefix}) => {
  conn.tekateki = conn.tekateki ? conn.tekateki : {};
  const id = m.chat;
  if (id in conn.tekateki) {
    conn.reply(m.chat, 'Ainda há um acertijo sem resposta neste chat.', conn.tekateki[id][0]);
    throw false;
  }
  const tekateki = [
    { question: 'O que é, o que é: quanto mais se tira, maior fica?', response: 'buraco' },
    { question: 'O que é, o que é: tem cabeça e tem dente, mas não é gente?', response: 'alho' },
    { question: 'O que é, o que é: anda com os pés na cabeça?', response: 'piolho' },
    { question: 'O que é, o que é: cai em pé e corre deitado?', response: 'chuva' },
    { question: 'O que é, o que é: tem olhos e não vê?', response: 'batata' },
    { question: 'O que é, o que é: quanto mais seca, mais molhada fica?', response: 'toalha' },
    { question: 'O que é, o que é: sobe e desce mas nunca sai do lugar?', response: 'escada' },
    { question: 'O que é, o que é: vive no mar e tem nome de gente?', response: 'camarão' },
    { question: 'O que é, o que é: tem coroa mas não é rei, tem espinho mas não é peixe?', response: 'abacaxi' },
    { question: 'O que é, o que é: não tem boca, mas fala; não tem asas, mas voa?', response: 'carta' },
    { question: 'O que é, o que é: entra duro e seco e sai mole e molhado?', response: 'macarrão' },
    { question: 'O que é, o que é: corre, corre e nunca sai do lugar?', response: 'relógio' },
    { question: 'O que é, o que é: quanto mais se perde, mais se tem?', response: 'experiência' },
    { question: 'O que é, o que é: tem linhas mas não escreve; tem números mas não conta?', response: 'caderno' },
    { question: 'O que é, o que é: sempre está à sua frente mas você não consegue ver?', response: 'futuro' },
    { question: 'O que é, o que é: tem 28 dias e aparece em todos os meses?', response: 'o dia 28' },
    { question: 'O que é, o que é: se você falar o nome, ele desaparece?', response: 'silêncio' },
    { question: 'O que é, o que é: tem chave mas não abre porta?', response: 'teclado' },
    { question: 'O que é, o que é: tem braço mas não abraça?', response: 'cadeira' },
    { question: 'O que é, o que é: é cheio de buracos mas segura água?', response: 'esponja' },
    { question: 'O que é, o que é: tem folhas mas não é árvore?', response: 'livro' },
    { question: 'O que é, o que é: quanto mais quente, mais frio fica?', response: 'geladeira' },
    { question: 'O que é, o que é: sempre quebra quando você diz o nome?', response: 'silêncio' },
    { question: 'O que é, o que é: tem perna, mas não anda; tem encosto, mas não descansa?', response: 'cadeira' },
    { question: 'O que é, o que é: fica no canto e viaja o mundo inteiro?', response: 'selo' },
  ];
  const json = tekateki[Math.floor(Math.random() * tekateki.length)];
  const caption = `
ⷮ *${json.question}*
*• Tempo:* ${(timeout / 1000).toFixed(2)} segundos
*• Bônus:* +${poin} Exp
`.trim();
  conn.tekateki[id] = [
    await conn.reply(m.chat, caption, m), json,
    poin,
    setTimeout(async () => {
      if (conn.tekateki[id]) await conn.reply(m.chat, `Acabou o tempo!\n*Resposta:* ${json.response}`, conn.tekateki[id][0]);
      delete conn.tekateki[id];
    }, timeout)];
};
handler.help = ['acertijo'];
handler.tags = ['game'];
handler.command = /^(acertijo|acert|pregunta|adivinanza|tekateki)$/i;
export default handler;

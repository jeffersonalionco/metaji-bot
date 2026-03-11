import fetch from 'node-fetch';

const handler = async (m, {conn, args, usedPrefix}) => {
 if (args.length == 0) return conn.reply(m.chat, `Usar ${usedPrefix}kpop\nPor favor escreva: ${usedPrefix}kpop [buscar]\nExemplo: ${usedPrefix}kpop bts\n\nBuscas disponíveis:\nblackpink, exo, bts`, m);
 if (args[0] == 'blackpink' || args[0] == 'exo' || args[0] == 'bts') {
 fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/kpop/' + args[0] + '.txt')
 .then((res) => res.text())
 .then((body) => {
 const randomkpop = body.split('\n');
 const randomkpopx = randomkpop[Math.floor(Math.random() * randomkpop.length)];
 conn.sendFile(m.chat, randomkpopx, '', 'Kpopers', m);
 }).catch(() => {
 conn.reply(m.chat, 'Ocorreu um erro, tente novamente. Se o problema continuar, avise meu criador.', m);
 });
 } else {
 conn.reply(m.chat, `Desculpe, a busca não está disponível. Por favor escreva ${usedPrefix}kpop para ver a lista de buscas disponíveis`, m);
 }
};

handler.help = ['kpop'];
handler.tags = ['random'];
handler.command = ['kpop'];

export default handler;

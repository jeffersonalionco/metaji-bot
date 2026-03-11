import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';
import axios from 'axios';
import cheerio from 'cheerio';

const CONSEJO = '*Conselho do dia*';
const FRASE_ROMANTICA = '*Frase romântica*';

const FRASES_ROMANTICAS = [
  'Você é a luz que ilumina minha vida na escuridão.',
  'Com você, cada dia é uma nova aventura cheia de amor.',
  'Seus olhos são o reflexo do céu no qual quero me perder.',
  'Cada batida do meu coração carrega seu nome.',
  'Em seus braços encontrei o lar que sempre busquei.',
  'Você é o sonho que nunca quero acordar.',
  'O amor verdadeiro é estar juntos nas boas e nas más.',
  'Não existem distâncias quando dois corações estão unidos.',
  'Seus beijos são a melodia que acelera meu coração.',
  'Amar é ver em você o que mais ninguém pode ver.',
  'Em cada batida, te levo comigo a todos os lugares.',
  'O amor que sinto por você é minha força e inspiração.',
  'Suas palavras doces são meu alimento emocional diário.',
  'Você é o presente mais precioso que a vida me deu.',
  'O tempo para quando estou ao seu lado.',
  'Em seu sorriso encontro a felicidade que buscava.',
  'Cada dia ao seu lado é uma história de amor sem fim.',
  'Nosso amor é como um conto de fadas em realidade.',
  'Seus abraços são meu refúgio neste mundo caótico.',
  'Você é a razão pela qual acredito no destino.',
];

const CONSEJOS = [
  'Aceite que as mudanças são parte natural da vida e aprenda a se adaptar.',
  'Nunca pare de aprender; o conhecimento é uma ferramenta poderosa.',
  'Cuide da sua saúde física e mental, são fundamentais para uma vida plena.',
  'Aprenda a perdoar, tanto aos outros quanto a si mesmo.',
  'Valorize o tempo que passa com seus entes queridos.',
  'Seja gentil e compassivo com os outros.',
  'Aprenda a dizer não quando necessário e estabeleça limites saudáveis.',
  'Encontre tempo para fazer o que te apaixona.',
  'Não se compare com os outros, cada pessoa tem seu próprio caminho.',
  'Confie em si mesmo e na sua capacidade de alcançar o que se propor.',
];

const handler = async (m, { conn, command }) => {
 if (command === 'consejo') {
   const consejo = CONSEJOS[Math.floor(Math.random() * CONSEJOS.length)];
   await m.reply(`╭─◆────◈⚘◈─────◆─╮\n\n⠀⠀🌟 ${CONSEJO} 🌟\n\n❥ ${consejo}\n\n╰─◆────◈⚘◈─────◆─╯`);
 }
 if (command === 'fraseromantica') {
   const frase = FRASES_ROMANTICAS[Math.floor(Math.random() * FRASES_ROMANTICAS.length)];
   await m.reply(`╭─◆────◈⚘◈─────◆─╮\n\n⠀⠀💖 ${FRASE_ROMANTICA} 💖\n\n❥ ${frase}\n\n╰─◆────◈⚘◈─────◆─╯`);
 }
 if (command == 'historiaromantica') {
   try {
     const cerpe = await cerpen('cinta romantis');
     const storytime = await translate(cerpe.cerita, { to: 'pt', autoCorrect: true }).catch((_) => null);
     const titletime = await translate(cerpe.title, { to: 'pt', autoCorrect: true }).catch((_) => null);
     conn.reply(m.chat, `᭥🫐᭢ Título: ${titletime?.text || cerpe.title}\n᭥🍃᭢ Autor: ${cerpe.author}\n────────────────\n${storytime?.text || cerpe.cerita}`, m);
   } catch {
     const err = await fetch(`https://api.lolhuman.xyz/api/openai?apikey=${lolkeysapi}&text=Elabore%20uma%20hist%C3%B3ria%20rom%C3%A2ntica%20curta%20em%20portugu%C3%AAs&user=user-unique-id`);
     const json = await err.json();
     conn.reply(m.chat, json.result || 'Erro ao gerar história.', m);
   }
 }
};

handler.tags = ['tools'];
handler.command = handler.help = ['consejo', 'fraseromantica', 'historiaromantica'];
export default handler;

async function cerpen(category) {
  const title = category.toLowerCase().replace(/[()*]/g, '');
  const judul = title.replace(/\s/g, '-');
  const page = Math.floor(Math.random() * 5);
  const get = await axios.get('http://cerpenmu.com/category/cerpen-' + judul + '/page/' + page);
  const $ = cheerio.load(get.data);
  const link = [];
  $('article.post').each(function (a, b) {
    link.push($(b).find('a').attr('href'));
  });
  const random = link[Math.floor(Math.random() * link.length)];
  const res = await axios.get(random);
  const $$ = cheerio.load(res.data);
  return {
    title: $$('#content > article > h1').text(),
    author: $$('#content > article').text().split('Cerpen Karangan: ')[1]?.split('Kategori: ')[0] || 'Desconhecido',
    cerita: $$('#content > article > p').text(),
  };
}

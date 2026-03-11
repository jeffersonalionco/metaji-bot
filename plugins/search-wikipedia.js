import axios from 'axios';
import fetch from 'node-fetch';
import cheerio from 'cheerio';


async function wikipedia(querry) {
  try {
    const link = await axios.get(`https://es.wikipedia.org/wiki/${querry}`);
    const $ = cheerio.load(link.data);
    const judul = $('#firstHeading').text().trim();
    const thumb = $('#mw-content-text').find('div.mw-parser-output > div:nth-child(1) > table > tbody > tr:nth-child(2) > td > a > img').attr('src') || `//i.ibb.co/nzqPBpC/http-error-404-not-found.png`;
    const isi = [];
    $('#mw-content-text > div.mw-parser-output').each(function(rayy, Ra) {
      const penjelasan = $(Ra).find('p').text().trim();
      isi.push(penjelasan);
    });
    for (const i of isi) {
      const data = {
        status: link.status,
        result: {
          judul: judul,
          thumb: 'https:' + thumb,
          isi: i}};
      return data;
    }
  } catch (err) {
    return { status: 404, Pesan: err.message };
  }
}
const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*[❗] Você está usando o comando incorretamente!*\n*Uso correto:*\n*${usedPrefix + command} <palavra-chave para buscar>*\n\n*Exemplo:*\n*${usedPrefix + command} Estrelas*`;
  wikipedia(`${text}`).then((res) => {
    m.reply(`*Aqui está a informação encontrada:*\n\n` + res.result.isi);
  }).catch(() => {
    m.reply(`*[❗] Nenhuma informação encontrada. Verifique se escreveu uma única palavra e corretamente.*`);
  });
};
handler.help = ['wikipedia'].map((v) => v + ' <apa>');
handler.tags = ['internet'];
handler.command = /^(wiki|wikipedia)$/i;
export default handler;

import fetch from 'node-fetch';

const handler = async (m, {conn, args, text}) => {
 if (!text) throw '*[❗] Insira um link/URL que deseja encurtar*';
 const shortUrl1 = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
 if (!shortUrl1) throw '*[❗] Erro, verifique se o texto inserido é um texto e é uma URL válida*';
 const done = `*LINK ENCURTADO CORRETAMENTE!!*\n\n*Link anterior:*\n${text}\n*Link encurtado:*\n${shortUrl1}`.trim();
 m.reply(done);
};

handler.help = ['tinyurl', 'acortar'].map((v) => v + ' <link>');
handler.tags = ['tools'];
handler.command = /^(tinyurl|short|acortar|corto)$/i;
handler.fail = null;
export default handler;

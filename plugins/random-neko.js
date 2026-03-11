import fetch from 'node-fetch';

const handler = async (m, {conn, command}) => {
 const ne = await (await fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/anime/neko.txt')).text();
 const nek = ne.split('\n');
 const neko = await nek[Math.floor(Math.random() * nek.length)];
 if (neko == '') throw 'Error';
 conn.sendFile(m.chat, neko, 'error.jpg', 'Nyaww~ 🐾💗', m);
};

handler.command = /^(neko)$/i;
handler.tags = ['random'];
handler.help = ['neko'];
export default handler;

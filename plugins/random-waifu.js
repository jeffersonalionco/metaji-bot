import fetch from 'node-fetch';

const handler = async (m, {conn, usedPrefix, command}) => {
 const res = await fetch('https://api.waifu.pics/sfw/waifu');
 if (!res.ok) throw await res.text();
 const json = await res.json();
 if (!json.url) throw 'Erro!';
 conn.sendFile(m.chat, json.url, 'error.jpg', 'ᴀ-ᴀʀᴀ ᴀʀᴀ ꜱᴇᴍᴘᴀɪ~~', m);
};

handler.help = ['waifu'];
handler.tags = ['random'];
handler.command = /^(waifu)$/i;
export default handler;

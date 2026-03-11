const handler = (m) => m;
handler.all = async function(m) {
  const vn = './src/assets/audio/01J67301CY64MEGCXYP1NRFPF1.mp3';
  const chat = global.db.data.chats[m.chat];
  if (/^bot$/i.test(m.text) && !chat.isBanned) {
    m.conn.sendPresenceUpdate('recording', m.chat);
    await m.reply(`*Olá, como posso ajudar?*`);
    m.conn.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});
  }
  return !0;
};
export default handler;

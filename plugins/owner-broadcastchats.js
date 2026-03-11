const handler = async (m, { conn, text }) => {
  const delay = (time) => new Promise((res) => setTimeout(res, time));
  const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  if (!text) throw '*[❗𝐈𝐍𝐅𝐎❗] Digite a mensagem que deseja enviar*';
  const cc = text ? m : m.quoted ? await m.getQuotedObj() : false || m;
  const teks = text ? text : cc.text;
  for (const i of chats) {
    await delay(500);
    conn.relayMessage(i,
      {
        liveLocationMessage: {
          degreesLatitude: 35.685506276233525,
          degreesLongitude: 139.75270667105852,
          accuracyInMeters: 0,
          degreesClockwiseFromMagneticNorth: 2,
          caption: '[❗𝐂𝐎𝐌𝐔𝐍𝐈𝐂𝐀𝐃𝐎❗]\n\n' + teks + '\n\nEste é um comunicado oficial',
          sequenceNumber: 2,
          timeOffset: 3,
          contextInfo: m,
        }
      }, {}).catch((_) => _);
  }
  m.reply(`*[❗𝐈𝐍𝐅𝐎❗] Mensagem enviada a ${chats.length} chats privados*\n\n*NOTA: É possível que este comando tenha falhas e não seja enviado a todos os chats, desculpe pelo momento*`);
};
handler.help = ['broadcastchats', 'bcchats'].map((v) => v + ' <teks>');
handler.tags = ['owner'];
handler.command = /^(broadcastchats?|bcc(hats?)?)$/i;
handler.rowner = true;
export default handler;

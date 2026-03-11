const handler = async (m, {conn, text}) => {
  const delay = (time) => new Promise((res) => setTimeout(res, time));
  const getGroups = await conn.groupFetchAllParticipating();
  const groups = Object.entries(getGroups).slice(0).map((entry) => entry[1]);
  const anu = groups.map((v) => v.id);
  const pesan = m.quoted && m.quoted.text ? m.quoted.text : text;
  if (!pesan) throw `*[❗] Digite a mensagem que deseja transmitir.*`;
  for (const i of anu) {
    await delay(500);
    conn.relayMessage(i,
        {liveLocationMessage: {
          degreesLatitude: 35.685506276233525,
          degreesLongitude: 139.75270667105852,
          accuracyInMeters: 0,
          degreesClockwiseFromMagneticNorth: 2,
          caption: `\n\n[❗COMUNICADO❗]\n\n` + pesan + `\n\nESTE É UM COMUNICADO OFICIAL`,
          sequenceNumber: 2,
          timeOffset: 3,
          contextInfo: m,
        }}, {}).catch((_) => _);
  }
  m.reply(`*[❗] Mensagem enviada a ${anu.length} grupo(s).*\n\n*NOTA: É possível que este comando tenha falhas e não envie a todos os chats. Desculpe pelo momento.*`);
};
handler.help = ['broadcastgroup', 'bcgc'].map((v) => v + ' <texto>');
handler.tags = ['owner'];
handler.command = /^(broadcast|bc)(group|grup|gc)$/i;
handler.owner = true;

export default handler;

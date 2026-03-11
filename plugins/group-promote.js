const handler = async (m, {conn, usedPrefix, text}) => {
  const datas = global

  const texto1 = ['*[❗] USO APROPRIADO*\n\n*┯┷*\n*┠≽', '-> responder a uma mensagem*\n*┷┯*'];
  const texto2 = '*[ ⚠️ ] O número informado está incorreto, por favor informe o número correto*';
  const texto3 = '*[ ✅ ] ORDEM RECEBIDA*';

  let number;
  if (isNaN(text) && !text?.match(/@/g)) {

  } else if (text && !isNaN(text)) {
    number = text;
  } else if (text) {
    number = text.split`@`[1];
  }

  if (!text && !m.quoted) return conn.reply(m.chat, `${texto1[0]}\n\n*┯┷*\n*┠≽ ${usedPrefix}daradmin @tag*\n*┠≽ ${usedPrefix}darpoder ${texto1[1]}`, m);
  if (number && (number.length > 13 || (number.length < 11 && number.length > 0))) return conn.reply(m.chat, texto2, m);

  try {
    let user;
    if (text) {
      user = number + '@s.whatsapp.net';
    } else if (await m?.quoted?.sender) {
      user = await m?.quoted?.sender;
    } else if (await m.mentionedJid?.length) {
      user = (m.mentionedJid[0] || number + '@s.whatsapp.net');
    }
    if (user) {
      await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
      conn.reply(m.chat, texto3, m);
    }
  } catch (e) {
  }
};
handler.help = ['promote'].map((v) => 'mention ' + v);
handler.tags = ['group'];
handler.command = /^(promote|daradmin|darpoder)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.fail = null;
export default handler;

const handler = async (m, {conn, usedPrefix}) => {
  const TEXTO_GRUPOS = [
    "*Olá usuário 👋🏻, convido você a se unir aos grupos oficiais do THE MYSTIC - BOT para conviver com a comunidade :D*",
    "*➤ Grupos oficiais do Bot:*",
  ];

  const text = `${TEXTO_GRUPOS[0]}

${TEXTO_GRUPOS[1]}
1.- https://chat.whatsapp.com/LjJbmdO0qSDEKgB60qivZj

2.- https://chat.whatsapp.com/DbXBmsydWBE1ZN3EoY0hRs

3.- https://chat.whatsapp.com/BW0P22xx7EGBTdH5IM851F

4.- https://chat.whatsapp.com/CjexkGVr37J6GuSdDVAHzC

> Sunlight Team  :

1.- https://whatsapp.com/channel/0029Vam7yUg77qVaz3sIAp0z

2.- https://chat.whatsapp.com/Fy74b6fgE9SJJpHVi6CKJY`.trim();

  const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const document = doc[Math.floor(Math.random() * doc.length)];
  const buttonMessage= {
    'document': {url: `https://github.com/GroupMetaJI/TheMystic-Bot-MD`},
    'mimetype': `application/${document}`,
    'fileName': `「  𝑯𝒆𝒍𝒍𝒐 𝑾𝒐𝒓𝒍𝒅 」`,
    'fileLength': 99999999999999,
    'pageCount': 200,
    'contextInfo': {
      'forwardingScore': 200,
      'isForwarded': true,
      'externalAdReply': {
        'mediaUrl': 'https://github.com/GroupMetaJI/TheMystic-Bot-MD',
        'mediaType': 2,
        'previewType': 'pdf',
        'title': 'o melhor bot de whatsapp',
        'body': wm,
        'thumbnail': imagen1,
        'sourceUrl': 'https://www.youtube.com/channel/UCSTDMKjbm-EmEovkygX-lCA'}},
    'caption': text,
    'footer': wm,
    'headerType': 6};
  conn.sendMessage(m.chat, buttonMessage, {quoted: m});
};
handler.command = ['linkgc', 'grupos'];
export default handler;

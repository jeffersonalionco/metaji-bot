const handler = async (m, {conn, usedPrefix}) => {
  const TEXTO_HOST = [
    "*🚀 -----[ Cafirexos ]------- 🚀*",
    "*Olá a todos 👋🏻 Estamos animados em anunciar nossa nova colaboração com Cafirexos 🤖 Agora vocês podem ter seu próprio bot THE-MYSTIC-BOT-MD na plataforma online, permitindo que seus bots fiquem ativos 24/7. 💻*",
    "_A instalação dessas versões foi aprovada e já está em pleno funcionamento. Além disso, *os servidores são totalmente compatíveis, permitindo que você escolha o tipo de inicialização do bot conforme suas necessidades.* Prepare-se para uma experiência de usuário ininterrupta e emocionante!_ ",
    "*Página oficial:*",
    "https://www.cafirexos.com/",
    "*Dashboard:*",
    "https://dash.cafirexos.com",
    "*Panel:*",
    "https://panel.cafirexos.com",
    "*WhatsApp*",
    "https://wa.me/50497150165",
    "*E-mail*",
    "contacto@cafirexos.com",
    "*Canal do WhatsApp*",
    "https://whatsapp.com/channel/0029VaFVSkRCMY0KFmCMDX2q",
    "*Dúvidas? (APENAS SOBRE O HOST):*",
    "https://chat.whatsapp.com/FBtyc8Q5w2iJXVl5zGJdFJ"
  ];

  const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const document = doc[Math.floor(Math.random() * doc.length)];
  const text = TEXTO_HOST.join('\n\n').trim();
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
        'title': 'O Melhor Hosting 🚀',
        'body': wm,
        'thumbnail': imagen1,
        'sourceUrl': 'https://whatsapp.com/channel/0029VaFVSkRCMY0KFmCMDX2q'}},
    'caption': text,
    'footer': wm,
    'headerType': 6};
  conn.sendMessage(m.chat, buttonMessage, {quoted: m});
}; 
handler.command = ['host', 'cafirexos'];
export default handler;

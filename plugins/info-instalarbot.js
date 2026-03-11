const handler = async (m, {conn, usedPrefix}) => {
  const TEXTO_INSTALAR = `*—◉ TUTORIAL BOXMINE HOST*
> Tutorial: https://youtu.be/eC9TfKICpcY
> Página Oficial: https://boxmineworld.com
> Dashboard: https://dash.boxmineworld.com/home
> Panel: https://panel.boxmineworld.com
> Suporte: https://discord.gg/84qsr4v 

------------------------------------
—◉ TUTORIAL TERMUX
> https://youtu.be/yRS4m36Zwkw

------------------------------------

*—◉ COMANDOS TERMUX*
> Comandos:
- cd && termux-setup-storage
- apt-get update -y && apt-get upgrade -y
- pkg install -y git nodejs ffmpeg imagemagick && pkg install yarn 
- git clone https://github.com/GroupMetaJI/TheMystic-Bot-MD.git && cd TheMystic-Bot-MD
- yarn install
- npm install
- npm update
- npm start

------------------------------------

—◉ ✔️ ATIVAR EM CASO DE PARAR NO TERMUX ✔️
DIGITE OS SEGUINTES COMANDOS UM POR UM:
> cd TheMystic-Bot-MD
> npm start

------------------------------------

—◉ 👽 OBTER OUTRO CÓDIGO QR NO TERMUX 👽
DIGITE OS SEGUINTES COMANDOS UM POR UM:
> cd TheMystic-Bot-MD
> rm -rf MysticSession
> npm start`;

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
        'title': 'O Melhor Bot de WhatsApp',
        'body': wm,
        'thumbnail': imagen1,
        'sourceUrl': 'https://www.youtube.com/channel/UCSTDMKjbm-EmEovkygX-lCA'}},
    'caption': TEXTO_INSTALAR.trim(),
    'footer': wm,
    'headerType': 6};
  conn.sendMessage(m.chat, buttonMessage, {quoted: m});
};
handler.command = ['instalarbot', 'instalarbot'];
export default handler;

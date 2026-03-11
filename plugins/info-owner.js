const handler = async (m, {conn, usedPrefix}) => {
 const TEXTO_OWNER = [
  "*—◉ O NÚMERO DO MEU CRIADOR É wa.me/5219992095479*",
  "*—◉ O NÚMERO DO COLABORADOR 1 É wa.me/34642467703*",
  "*—◉ O NÚMERO DO COLABORADOR 2 É wa.me/50499698072*",
  "*—◉ O NÚMERO DO COLABORADOR 3 É wa.me/595986460945*",
  "*—◉ O NÚMERO DO COLABORADOR 4 É wa.me/51940617554*",
  "*—◉ O NÚMERO DO COLABORADOR 5 É wa.me/51995386439*",
  "*—◉ O NÚMERO DO COLABORADOR 6 É wa.me/593991398786*",
  "*—◉ O NÚMERO DO COLABORADOR 7 É wa.me/51996089079*",
  "*—◉ O NÚMERO DO COLABORADOR 8 É wa.me/573225236629*",
  "*—◉ O NÚMERO DO COLABORADOR 9 É wa.me/593959425714*",
  "*—◉ O NÚMERO DO COLABORADOR 10 É wa.me/50246028932*",
  "*—◉ O CONTATO DA COLABORADORA 11 É https://instagram.com/gata_dios*",
  "*—◉ O NÚMERO DO COLABORADOR 12 É wa.me/5212412377467*",
  "*—◉ O NÚMERO DO COLABORADOR 13 BR É wa.me/5545998331383*"
 ];

 const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
 const document = doc[Math.floor(Math.random() * doc.length)];
 const text = TEXTO_OWNER.join('\n\n').trim();
 const buttonMessage = {
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
    'headerType': 6
 };
 conn.sendMessage(m.chat, buttonMessage, {quoted: m});
};

handler.help = ['owner'];
handler.tags = ['info'];
handler.command = /^(owner|creator|creador|propietario)$/i;

export default handler;

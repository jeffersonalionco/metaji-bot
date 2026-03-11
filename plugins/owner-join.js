const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;
let enviando;
const handler = async (m, {conn, text, isMods, isOwner, isPrems}) => {
  if (enviando) return;
  enviando = true;
  try {
    const link = text;
    if (!link || !link.match(linkRegex)) throw '*[❗] Link errado ou faltando, digite o link de um grupo do WhatsApp.*\n\n*—◉ Exemplo:*\n*◉ #join https://chat.whatsapp.com/FwEUGxkvZD85fIIp0gKyFC*';
    const [_, code] = link.match(linkRegex) || [];
    if (isPrems || isMods || isOwner || m.fromMe) {
      const res = await conn.groupAcceptInvite(code);
      await conn.sendMessage(m.chat, {text: '*[ ✔️ ] O bot entrou no grupo com sucesso.*'}, {quoted: m});
      enviando = false;
    } else {
      conn.sendMessage(m.chat, {text: '*[❗] O link do seu grupo foi enviado ao meu proprietário/a.*\n\n*—◉ Seu grupo estará em avaliação e o proprietário/a do bot decidirá se adiciona ou não o bot.*\n\n*—◉ Algumas razões pelas quais sua solicitação pode ser rejeitada:*\n*1.- O bot está saturado.*\n*2.- O bot foi removido do grupo recentemente.*\n*3.- O link do grupo foi restabelecido.*\n*4.- O bot não é adicionado a grupos por decisão do proprietário/a.*\n\n*—◉ O processo de avaliação pode levar algum tempo, até dias, tenha paciência.*'}, {quoted: m});
      const data = global.owner.filter(([id]) => id)[0];
      const dataArray = Array.isArray(data) ? data : [data];
      for (const entry of dataArray) await conn.sendMessage(entry + '@s.whatsapp.net', {text: '*[❗] NOVA SOLICITAÇÃO DE BOT PARA UM GRUPO [❗]*\n\n*—◉ Solicitante:* @' + m.sender.split('@')[0] + '\n*—◉ Link do grupo:* ' + link, mentions: [m.sender], contextInfo: {forwardingScore: 9999999, isForwarded: true, mentionedJid: [m.sender], 'externalAdReply': {'showAdAttribution': true, 'containsAutoReply': true, 'renderLargerThumbnail': true, 'title': global.titulowm2, 'containsAutoReply': true, 'mediaType': 1, 'thumbnail': imagen6, 'mediaUrl': `${link}`, 'sourceUrl': `${link}`}}}, {quoted: m});
      enviando = false;
    }
  } catch {
    enviando = false;
    throw '*[❗] Desculpe, algo deu errado. Por favor reporte ou tente novamente.*';
  }
};
handler.help = ['join [chat.whatsapp.com]'];
handler.tags = ['owner'];
handler.command = /^join|nuevogrupo$/i;
handler.private = true;
export default handler;

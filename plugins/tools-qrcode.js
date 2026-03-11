import {toDataURL} from 'qrcode';

const handler = async (m, {text, conn}) => {
 if (!text) throw '*[❗] Erro: por favor insira o texto que deseja converter em código QR*';
 conn.sendFile(m.chat, await toDataURL(text.slice(0, 2048), {scale: 8}), 'qrcode.png', '¯\\_(ツ)_/¯', m);
};

handler.help = ['', 'code'].map((v) => 'qr' + v + ' <texto>');
handler.tags = ['tools'];
handler.command = /^qr(code)?$/i;
export default handler;

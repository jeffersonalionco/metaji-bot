import {addExif} from '../src/libraries/sticker.js';

const handler = async (m, {conn, text}) => {
  if (!m.quoted) throw '*[❗] Responda ao sticker que deseja adicionar um pacote e um nome*';
  
  let stiker = false;
  try {
    let [packname, ...author] = text.split('|');
    author = (author || []).join('|');
    
    const isSticker = m.quoted.mtype === 'stickerMessage' || (m.quoted.mimetype && m.quoted.mimetype === 'image/webp') || m.quoted.mediaType === 'sticker' || (m.quoted.message && m.quoted.message.stickerMessage) || m.quoted.key?.remoteJid?.endsWith('@s.whatsapp.net');
    
    if (!isSticker) throw '*[❗] Responda ao sticker que deseja adicionar um pacote e um nome*';
    if (!m.quoted.download) throw '*[❗] Responda ao sticker que deseja adicionar um pacote e um nome*';
    const img = await m.quoted.download();
    if (!img) throw '*[❗] Responda ao sticker que deseja adicionar um pacote e um nome*';
    if (!Buffer.isBuffer(img) || img.length === 0) throw '*[❗] Responda ao sticker que deseja adicionar um pacote e um nome*';

    try {
      const categories = [''];
      const metadata = {
        packId: null, 
        androidAppStoreLink: null,
        iosAppStoreLink: null,
        isAiSticker: false,
        isFirstPartySticker: false,
        accessibilityText: null,
        templateId: null,
        isAvatarSticker: false,
        stickerMakerSourceType: null
      };
      
      stiker = await addExif(img, packname || global.packname || 'Bot', author || global.author || 'TheMystic', categories, metadata);
    } catch (exifError) {
      console.log('❌ Erro no addExif:', exifError.message);
      stiker = img;
    }
    
  } catch (e) {
    console.error('Erro no sticker-wm:', e);
    if (Buffer.isBuffer(e)) stiker = e;
  } finally {
    if (stiker) {
      conn.sendFile(m.chat, stiker, 'wm.webp', '', m, false, {asSticker: true});
    } else {
      throw '*[❗] Responda ao sticker que deseja adicionar um pacote e um nome. Verifique se respondeu a um sticker e adicionou um nome de pacote e de usuário*';
    }
  }
};

handler.help = ['wm <packname>|<author>'];
handler.tags = ['sticker'];
handler.command = /^take|robar|wm$/i;
export default handler;

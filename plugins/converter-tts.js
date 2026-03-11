import * as googleTTS from '@sefinek/google-tts-api'
import {readFileSync, unlinkSync} from 'fs';
import {join} from 'path';
const defaultLang = 'es';

const handler = async (m, {conn, args, usedPrefix, command}) => {
 let lang = args[0];
 let text = args.slice(1).join(' ');
 if ((args[0] || '').length !== 2) {
   lang = defaultLang;
   text = args.join(' ');
 }
 if (!text && m.quoted?.text) text = m.quoted.text;
 let res;
 try {
   res = googleTTS.getAudioUrl(text, { lang: lang || 'es', slow: false, host: 'https://translate.google.com' });
 } catch (e) {
 m.reply(e + '');
   text = args.join(' ');
 if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] Insira o texto que deseja converter em nota de voz, exemplo: ${usedPrefix + command} pt Olá Mundo*`;
 res = await tts(text, defaultLang);
 } finally {
 if (res) {
  conn.sendPresenceUpdate('recording', m.chat);
  conn.sendMessage(m.chat, { audio: { url: res }, fileName: 'tts.mp3', mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
  }
 }
};

handler.help = ['tts'];
handler.tags = ['converter'];
handler.command = ['tts'];

export default handler;

function tts(text, lang = 'es') {
  return new Promise((resolve, reject) => {
    try {
      const tts = gtts(lang);
      const filePath = join(global.__dirname(import.meta.url), '../src/tmp', (1 * new Date) + '.wav');
      tts.save(filePath, text, () => {
        resolve(readFileSync(filePath));
        unlinkSync(filePath);
      });
    } catch (e) {
      reject(e);
    }
  });
}

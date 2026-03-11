import {createHash} from 'crypto';
import PhoneNumber from 'awesome-phonenumber';
import fetch from 'node-fetch';

const handler = async (m, {conn, usedPrefix, participants, isPrems}) => {
 let texto = await m.mentionedJid
 let who = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : m.sender)
 if (!(who in global.db.data.users)) throw 'O usuário mencionado não está registrado no meu banco de dados';
 try {
 const pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60');
 const {name, limit, lastclaim, registered, regTime, age, premiumTime} = global.db.data.users[who];
 const username = conn.getName(who);
 const prem = global.prems.includes(who.split `@` [0]);
 const sn = createHash('md5').update(who).digest('hex');
 const str = `—◉ *Nome:* ${username} ${registered ? '(' + name + ') ': ''}
—◉ *Número:* ${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}
—◉ *Link:* wa.me/${who.split`@`[0]} ${registered ? '\n*Idade:*' + age + ' anos' : ''}
—◉ *Limite:* ${limit} usos
—◉ *Registrado:* ${registered ? 'Sim' : 'Não'}
—◉ *Premium:* ${premiumTime > 0 ? 'Sim' : (isPrems ? 'Sim' : 'Não') || ''}
—◉ *Número de série:*  
${sn}`;
    conn.sendMessage(m.chat, {image: {url: pp}, caption: str}, {quoted: m});
  } catch (error) {
  console.log(error);
 }
};

handler.help = ['profile'];
handler.tags = ['xp'];
handler.command = /^perfil|profile?$/i;

export default handler;

function formatNumber(num) {
  let string = {
    '0': '𝟶',
    '1': '𝟷',
    '2': '𝟸',
    '3': '𝟹',
    '4': '𝟺',
    '5': '𝟻',
    '6': '𝟼',
    '7': '𝟽',
    '8': '𝟾',
    '9': '𝟿',
    ',': ',',
  };

  let numString = num.toLocaleString().replace(/,/g, '#');
  let result = '';
  for (let i = 0; i < numeroString.length; i++) {
    if (numString[i] === '#') {
      result += ',';
    } else {
      result += string[numString[i]];
    }
  }
  return result;
}

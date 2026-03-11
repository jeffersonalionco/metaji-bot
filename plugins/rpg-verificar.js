import {createHash} from 'crypto';
const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;

const handler = async function(m, {conn, text, usedPrefix, command}) {
  const user = global.db.data.users[m.sender];
  const name2 = conn.getName(m.sender);
  const pp = await conn.profilePictureUrl(m.sender, 'image').catch((_) => global.imagen1);
  if (user.registered === true) throw `[❗] Você já está registrado\n\nQuer ver o registro?\n\n📌 Use este comando para excluir seu registro: *${usedPrefix}unreg* <Número de série>`;
  if (!Reg.test(text)) throw `*[❗] Formato incorreto*\n\n*—◉ Uso do comando:* ${usedPrefix + command} nome.idade\n*—◉ Exemplo:* ${usedPrefix + command} Shadow.18*`;
  let [_, name, splitter, age] = text.match(Reg);
  if (!name) throw '*[❗] Você deve informar um nome*';
  if (!age) throw '*[❗] A idade não pode estar vazia*';
  if (name.length >= 30) throw '*[❗] O nome é muito longo*';
  age = parseInt(age);
  if (age > 100) throw '*[❗] Como você continua vivo com essa idade? 👴🏻*';
  if (age < 5) throw '*[❗] Um bebê que sabe usar WhatsApp? 😲*';
  user.name = name.trim();
  user.age = age;
  user.regTime = + new Date;
  user.registered = true;
  const sn = createHash('md5').update(m.sender).digest('hex');
  const caption = `┏┅ ━━━━━━━━━━━━ ┅ ━
┇「 INFORMAÇÃO 」」
┣┅ ━━━━━━━━━━━━ ┅ ━
┃ *Nome:* ${name}
┃ *Idade:* ${age} anos
┃ *Número de série:*
┃ ${sn}
┣┅ ━━━━━━━━━━━━ ┅ ━
┃ Seu número de série será útil
┃ se desejar apagar seu registro no bot!
┗┅ ━━━━━━━━━━━━ ┅ ━`;
  // let author = global.author
  await conn.sendFile(m.chat, pp, 'mystic.jpg', caption, m);
  // conn.sendButton(m.chat, caption, `¡𝚃𝚄 𝙽𝚄𝙼𝙴𝚁𝙾 𝙳𝙴 𝚂𝙴𝚁𝙸𝙴 𝚃𝙴 𝚂𝙴𝚁𝚅𝙸𝚁𝙰 𝙿𝙾𝚁 𝚂𝙸 𝙳𝙴𝚂𝙴𝙰𝚂 𝙱𝙾𝚁𝚁𝙰𝚁 𝚃𝚄 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙾 𝙴𝙽 𝙴𝙻 𝙱𝙾𝚃!\n${author}`, [['¡¡𝙰𝙷𝙾𝚁𝙰 𝚂𝙾𝚈 𝚄𝙽 𝚅𝙴𝚁𝙸𝙵𝙸𝙲𝙰𝙳𝙾/𝙰!!', '/profile']], m)
  global.db.data.users[m.sender].money += 10000;
  global.db.data.users[m.sender].exp += 10000;
};
handler.help = ['verificar'];
handler.tags = ['xp'];
handler.command = /^(verify|register|verificar|reg|registrar)$/i;
export default handler;

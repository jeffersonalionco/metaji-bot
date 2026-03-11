const handler = async (m, {conn, participants, groupMetadata}) => {
  const datas = global

  const pp = await conn.profilePictureUrl(m.chat, 'image') || imagen1 ||'./src/avatar_contact.png';
  const {antiToxic, antiTraba, antidelete, antiviewonce, isBanned, welcome, detect, detect2, sWelcome, sBye, sPromote, sDemote, antiLink, antiLink2, modohorny, autosticker, modoadmin, audios, delete: del} = global.db.data.chats[m.chat];
  const groupAdmins = participants.filter((p) => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
  const owner = groupMetadata.ownerJid || groupMetadata.owner
  const texto1 = [
    '*「 INFORMAÇÕES DO GRUPO 」*',
    '*IDENTIFICAÇÃO DO GRUPO:*',
    '*NOME:*',
    '*DESCRIÇÃO:*',
    '*TOTAL DE PARTICIPANTES:*',
    'Participantes',
    '*CRIADOR DO GRUPO:*',
    '*ADMINS DO GRUPO:*',
    '*OPÇÕES AUTOMÁTICAS:*',
    '—◉ WELCOME:',
    '—◉ DETECT:',
    '—◉ DETECT 2:',
    '—◉ ANTILINK:',
    '—◉ ANTILINK 2:',
    '—◉ MODO HORNY:',
    '—◉ AUTOSTICKER:',
    '—◉ AUDIOS:',
    '—◉ ANTIVIEWONCE:',
    '—◉ ANTIDELETE:',
    '—◉ ANTITOXIC:',
    '—◉ ANTI TRABA:',
    '—◉ MODOADMIN:',
    'SEM DESCRIÇÃO'
  ];
  const text = `${texto1[0]}\n
  ${texto1[1]}* 
${groupMetadata.id}

${texto1[2]}
${groupMetadata.subject}

${texto1[3]} 
${groupMetadata.desc?.toString() || texto1[22]}


${texto1[4]} 
${participants.length} ${texto1[5]} 

${texto1[6]}  
@${owner.split('@')[0]}

${texto1[7]}  
${listAdmin}

${texto1[8]} 
${texto1[9]}  ${welcome ? '✅' : '❌'}
${texto1[10]}  ${detect ? '✅' : '❌'} 
${texto1[11]}  ${detect2 ? '✅' : '❌'} 
${texto1[12]}  ${antiLink ? '✅' : '❌'} 
${texto1[13]}  ${antiLink2 ? '✅' : '❌'} 
${texto1[14]}  ${modohorny ? '✅' : '❌'} 
${texto1[15]}  ${autosticker ? '✅' : '❌'} 
${texto1[16]}  ${audios ? '✅' : '❌'} 
${texto1[17]}  ${antiviewonce ? '✅' : '❌'} 
${texto1[18]}  ${antidelete ? '✅' : '❌'} 
${texto1[19]}  ${antiToxic ? '✅' : '❌'} 
${texto1[20]}  ${antiTraba ? '✅' : '❌'} 
${texto1[21]}  ${modoadmin ? '✅' : '❌'} 
`.trim();
  conn.sendFile(m.chat, pp, 'error.jpg', text, m, false, {mentions: [...groupAdmins.map((v) => v.id), owner]});
};
handler.help = ['infogrup'];
handler.tags = ['group'];
handler.command = /^(infogrupo|gro?upinfo|info(gro?up|gc))$/i;
handler.group = true;
export default handler;

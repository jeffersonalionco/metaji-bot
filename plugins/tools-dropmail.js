import fetch from 'node-fetch';

const handler = async (m, { conn, isOwner, usedPrefix, command, text }) => {
 conn.dropmail = conn.dropmail ? conn.dropmail : {};
 const id = 'dropmail';
 const lister = ['create', 'message', 'delete'];

 const [feature, inputs, inputs_, inputs__, inputs___] = text.split(' ');
 if (!lister.includes(feature)) return m.reply('*Exemplo:*\n' + usedPrefix + command + ' create\n\n*Selecione um tipo existente*\n' + lister.map((v) => '  ○ ' + v).join('\n'));
 if (lister.includes(feature)) {
   if (feature == 'create') {
     try {
       const eml = await random_mail();
       const timeDiff = new Date(eml[2]) - new Date();
       await m.reply('*EMAIL:*\n' + eml[0] + '\n\n*ID:*\n' + eml[1] + '\n*Expira em:* ' + msToTime(timeDiff) + '\n\n_Exemplo *' + usedPrefix + command + ' message* para verificar a caixa de entrada_');
       conn.dropmail[id] = [eml[0], eml[1], eml[2]];
     } catch (e) {
       await m.reply(eror);
     }
   }
   if (feature == 'message') {
     if (!conn.dropmail[id]) return m.reply('Nenhuma mensagem, crie um email primeiro\nExemplo *' + usedPrefix + command + ' create*');
     try {
       const eml = await get_mails(conn.dropmail[id][1]);
       const teks = eml[0].map((v, index) => {
         return `*EMAIL [ ${index + 1} ]*\n*De:* ${v.fromAddr}\n*Para:* ${v.toAddr}\n\n*Mensagem:* ${v.text}\n*Tamanho:* ${formatSize(v.rawSize)}\n*Assunto:* ${v.headerSubject}\n*Download:* ${v.downloadUrl}`.trim();
       }).filter((v) => v).join('\n\n________________________\n\n');
       await m.reply(teks || '*VAZIO*\n\n_Exemplo *' + usedPrefix + command + ' delete* para eliminar emails_');
     } catch (e) {
       await m.reply(eror);
     }
   }
   if (feature == 'delete') {
     if (!conn.dropmail[id]) return m.reply('Não há email válido');
     try {
       delete conn.dropmail[id];
       await m.reply('Email eliminado com sucesso');
     } catch (e) {
       await m.reply(eror);
     }
   }
 }
};

handler.help = ['dropmail'];
handler.tags = ['tools'];
handler.command = ['dropmail'];

export default handler;

function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100);
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  return `${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`;
}

function formatSize(sizeInBytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  while (sizeInBytes >= 1024 && index < units.length - 1) {
    sizeInBytes /= 1024;
    index++;
  }
  return sizeInBytes.toFixed(2) + ' ' + units[index];
}

async function random_mail() {
  const link = 'https://dropmail.me/api/graphql/web-test-wgq6m5i?query=mutation%20%7BintroduceSession%20%7Bid%2C%20expiresAt%2C%20addresses%20%7Baddress%7D%7D%7D';
  try {
    const response = await fetch(link);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const email = data['data']['introduceSession']['addresses'][0]['address'];
    const id_ = data['data']['introduceSession']['id'];
    const time = data['data']['introduceSession']['expiresAt'];
    return [email, id_, time];
  } catch (error) {
    console.log(error);
  }
}

async function get_mails(id_) {
  const link = `https://dropmail.me/api/graphql/web-test-wgq6m5i?query=query%20(%24id%3A%20ID!)%20%7Bsession(id%3A%24id)%20%7B%20addresses%20%7Baddress%7D%2C%20mails%7BrawSize%2C%20fromAddr%2C%20toAddr%2C%20downloadUrl%2C%20text%2C%20headerSubject%7D%7D%20%7D&variables=%7B%22id%22%3A%22${id_}%22%7D`;
  try {
    const response = await fetch(link);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const inbox = data['data']['session']['mails'];
    return [inbox, inbox.length];
  } catch (error) {
    console.log(error);
  }
}

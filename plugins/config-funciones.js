const handler = async (m, {conn, usedPrefix, command, args, isOwner, isAdmin, isROwner}) => {
const optionsFull = `_*< FUNÇÕES DO BOT />*_\n 

▢ *Opção:* ✨  | WELCOME
▢ *Comando:* ${usedPrefix + command} welcome
▢ *Descrição:* Ativa ou desativa a mensagem de boas-vindas no grupo.

--------------------------------

▢ *Opção:* 🌎 | PUBLIC
▢ *Comando:* ${usedPrefix + command} public
▢ *Descrição:* Alterna o bot entre modo público e privado.
▢ *Nota:* Este comando só pode ser usado pelo(s) dono(s) do bot.

--------------------------------

▢ *Opção:* 🥵 | MODOHORNY
▢ *Comando:* ${usedPrefix + command} modohorny
▢ *Descrição:* Ativa ou desativa comandos +18 no grupo.

--------------------------------

▢ *Opção:* 🔗 | ANTILINK
▢ *Comando:* ${usedPrefix + command} antilink
▢ *Descrição:* Ativa ou desativa o anti-links do WhatsApp.
▢ *Nota:* É necessário ter a função restrict ativada.

--------------------------------

▢ *Opção:* 🔗 | ANTILINK 2
▢ *Comando:* ${usedPrefix + command} antilink2
▢ *Descrição:* Ativa ou desativa o anti-links que começam com HTTPS.
▢ *Nota:* É necessário ter a função restrict ativada.

--------------------------------

▢ *Opção:* 🔎 | DETECT
▢ *Comando:* ${usedPrefix + command} detect
▢ *Descrição:* Ativa ou desativa notificações de mudanças no grupo.

--------------------------------

▢ *Opção:* 🔎 | DETECT 2
▢ *Comando:* ${usedPrefix + command} detect2
▢ *Descrição:* Detecta alterações no grupo e mantém uma melhor gestão.

--------------------------------

▢ *Opção:* ⚠️ | RESTRICT
▢ *Comando:* ${usedPrefix + command} restrict
▢ *Descrição:* Ativa ou desativa funções restritas (ban/kick/add, etc.).
▢ *Nota:* Pode exigir permissões de dono.
--------------------------------

▢ *Opção:* 👁️ | AUTOREAD
▢ *Comando:* ${usedPrefix + command} autoread
▢ *Descrição:* Ativa ou desativa leitura automática das mensagens.
▢ *Nota:* Geralmente é configuração do bot (global).

--------------------------------

▢ *Opção:* 🔊 | AUDIOS
▢ *Comando:* ${usedPrefix + command} audios
▢ *Descrição:* Ativa ou desativa a função de áudios no chat/grupo.

--------------------------------

▢ *Opção:* 🧩 | AUTOSTICKER
▢ *Comando:* ${usedPrefix + command} autosticker
▢ *Descrição:* Converte imagens/vídeos em sticker automaticamente.

--------------------------------

▢ *Opção:* 🔒 | PCONLY
▢ *Comando:* ${usedPrefix + command} pconly
▢ *Descrição:* Deixa o bot funcionando apenas no privado.
▢ *Nota:* Configuração global do bot.

--------------------------------

▢ *Opção:* 👥 | GCONLY
▢ *Comando:* ${usedPrefix + command} gconly
▢ *Descrição:* Deixa o bot funcionando apenas em grupos.
▢ *Nota:* Configuração global do bot.

--------------------------------

▢ *Opção:* 🕵️ | ANTIVIEWONCE
▢ *Comando:* ${usedPrefix + command} antiviewonce
▢ *Descrição:* Ativa ou desativa interceptação de mensagens “ver uma vez”.

--------------------------------

▢ *Opção:* 📵 | ANTICALL
▢ *Comando:* ${usedPrefix + command} anticall
▢ *Descrição:* Ativa ou desativa o anti-ligação (bloqueia/ignora chamadas).
▢ *Nota:* Configuração global do bot.

--------------------------------

▢ *Opção:* 🤬 | ANTITOXIC
▢ *Comando:* ${usedPrefix + command} antitoxic
▢ *Descrição:* Ativa ou desativa filtro anti-toxidade no grupo.
▢ *Nota:* Requer admin no grupo.

--------------------------------

▢ *Opção:* 🧱 | ANTITRABA
▢ *Comando:* ${usedPrefix + command} antitraba
▢ *Descrição:* Ativa ou desativa proteção anti-travas/spam pesado.
▢ *Nota:* Requer admin no grupo.

--------------------------------

▢ *Opção:* 🛡️ | ANTIARABES
▢ *Comando:* ${usedPrefix + command} antiarabes
▢ *Descrição:* Ativa ou desativa o filtro anti-“arabes” (anti-fake/raid).
▢ *Nota:* Requer admin no grupo.

--------------------------------

▢ *Opção:* 🛡️ | ANTIARABES 2
▢ *Comando:* ${usedPrefix + command} antiarabes2
▢ *Descrição:* Variante alternativa do filtro anti-“arabes”.
▢ *Nota:* Requer admin no grupo.

--------------------------------

▢ *Opção:* 👮 | MODOADMIN
▢ *Comando:* ${usedPrefix + command} modoadmin
▢ *Descrição:* Restringe comandos para admins (ou dono).

--------------------------------

▢ *Opção:* 🤖 | SIMSIMI
▢ *Comando:* ${usedPrefix + command} simsimi
▢ *Descrição:* Ativa ou desativa o modo Simsimi no chat.

--------------------------------

▢ *Opção:* 🗑️ | ANTIDELETE
▢ *Comando:* ${usedPrefix + command} antidelete
▢ *Descrição:* Ativa ou desativa captura de mensagens apagadas.

--------------------------------

▢ *Opção:* 🎛️ | AUDIOS_BOT
▢ *Comando:* ${usedPrefix + command} audios_bot
▢ *Descrição:* Ativa ou desativa áudios automáticos do bot.
▢ *Nota:* Configuração global do bot.

--------------------------------

▢ *Opção:* 🚫 | ANTISPAM
▢ *Comando:* ${usedPrefix + command} antispam
▢ *Descrição:* Ativa ou desativa proteção anti-spam.
▢ *Nota:* Configuração global do bot.

--------------------------------

▢ *Opção:* 🧩 | MODEJADIBOT
▢ *Comando:* ${usedPrefix + command} modejadibot
▢ *Descrição:* Ativa/desativa o modo “JadiBot” (${usedPrefix}serbot / ${usedPrefix}jadibot).
▢ *Nota:* Configuração global do bot.

--------------------------------

▢ *Opção:* 📴 | ANTIPRIVADO
▢ *Comando:* ${usedPrefix + command} antiprivado
▢ *Descrição:* Ativa ou desativa o bloqueio de comandos no privado.
▢ *Nota:* Configuração global do bot.`.trim();

  const isEnable = /true|enable|(turn)?on|1/i.test(command);
  const chat = global.db.data.chats[m.chat];
  const user = global.db.data.users[m.sender];
  const bot = global.db.data.settings[conn.user.jid] || {};
  const type = (args[0] || '').toLowerCase();
  let isAll = false; const isUser = false;
  switch (type) {
    case 'welcome':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          throw false;
        }
      } else if (!(isAdmin || isOwner || isROwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
      chat.welcome = isEnable;
      break;
    case 'detect':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          throw false;
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn);
        throw false;
      }
      chat.detect = isEnable;
      break;
    case 'detect2':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          throw false;
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn);
        throw false;
      }
      chat.detect2 = isEnable;
      break;
    case 'simsimi':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.simi = isEnable;
      break;
    case 'antiporno':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiporno = isEnable;
      break;
    case 'delete':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.delete = isEnable;
      break;
    case 'antidelete':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antidelete = isEnable;
      break;
    case 'public':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['self'] = !isEnable;
      break;
    case 'antilink':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiLink = isEnable;
      break;
    case 'antilink2':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiLink2 = isEnable;
      break;
    case 'antiviewonce':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiviewonce = isEnable;
      break;
    case 'modohorny':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.modohorny = isEnable;
      break;
    case 'modoadmin':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.modoadmin = isEnable;
      break;
    case 'autosticker':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.autosticker = isEnable;
      break;
    case 'audios':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.audios = isEnable;
      break;
    case 'restrict':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.restrict = isEnable;
      break;
    case 'audios_bot':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.audios_bot = isEnable;      
      break;      
    case 'nyimak':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['nyimak'] = isEnable;
      break;
    case 'autoread':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      bot.autoread2 = isEnable;
      //global.opts['autoread'] = isEnable;
      break;
    case 'pconly':
    case 'privateonly':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['pconly'] = isEnable;
      break;
    case 'gconly':
    case 'grouponly':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['gconly'] = isEnable;
      break;
    case 'swonly':
    case 'statusonly':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['swonly'] = isEnable;
      break;
    case 'anticall':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.antiCall = isEnable;
      break;
    case 'antiprivado':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.antiPrivate = isEnable;
      break;
    case 'modejadibot':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      bot.modejadibot = isEnable;
      break;
    case 'antispam':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.antispam = isEnable;
      break;
    case 'antitoxic':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiToxic = isEnable;
      break;
      case 'game': case 'juegos': case 'fun': case 'ruleta':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.game = isEnable          
break;
    case 'antitraba':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiTraba = isEnable;
      break;
    case 'antiarabes':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn); 
          throw false;
        }
      }
      chat.antiArab = isEnable;
      break;
    case 'antiarabes2':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiArab2 = isEnable;
      break;
    default:
      if (!/[01]/.test(command)) return await conn.sendMessage(m.chat, {text: optionsFull}, {quoted: m});
      throw false;
  }
  const alvo = isAll ? 'o bot' : 'este chat';
  conn.sendMessage(
    m.chat,
    {text: `_*✅ Configuração atualizada*_\n\nA função _${type}_ foi ${isEnable ? '*ativada*' : '*desativada*'} para ${alvo}.`},
    {quoted: m},
  );
};
handler.command = /^((en|dis)able|(tru|fals)e|(turn)?[01])$/i;
export default handler;

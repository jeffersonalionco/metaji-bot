import axios from 'axios';

let handler = async (m, { conn, text, command }) => {
  try {
    if (command === 'delmemoryia' || command === 'borrarmemoriaai') {
      if (!global.db.data.users) global.db.data.users = {};
      if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
      global.db.data.users[m.sender].chatHistory = [];
      if (typeof global.db.write === 'function') global.db.write();
      return m.reply('🗑️ Memória de conversação apagada com sucesso.\n\nNão lembrarei mais das nossas conversas anteriores.');
    }
      
    if (!text) return m.reply('*[❗] Digite uma pergunta ou ordem para usar a função do ChatGPT*\n\n*—◉ Exemplos de perguntas e ordens:*\n*◉* Reflexão sobre a série Merlina 2022 da Netflix\n*◉* Código em JS para um jogo de cartas');

    const model = await axios.get("https://raw.githubusercontent.com/Skidy89/chat-gpt-jailbreak/refs/heads/main/Text.txt");
    const context = `${model.data}`.trim();
    
    const result = await luminsesi(text, m.sender, context);
    m.reply(result);
  } catch (error) {
    console.error('[❌ ERROR GENERAL]', error);
    m.reply('*[❗] Erro, tente novamente*');
  }
};

handler.help = ['exploit', 'delmemoryia'];
handler.tags = ['ai'];
handler.command = /^(xexploit|ia2|exploit|delmemoryia|borrarmemoriaai)$/i;
export default handler;

function getUserHistory(sender) {
  if (!global.db.data.users) global.db.data.users = {};
  if (!global.db.data.users[sender]) {
    global.db.data.users[sender] = {};
  }
  if (!global.db.data.users[sender].chatHistory) {
    global.db.data.users[sender].chatHistory = [];
  }
  return global.db.data.users[sender].chatHistory;
}

function saveUserMessage(sender, role, content) {
  if (!content || typeof content !== 'string') return;
  if (!global.db.data.users) global.db.data.users = {};
  if (!global.db.data.users[sender]) global.db.data.users[sender] = {};
  if (!global.db.data.users[sender].chatHistory) global.db.data.users[sender].chatHistory = [];
  
  global.db.data.users[sender].chatHistory.push({ role, content });
  
  if (global.db.data.users[sender].chatHistory.length > 10) {
    global.db.data.users[sender].chatHistory = global.db.data.users[sender].chatHistory.slice(-10);
  }
  
  if (typeof global.db.write === 'function') global.db.write();
}

async function luminsesi(prompt, sender, contextLogic = '') {
  saveUserMessage(sender, 'user', prompt);
  const messages = getUserHistory(sender);
  const logic = contextLogic || 'Você é um bot chamado Youru, sempre educado e útil.';
  
  try {
    const { data } = await axios.post('https://api.manaxu.my.id/api/v1/ai', 
      { logic, messages },  
      { headers: { 'x-api-key': 'key-manaxu-free' } }
    );
    const result = data.result;
    saveUserMessage(sender, 'assistant', result);
    return result;
  } catch (err) {
    console.error('❌ API Error:', err.response?.data || err.message);
    return '⚠️ Ocorreu um erro ao contactar a API.';
  }
}

function getLanguageName(code) {
  const languages = {
    'es': 'Español',
    'en': 'English', 
    'pt': 'Português',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'ru': 'Русский',
    'ja': '日本語',
    'ko': '한국어',
    'zh': '中文'
  };
  return languages[code] || 'Español';
}

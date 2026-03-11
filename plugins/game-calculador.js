const handler = async (m, { conn, command, text, usedPrefix }) => {
  const texto26 = '*[❗] Informe um nome ou marque alguém.*';
  const texto22 = '*[❗] Opção inválida.*';
  const texto24 = 'CALCULADORA';
  const texto25 = '*Calculando...*';
  const texto23 = [
    'A vida é feita de escolhas.',
    'Nada acontece por acaso.',
    'Confie no processo.',
    'Hoje é um bom dia para recomeçar.',
    'Faça o seu melhor.',
    'Bora viver sem drama.',
  ];
  const texto1 = ['*Os cálculos indicam que', 'é', '*-❥ Isso é baixo... talvez você nem seja tão gay assim! 😄*'];
  const texto2 = ['*Os cálculos indicam que', 'é', '*-❥ Até mais gay do que a gente imaginava! 💃*'];
  const texto3 = ['*Os cálculos indicam que', 'é', '*-❥ No seu caso, é bem gay mesmo. ☠*'];
  const texto4 = ['*Os cálculos indicam que', 'é', '*-❥ Talvez você precise de mais filmes românticos na sua vida. 🎬*'];
  const texto5 = ['*Os cálculos indicam que', 'é', '*-❥ Isso é um amor extremo pelas garotas! 👩‍❤️‍👩*'];
  const texto6 = ['*Os cálculos indicam que', 'é', '*-❥ Mantenha o amor florescendo! 🌸*'];
  const texto7 = ['*Os cálculos indicam que', 'é', '*-❥ Talvez você precise de mais hobbies! 🎨*'];
  const texto8 = ['*Os cálculos indicam que', 'é', '*-❥ Isso é uma resistência admirável! 💪*'];
  const texto9 = ['*Os cálculos indicam que', 'é', '*-❥ Continue o bom trabalho (sozinho). 🙌*'];
  const texto10 = ['*Os cálculos indicam que', 'é', '*-❥ Mais sorte na sua próxima conquista! 💔*'];
  const texto11 = ['*Os cálculos indicam que', 'é', '*-❥ Você está pegando fogo! 🚒*'];
  const texto12 = ['*Os cálculos indicam que', 'é', '*-❥ Mantenha esse charme ardente! 🔥*'];
  const texto13 = ['*Os cálculos indicam que', 'é', '*-❥ Você não é o único nesse clube! 😅*'];
  const texto14 = ['*Os cálculos indicam que', 'é', '*-❥ Você tem um talento bem especial! 🙈*'];
  const texto15 = ['*Os cálculos indicam que', 'é', '*-❥ Mantenha essa atitude corajosa! 🤙*'];
  const texto16 = ['*Os cálculos indicam que', 'é', '*-❥ Nada de errado em gostar de queijo! 🧀*'];
  const texto17 = ['*Os cálculos indicam que', 'é', '*-❥ Um rato de luxo de verdade! 🏰*'];
  const texto18 = ['*Os cálculos indicam que', 'é', '*-❥ Coma queijo com responsabilidade! 🧀*'];
  const texto19 = ['*Os cálculos indicam que', 'é', '*-❥ O mercado está em alta! 💼*'];
  const texto20 = ['*Os cálculos indicam que', 'é', '*-❥ Um(a) verdadeiro(a) profissional! 💰*'];
  const texto21 = ['*Os cálculos indicam que', 'é', '*-❥ Continue brilhando no seu corre! ✨*'];

  if (!text) throw texto26;
  const percentages = (500).getRandom();
  let emoji = '';
  let description = '';
  switch (command) {
    case 'gay2':
      emoji = '🏳️‍🌈';
      if (percentages < 50) {
        description = `${texto1[0]} ${text.toUpperCase()} ${texto1[1]} ${percentages}% Gay. ${emoji}*\n${texto1[2]}`;
      } else if (percentages > 100) {
        description = `${texto2[0]} ${text.toUpperCase()} ${texto2[1]} ${percentages}% Gay. ${emoji}*\n${texto2[2]}`;
      } else {
        description = `${texto3[0]} ${text.toUpperCase()} ${texto3[1]} ${percentages}% Gay. ${emoji}*\n${texto3[2]}`;
      }
      break;
    case 'lesbiana':
      emoji = '🏳️‍🌈';
      if (percentages < 50) {
        description = `${texto4[0]} ${text.toUpperCase()} ${texto4[1]} ${percentages}% ${command}. ${emoji}*\n${texto4[2]}`;
      } else if (percentages > 100) {
        description = `${texto5[0]} ${text.toUpperCase()} ${texto5[1]} ${percentages}% ${command}. ${emoji}*\n${texto5[2]}`;
      } else {
        description = `${texto6[0]} ${text.toUpperCase()} ${texto6[1]} ${percentages}% ${command}. ${emoji}*\n${texto6[2]}`;
      }
      break;
    case 'pajero':
    case 'pajera':
      emoji = '😏💦';
      if (percentages < 50) {
        description = `${texto7[0]} ${text.toUpperCase()} ${texto7[1]} ${percentages}% ${command}. ${emoji}*\n${texto7[2]}`;
      } else if (percentages > 100) {
        description = `${texto8[0]} ${text.toUpperCase()} ${texto8[1]} ${percentages}% ${command}. ${emoji}*\n${texto8[2]}`;
      } else {
        description = `${texto9[0]} ${text.toUpperCase()} ${texto9[1]} ${percentages}% ${command}. ${emoji}*\n${texto9[2]}`;
      }
      break;
    case 'puto':
    case 'puta':
      emoji = '🔥🥵';
      if (percentages < 50) {
        description = `${texto10[0]} ${text.toUpperCase()} ${texto10[1]} ${percentages}% ${command}. ${emoji}*\n${texto10[2]}`;
      } else if (percentages > 100) {
        description = `${texto11[0]} ${text.toUpperCase()} ${texto11[1]} ${percentages}% ${command}. ${emoji}*\n${texto11[2]}`;
      } else {
        description = `${texto12[0]} ${text.toUpperCase()} ${texto12[1]} ${percentages}% ${command}. ${emoji}*\n${texto12[2]}`;
      }
      break;
    case 'manco':
    case 'manca':
      emoji = '💩';
      if (percentages < 50) {
        description = `${texto13[0]} ${text.toUpperCase()} ${texto13[1]} ${percentages}% ${command}. ${emoji}*\n${texto13[2]}`;
      } else if (percentages > 100) {
        description = `${texto14[0]} ${text.toUpperCase()} ${texto14[1]} ${percentages}% ${command}. ${emoji}*\n${texto14[2]}`;
      } else {
        description = `${texto15[0]} ${text.toUpperCase()} ${texto15[1]} ${percentages}% ${command}. ${emoji}*\n${texto15[2]}`;
      }
      break;
    case 'rata':
      emoji = '🐁';
      if (percentages < 50) {
        description = `${texto16[0]} ${text.toUpperCase()} ${texto16[1]} ${percentages}% ${command}. ${emoji}*\n${texto16[2]}`;
      } else if (percentages > 100) {
        description = `${texto17[0]} ${text.toUpperCase()} ${texto17[1]} ${percentages}% ${command}. ${emoji}*\n${texto17[2]}`;
      } else {
        description = `${texto18[0]} ${text.toUpperCase()} ${texto18[1]} ${percentages}% ${command}. ${emoji}*\n${texto18[2]}`;
      }
      break;
    case 'prostituto':
    case 'prostituta':
      emoji = '🫦👅';
      if (percentages < 50) {
        description = `${texto19[0]} ${text.toUpperCase()} ${texto19[1]} ${percentages}% ${command}. ${emoji}*\n${texto19[2]}`;
      } else if (percentages > 100) {
        description = `${texto20[0]} ${text.toUpperCase()} ${texto20[1]} ${percentages}% ${command}. ${emoji}*\n${texto20[2]}`;
      } else {
        description = `${texto21[0]} ${text.toUpperCase()} ${texto21[1]} ${percentages}% ${command}. ${emoji}*\n${texto21[2]}`;
      }
      break;
      default:
      throw texto22;
  }
  const responses = texto23;
  const response = responses[Math.floor(Math.random() * responses.length)];
  const cal = `━━━━⬣ ${texto24} ⬣━━━━

—◉ ${description}

*"${response}"*

━━━━⬣ ${texto24} ⬣━━━━`.trim()  
  async function loading() {
var hawemod = [
"《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
"《 ████▒▒▒▒▒▒▒▒》30%",
"《 ███████▒▒▒▒▒》50%",
"《 ██████████▒▒》80%",
"《 ████████████》100%"
]
   let { key } = await conn.sendMessage(m.chat, {text: `${texto25}`, mentions: conn.parseMention(cal)}, {quoted: m})
 for (let i = 0; i < hawemod.length; i++) {
   await new Promise(resolve => setTimeout(resolve, 1000)); 
   await conn.sendMessage(m.chat, {text: hawemod[i], edit: key, mentions: conn.parseMention(cal)}, {quoted: m}); 
  }
  await conn.sendMessage(m.chat, {text: cal, edit: key, mentions: conn.parseMention(cal)}, {quoted: m});         
 }
loading()    
};
handler.help = ['gay2', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituta', 'prostituto'].map((v) => v + ' @tag | nome');
handler.tags = ['game'];
handler.command = /^(gay2|lesbiana|pajero|pajera|puto|puta|manco|manca|rata|prostituta|prostituto)$/i;
export default handler;

const PIROPOS = [
  'Gostaria de ser papel para poder embrulhar esse bombom.',
  'Você é como wifi sem senha, todo mundo te procura',
  'Quem fosse ônibus para andar pelas curvas do seu coração.',
  'Quero voar sem asas e sair deste universo, entrar no seu e te amar em silêncio.',
  'Quisera ser manteiga para derreter na sua comida.',
  'Se a beleza fosse pecado você já estaria no inferno.',
  'Gostaria de ser um gato para passar 7 vidas ao seu lado.',
  'Roubar está errado, mas um beijo da sua boca eu roubaria.',
  'Que lindo é o céu quando está claro, mas mais lindo é o amor quando te tenho ao meu lado.',
  'Linda, caminhe na sombra, o sol derrete os chocolates.',
  'Se fosse um email você seria minha senha.',
  'Perdi meu número de telefone. Me dá o seu?',
  'Como você se chama para te pedir de presente ao Papai Noel?',
  'No céu há muitas estrelas, mas a mais brilhante está na Terra e é você.',
  'Acabou de sair o sol ou é o sorriso que me dá hoje?',
  'Não é o rum nem a cerveja, é você que se subiu à minha cabeça',
  'Se falarmos de matemática você é a soma de todos os meus desejos.',
  'Parece o Google porque tem tudo que eu busco.',
  'Meu café favorito é o dos seus olhos.',
  'Quero ser photoshop para retocar todo o seu corpo.',
  'Quem fosse fome, para te dar três vezes ao dia.',
];

const handler = async (m, {conn}) => {
 const piropo = PIROPOS[Math.floor(Math.random() * PIROPOS.length)];
 m.reply(`*╔═══════════════════════════*\n➢ *"${piropo}"*\n*╚═══════════════════════════*`);
};

handler.help = ['piropo'];
handler.tags = ['tools'];
handler.command = ['piropo'];
export default handler;

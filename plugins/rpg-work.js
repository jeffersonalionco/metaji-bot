const workOptions = [
  'Você é um mestre alquimista, destilando poções misteriosas em busca de segredos perdidos.',
  'Você se torna um caçador de tesouros intrépido, explorando lugares esquecidos em busca de riquezas escondidas.',
  'Você dirige um negócio de transmutação de metais, convertendo o comum em tesouros valiosos.',
  'Você explora ruínas antigas e encontra uma relíquia valiosa que lhe concede conhecimentos ancestrais.',
  'Você trabalha como mercenário em uma guerra épica, enfrentando desafios com sua habilidade e coragem.',
  'Você é um investigador do paranormal, descobrindo os segredos ocultos do mundo espiritual.',
  'Você treina dragões para corridas, formando laços com essas majestosas criaturas aladas.',
  'Você se torna o melhor ferreiro da cidade, forjando armas lendárias e artefatos poderosos.',
  'Você descobre uma floresta encantada cheia de criaturas mágicas, estabelecendo uma conexão única com a natureza.',
  'Você é um domador de bestas ferozes, controlando as criaturas mais selvagens com seu domínio animal.',
  'Você viaja no tempo e resolve problemas históricos, influenciando o destino de civilizações passadas.',
  'Você é um conselheiro real, aportando sabedoria e conselho a governantes e líderes.',
  'Você desenvolve tecnologia futurista, impulsionando a inovação e mudando o rumo do mundo.',
  'Você é um mestre na arte da persuasão, convencendo outros com sua eloquência e astúcia.',
  'Você pilota um mecha gigante em batalhas épicas, defendendo a Terra com sua destreza na máquina de guerra.',
  'Você dirige uma fazenda de dragões, cuidando dessas majestosas criaturas e criando dragões únicos.',
  'Você é um espião internacional, infiltrando-se em organizações secretas e desmascarando complôs sombrios.',
  'Você explora o espaço e faz descobertas surpreendentes que lhe concedem uma visão única do universo.',
  'Você é um mago de renome, realizando truques impressionantes e conjurando feitiços mágicos.',
  'Você é um cientista maluco, criando invenções extravagantes e experimentos incomuns.',
  'Você defende o reino contra um exército invasor, liderando exércitos e demonstrando sua coragem na batalha.',
  'Você é um navegante audaz, explorando mares desconhecidos e descobrindo ilhas cheias de tesouros.',
  'Você é um mestre na arte do sigilo, movendo-se nas sombras e realizando missões secretas.',
  'Você é um chef renomado, criando pratos deliciosos que encantam os paladares de todo o mundo.',
  'Você investiga crimes complexos como um detetive hábil, resolvendo mistérios intrigantes.',
  'Você é um diplomata hábil, negociando tratados e alianças para manter a paz entre as nações.',
  'Você é um xamã poderoso, canalizando energias espirituais para curar e proteger.',
  'Você desenvolve aplicativos mágicos para dispositivos encantados, melhorando a vida das pessoas com suas invenções.',
  'Você é um campeão em torneios de luta, demonstrando sua destreza no combate corpo a corpo.',
];

const handler = async (m, { conn }) => {
  let enviando;
  if (enviando) return;
  enviando = true;
  const hasil = Math.floor(Math.random() * 5000);
  const time = global.db.data.users[m.sender].lastwork + 600000;
  if (new Date - global.db.data.users[m.sender].lastwork < 600000) throw `⚔️ *Espere um momento, pequeno aventureiro!* ⚔️\n\n*—◉ Volte à jornada em ${msToTime(time - new Date())} ⏳*`;
  conn.sendMessage(m.chat, { text: `🏞️ *Você embarca em uma aventura emocionante:*\n\n🛠️ *${pickRandom(workOptions)}*\n\n*Você ganhou ${hasil} de exp pela sua bravura!*` }, { quoted: m });
  global.db.data.users[m.sender].exp += hasil;
  global.db.data.users[m.sender].lastwork = new Date() * 1;
  enviando = false;
};
handler.help = ['work'];
handler.tags = ['xp'];
handler.command = /^(work|trabajar|chambear)$/i;
handler.fail = null;
export default handler;

function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;
  return minutes + ' minutos ' + seconds + ' segundos ';
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}

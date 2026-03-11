const TEXTO_LISTPREM = {
  texto1: [
    "*「 INFORMAÇÕES DO USUÁRIO 」*",
    "—◉ Usuário:",
    "*◉ Tempo restante:*\n",
    "*◉ Tempo restante:*\n- Você é um usuário premium por tempo ilimitado",
    "- Este não é um usuário premium ❌",
    "*「 USUÁRIOS PREMIUM 」*",
    "—◉ Usuário:",
    "*◉ Tempo restante:*\n",
    "- Este não é um usuário premium ❌"
  ],
  texto2: [
    "*「 INFORMAÇÕES DO USUÁRIO 」*\n\n—◉ Usuário:",
    "*◉ Tempo restante:*\n",
    "- Você não é um usuário premium ❌",
    "*「 USUÁRIOS PREMIUM 」*\n\n- Não há usuários premium ❌"
  ],
  texto3: [
    "- Ano(s):",
    "- Mês(es):",
    "- Semana(s):",
    "- Dia(s):",
    "- Hora(s):",
    "- Minuto(s):",
    "- Segundo(s):"
  ]
};

const handler = async (m, {conn, args, isPrems}) => {
  const t = TEXTO_LISTPREM;

  function clockString(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    return `${t.texto3[0]} ${years}\n${t.texto3[1]} ${months}\n${t.texto3[2]} ${weeks}\n${t.texto3[3]} ${days}\n${t.texto3[4]} ${hours % 24}\n${t.texto3[5]} ${minutes % 60}\n${t.texto3[6]} ${seconds % 60}`;
  }

  const usuario = global.db.data.users[m.sender].premiumTime;
  const user = Object.entries(global.db.data.users).filter((user) => user[1].premiumTime).map(([key, value]) => {
    return {...value, jid: key};
  });
  const premTime = global.db.data.users[m.sender].premiumTime;
  const prem = global.db.data.users[m.sender].premium;
  const userr = '@' + m.sender.split`@`[0];
  const sortedP = user.map(toNumber('premiumTime')).sort(sort('premiumTime'));
  const len = args[0] && args[0].length > 0 ? Math.min(100, Math.max(parseInt(args[0]), 10)) : Math.min(10, sortedP.length);
  let infoprem = `
${t.texto1[0]}

${t.texto1[1]} ${userr}
${prem ? `${t.texto1[2]} ${clockString(usuario - new Date() * 1)}` : (isPrems ? `${t.texto1[3]}` : t.texto1[4])}

${t.texto1[5]} ${sortedP.slice(0, len).map(({jid, name, premiumTime, prem, registered}, i) => `

${t.texto1[6]} ${'@' + jid.split`@`[0]}
${premiumTime > 0 ? `${t.texto1[7]} ${clockString(premiumTime - new Date() * 1)}` : t.texto1[8]}`).join('')}`.trim();

  if (sortedP.filter((user) => user.premiumTime).length === 0) {
    infoprem = `${t.texto2[0]} ${userr}\n${prem ? `${t.texto2[1]} ${clockString(usuario - new Date() * 1)}` : t.texto2[2]}\n\n${t.texto2[3]}`.trim();
  }

  m.reply(infoprem, null, {mentions: conn.parseMention(infoprem)});
};
handler.help = ['premlist'];
handler.tags = ['info'];
handler.command = /^(listprem|premlist|listavip|viplista)$/i;
export default handler;

function sort(property, ascending = true) {
  if (property) return (...args) => args[ascending & 1][property] - args[!ascending & 1][property];
  else return (...args) => args[ascending & 1] - args[!ascending & 1];
}

function toNumber(property, _default = 0) {
  if (property) {
    return (a, i, b) => {
      return {...b[i], [property]: a[property] === undefined ? _default : a[property]};
    };
  } else return (a) => a === undefined ? _default : a;
}

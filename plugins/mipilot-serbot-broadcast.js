import ws from 'ws';


const handler = async (m, {conn, usedPrefix, text}) => {
  if (conn.user.jid !== global.conn.user.jid) throw false;
  const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn.user.jid)])];
  const cc = text ? m : m.quoted ? await m.getQuotedObj() : false || m;
  const teks = text ? text : cc.text;
  const content = conn.cMod(m.chat, cc, /bc|broadcast/i.test(teks) ? teks : '*〔 DIFUSÃO PARA SUB BOTS 〕*\n\n' + teks);
  for (const id of users) {
    await delay(1500);
    await conn.copyNForward(id, content, true);
  }
  conn.reply(m.chat, `*Difusão enviada com sucesso a ${users.length} sub bots*
    
  ${users.map((v) => '👉🏻 wa.me/' + v.replace(/[^0-9]/g, '') + `?text=${encodeURIComponent(usedPrefix)}estado`).join('\n')}

*Finalizado em aproximadamente ${users.length * 1.5} segundos*`.trim(), m);
};
handler.command = /^bcbot$/i;
handler.rowner = true;
handler.mods = false;
handler.premium = false;
handler.group = false;
handler.private = false;

handler.admin = false;
handler.botAdmin = false;

handler.fail = null;

export default handler;

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

const delay = (time) => new Promise((res) => setTimeout(res, time));

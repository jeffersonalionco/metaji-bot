const handler = async (m, {conn}) => {
  m.reply(`*[❗] Comando executado com sucesso.*`);
};
handler.command = /^exec2$/i;
handler.rowner = true;
export default handler;

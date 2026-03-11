const handler = async (m, {conn, args, text}) => {
  const newName = args.join` `;
  if (!newName || !args[0]) throw `*[❗] Digite o nome que deseja que seja o novo nome do grupo.*`;
  try {
    conn.groupUpdateSubject(m.chat, newName);
  } catch (e) {
    throw `*[❗] Houve um erro, o nome não pode ter mais de 25 caracteres.*`;
  }
};
handler.help = ['setname <text>'];
handler.tags = ['group'];
handler.command = /^(setname)$/i;
handler.group = true;
handler.admin = true;
export default handler;

import { existsSync, readFileSync } from "fs"

async function handler(m, {usedPrefix}) {
    const user = m.sender.split("@")[0]
    if (existsSync("./jadibts/" + user + "/creds.json")) {
        let token = Buffer.from(readFileSync("./jadibts/" + user + "/creds.json"), "utf-8").toString("base64")
        await m.reply('O token permite iniciar sessão em outros bots, recomendamos não compartilhá-lo com ninguém.\n\n*Seu token é:*')
        await m.reply(token)
    } else {
        await m.reply(`*Você não tem nenhum token ativo, use ${usedPrefix}jadibot para criar um.*`)
    }
}
handler.command = handler.help = ['token', 'gettoken', 'serbottoken'];
handler.tags = ['jadibot'];
handler.private = true
export default handler;
  
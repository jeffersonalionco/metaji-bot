import axios from "axios"
import uploadImage from "../src/libraries/uploadImage.js"

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ""

    if (!mime) throw `*[❗] Envie uma imagem ou responda a uma imagem com o comando ${usedPrefix + command}*`
    if (!/image\/(jpe?g|png)/.test(mime)) throw `*[❗] O formato do arquivo (${mime}) não é compatível. Envie ou responda a uma foto*`

    m.reply('*[❗] Processando imagem...*')

    const img = await q.download()
    const fileUrl = await uploadImage(img)
    const banner = await upscaleWithStellar(fileUrl)

    await conn.sendMessage(m.chat, { image: banner }, { quoted: m })
  } catch (e) {
    throw '*[❗] Erro, por favor tente novamente* ' + e
  }
}

handler.help = ["remini", "hd", "enhance"]
handler.tags = ["ai", "tools"]
handler.command = ["remini", "hd", "enhance"]
export default handler

async function upscaleWithStellar(url) {
  const endpoint = `https://api.stellarwa.xyz/tools/upscale?url=${url}&key=GroupMetaJI`

  const { data } = await axios.get(endpoint, {
    responseType: "arraybuffer",
    headers: {
      accept: "image/*"
    }
  })

  return Buffer.from(data)
}
// Code by Xnuvers007 ft. Jikarinka
// https://github.com/Xnuvers007/
// Mejorado por Group MetaJI

import axios from 'axios';
import cheerio from 'cheerio';

let handler = async (m, { conn, text: tiktok, args, command, usedPrefix }) => {
    if (!tiktok) throw `*[❗] Digite um link do TikTok para baixar imagens, exemplo: "https://vm.tiktok.com/ZM2cqBRVS/".*`;
    let imagesSent
    if (imagesSent) return;
    imagesSent = true
    try {
        let tioShadow = await ttimg(tiktok);
        let result = tioShadow?.data;
        for (let d of result) {
            await conn.sendMessage(m.chat, { image: { url: d } }, { quoted: m });
        };
        imagesSent = false
    } catch {
        imagesSent = false
        throw `*[❗] Não foi obtida resposta da página, tente mais tarde.*`
    }
};
handler.command = /^(ttimg|tiktokimg)$/i;
export default handler;

async function ttimg(link) {
    try {
        let url = `https://dlpanda.com/es?url=${link}&token=G7eRpMaa`;
        let response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        let imgSrc = [];
        $('div.col-md-12 > img').each((index, element) => {
            imgSrc.push($(element).attr('src'));
        });
        if (imgSrc.length === 0) {
            throw new Error('*[❗] Não foram encontradas imagens no link fornecido.*');
        }
        return { data: imgSrc };
    } catch (error) {
        console.log(error);
        throw new Error('*[❗] Não foi obtida resposta da página, tente mais tarde.*');
    };
};

import axios from 'axios';
import cheerio from 'cheerio';

const handler = async (m, {conn, text, args, usedPrefix, command}) => {
  if (!text) throw `_*< BAIXAR - TIKTOK />*_\n\n*[ ℹ️ ] Digite um link do TikTok.*\n\n*[ 💡 ] Exemplo:* _${usedPrefix + command} https://vt.tiktok.com/ZSSm2fhLX/_`;
  if (!/(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok.com\/([^\s&]+)/gi.test(text)) throw `_*< BAIXAR - TIKTOK />*_\n\n*[ ℹ️ ] Digite um link do TikTok.*\n\n*[ 💡 ] Exemplo:* _${usedPrefix + command} https://vt.tiktok.com/ZSSm2fhLX/_`;

  try {
      const links = await fetchDownloadLinks(args[0], 'tiktok', conn, m);
      if (!links) throw new Error('Não foi possível obter os links.');
      const download = getDownloadLink('tiktok', links);
      if (!download) throw new Error('Não foi possível obter o link de download.');
      const cap = `_*< BAIXAR - TIKTOK />*_\n\n*[ 💡 ] Responda a este vídeo com o comando _${usedPrefix}tomp3_ para convertê-lo em áudio.*`;
      await conn.sendMessage(m.chat, {video: {url: download}, caption: cap}, {quoted: m});
    } catch {
      throw `_*< BAIXAR - TIKTOK />*_\n\n*[ ℹ️ ] Ocorreu um erro. Por favor, tente novamente mais tarde.*`;
    }
};
handler.command = /^(tiktok|ttdl|tiktokdl|tiktoknowm|tt|ttnowm|tiktokaudio)$/i;
export default handler;

async function fetchDownloadLinks(text, platform, conn, m) {
    const { SITE_URL, form } = createApiRequest(text, platform);
    const res = await axios.post(`${SITE_URL}api`, form.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': SITE_URL,
            'Referer': SITE_URL,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
    const html = res?.data?.html;
    if (!html || res?.data?.status !== 'success') {
        return null;
    }
    const $ = cheerio.load(html);
    const links = [];
    $('a.btn[href^="http"]').each((_, el) => {
        const link = $(el).attr('href');
        if (link && !links.includes(link)) {
            links.push(link);
        }
    });
    return links;
}

function createApiRequest(text, platform) {
    const SITE_URL = 'https://instatiktok.com/';
    const form = new URLSearchParams();
    form.append('url', text);
    form.append('platform', platform);
    form.append('siteurl', SITE_URL);
    return { SITE_URL, form };
}

function getDownloadLink(platform, links) {
    if (platform === 'tiktok') {
        return links.find(link => /hdplay/.test(link)) || links[0];
    }
    return null;
}

import axios from 'axios';

const handler = async (m, {args}) => {
 if (!args[0]) throw '*[❗] Escreva o nome do seu país ou cidade*';
 try {
   const response = axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${args.join(' ')}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`);
   const res = await response;
   const name = res.data.name;
   const Country = res.data.sys.country;
   const Weather = res.data.weather[0].description;
   const Temperature = res.data.main.temp + '°C';
   const Minimum_Temperature = res.data.main.temp_min + '°C';
   const Maximum_Temperature = res.data.main.temp_max + '°C';
   const Humidity = res.data.main.humidity + '%';
   const Wind = res.data.wind.speed + 'km/h';
   const wea = `「 📍 」Local: ${name}\n「 🗺️ 」País: ${Country}\n「 🌤️ 」Clima: ${Weather}\n「 🌡️ 」Temperatura: ${Temperature}\n「 💠 」Temperatura mínima: ${Minimum_Temperature}\n「 📛 」Temperatura máxima: ${Maximum_Temperature}\n「 💦 」Humidade: ${Humidity}\n「 🌬️ 」Vento: ${Wind}`;
   m.reply(wea);
 } catch {
   m.reply('*[❗] Nenhum resultado encontrado. Verifique se escreveu corretamente seu país ou cidade*');
 }
};

handler.help = ['clima *<cidade/país>*'];
handler.tags = ['tools'];
handler.command = /^(clima|tiempo)$/i;
export default handler;

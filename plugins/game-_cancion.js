import similarity from 'similarity';

const threshold = 0.72;
const handler = {
  
  async before(m) {
    const id = m.chat;
    
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/ADIVINHE O TÍTULO DA MÚSICA/i.test(m.quoted.text)) return !0;
    
    this.tebaklagu = this.tebaklagu ? this.tebaklagu : {};
    if (!(id in this.tebaklagu)) return m.reply('Não há um jogo ativo neste chat.');
    
    if (m.quoted.id == this.tebaklagu[id][0].id) {
      const json = JSON.parse(JSON.stringify(this.tebaklagu[id][1]));
      
      const normalizeText = (text) => {
        return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim();
      };
      
      const userAnswer = normalizeText(m.text);
      const correctAnswer = normalizeText(json.jawaban);
      
      if (userAnswer === correctAnswer) {
        global.db.data.users[m.sender].exp += this.tebaklagu[id][2];
        m.reply(`🎉 Correto!\n\n🎵 *${json.jawaban}* — *${json.artist}*\n💰 +${this.tebaklagu[id][2]} XP`);
        clearTimeout(this.tebaklagu[id][3]);
        delete this.tebaklagu[id];
      } else if (similarity(userAnswer, correctAnswer) >= threshold) {
        // Respuesta muy similar
        m.reply(`🎯 Quase! Você está muito perto...`);
      } else {
        // Respuesta incorrecta
        m.reply('❌ Incorreto. Continue tentando!');
      }
    }
    return !0;
  },
  exp: 0,
};

export default handler;

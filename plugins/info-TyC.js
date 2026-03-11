const TERMOS_CONDICOES = `*=> O desconhecimento do que aqui se menciona não isenta o proprietário do Bot, Sub Bot ou usuário do bot das sanções que possam ser aplicadas❗*

*⚠️ Termos de privacidade*
_1.- As informações que o Bot receber NÃO são compartilhadas com terceiros nem com ninguém_
_2.- Imagens/vídeos/stickers/áudios/etc não são compartilhados com ninguém_
_3.- Seu número de telefone não é compartilhado com absolutamente ninguém_
_4.- Dados de cartões, localizações, endereços, etc são eliminados imediatamente e não são compartilhados com ninguém_
_5.- Todas as conversas são eliminadas periodicamente e não é feito backup (não se guarda) de nenhum tipo de informação/conversa_

*⚠️ Termos de uso*
_1.- Não nos responsabilizamos pelo mau uso que possa ser dado ao Bot_
_2.- Não nos responsabilizamos pela ignorância e/ou desconhecimento do tema_
_3.- O Bot não está ativo 24 horas, a menos que o proprietário decida o contrário_
_4.- A 'empresa' não se responsabiliza pelo uso de Sub Bot ou Bot não oficial_
_5.- Não nos responsabilizamos por números que possam ser bloqueados pelo uso do Bot_
_6.- Os áudios/notas de voz/imagens/vídeos ou outros arquivos multimídia são de propriedade exclusiva deste Bot_

*➤ Mensagem do número do Bot?*
_- Se em algum momento receber uma mensagem do número do Bot que não seja um comando, pode ser do proprietário_

*⁉️ Ficou com dúvidas?*
_- Se ainda tiver alguma dúvida ou reclamação, entre em contato pelo número pessoal_

*∆ THE MYSTIC - BOT - MD ∆*`;

const handler = async (m, {conn}) => {
  global.terminos = TERMOS_CONDICOES;
  m.reply(global.terminos);
};

handler.help = ['T&C'];
handler.tags = ['info'];
handler.command = /^(terminosycondicionesyprivacidad|terminosycondiciones|tyc|t&c)$/i;
export default handler;



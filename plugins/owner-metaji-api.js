import fetch from 'node-fetch';
import { getMetajiConfig } from '../src/libraries/metajiWebhook.js';

const handler = async (m, {conn, text, usedPrefix, command}) => {
  const config = getMetajiConfig(conn || global.conn);
  const [subcommand] = text.trim().split(/\s+/);
  const action = (subcommand || '').toLowerCase();

  if (!action) {
    return conn.sendMessage(m.chat, {text: `_*Configuração da API MetaJI*_

▢ *Comando:* ${usedPrefix + command} status
▢ *Descrição:* Mostra a configuração carregada do projeto.

▢ *Comando:* ${usedPrefix + command} test
▢ *Descrição:* Testa a autenticação usando a configuração do projeto.

▢ *Arquivo:* config.js
▢ *Chave global:* global.metajiApi

Exemplo:
global.metajiApi = {
  baseUrl: 'http://localhost:3333',
  ownerApiKey: 'mtj_live_sua_key_aqui',
  webhookToken: 'mtj_whk_seu_token_aqui',
}`}, {quoted: m});
  }

  if (action === 'status' || action === 'test') {
    if (!config.baseUrl) {
      throw 'Nenhuma URL da API foi configurada em `config.js`.';
    }

    if (!config.ownerApiKey) {
      throw 'Nenhuma API key do dono foi configurada em `config.js`.';
    }

    const response = await fetch(`${config.baseUrl}/bot-connect/owner/session`, {
      method: 'GET',
      headers: {
        'x-owner-api-key': config.ownerApiKey,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw data?.message || 'Falha ao autenticar com a API MetaJI.';
    }

    return m.reply(`_*Conexão MetaJI ativa*_

▢ *Owner:* ${data.owner?.name || '-'}
▢ *Email:* ${data.owner?.email || '-'}
▢ *Conectado:* ${data.connected ? 'Sim' : 'Não'}
▢ *Rota de conexão:* ${data.permissions?.canConnectBotRoutes ? 'Liberada' : 'Bloqueada'}
▢ *URL:* ${config.baseUrl}
▢ *Webhook token configurado:* ${config.webhookToken ? 'Sim' : 'Não'}
▢ *Origem da key:* ${config._source || 'config.js'}`);
  }

  throw `Subcomando inválido.\nUse: ${usedPrefix + command} status ou ${usedPrefix + command} test`;
};

handler.help = ['metajiapi'];
//handler.tags = ['owner'];
handler.command = /^(metajiapi|metajikey|metajiconnect)$/i;
//handler.rowner = true;
export default handler;

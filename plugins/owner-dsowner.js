/* Codigo hecho por @Fabri115 y mejorado por Group MetaJI */

import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs';
import path from 'path';

const handler = async (m, { conn, usedPrefix }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.sendMessage(m.chat, {text: '*[❗] Use este comando diretamente no número principal do Bot.*'}, {quoted: m});
  }
  await conn.sendMessage(m.chat, {text: '*[❗] Iniciando processo de eliminação de todos os arquivos de sessão, exceto o arquivo creds.json...*'}, {quoted: m});
  const sessionPath = './MysticSession/';
  try {
    if (!existsSync(sessionPath)) {
      return await conn.sendMessage(m.chat, {text: '*[❗] A pasta MysticSession não existe ou está vazia.*'}, {quoted: m});
    }
    const files = await fs.readdir(sessionPath);
    let filesDeleted = 0;
    for (const file of files) {
      if (file !== 'creds.json') {
        await fs.unlink(path.join(sessionPath, file));
        filesDeleted++;
      }
    }
    if (filesDeleted === 0) {
      await conn.sendMessage(m.chat, {text: '*[❗] Nenhum arquivo foi encontrado para remover na pasta MysticSession.*'}, {quoted: m});
    } else {
      await conn.sendMessage(m.chat, {text: `*[❗] Foram removidos ${filesDeleted} arquivos de sessão, exceto o arquivo creds.json.*`}, {quoted: m});
    }
  } catch (err) {
    console.error('Erro ao ler a pasta ou os arquivos de sessão:', err);
    await conn.sendMessage(m.chat, {text: '*[❗] Ocorreu um erro ao remover os arquivos de sessão.*'}, {quoted: m});
  }
  await conn.sendMessage(m.chat, {text: `*👋 Olá! Agora me vê?*\n\n*[❗] Se o Bot não responder aos comandos, faça um pequeno spam*\n\n*—◉ Exemplo:*\n${usedPrefix}s\n${usedPrefix}s\n${usedPrefix}s`}, {quoted: m});
};
handler.help = ['del_reg_in_session_owner'];
handler.tags = ['owner'];
handler.command = /^(del_reg_in_session_owner|dsowner|clearallsession)$/i;
handler.rowner = true
export default handler;

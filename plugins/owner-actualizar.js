import { execSync } from 'child_process';

const handler = async (m, { conn, text }) => {
  try {
          const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''));
          let messager = stdout.toString()
          if (messager.includes('Already up to date.')) messager = `_*< PROPRIETÁRIO - ATUALIZAÇÃO />*_\n\n*[ ✅ ] Não há atualizações pendentes.*`
          if (messager.includes('Updating')) messager = `_*< PROPRIETÁRIO - ATUALIZAR />*_\n\n*[ ℹ️ ] Atualização finalizada com sucesso.*\n\n` + stdout.toString()
          conn.reply(m.chat, messager, m);
  } catch {
 try {
      const status = execSync('git status --porcelain');
      if (status.length > 0) {
        const conflictedFiles = status
          .toString()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            if (line.includes('.npm/') || line.includes('.cache/') || line.includes('tmp/') || line.includes('MysticSession/') || line.includes('npm-debug.log')) {
              return null;
            }
            return '*→ ' + line.slice(3) + '*';
          })
          .filter(Boolean);
        if (conflictedFiles.length > 0) {
          const errorMessage = `_*< PROPRIETÁRIO - ATUALIZAR />*_\n\n*[ ℹ️ ] Foram feitas alterações locais em arquivos do bot que entram em conflito com as atualizações do repositório. Para atualizar, reinstale o bot ou realize as atualizações manualmente.*\n\n*Arquivos em conflito:*\n\n${conflictedFiles.join('\n')}.*`;
          await conn.reply(m.chat, errorMessage, m);
        }
      }
  } catch (error) {
    console.error(error);
    let errorMessage2 = `_*< PROPRIETÁRIO - ATUALIZAR />*_\n\n*[ ℹ️ ] Ocorreu um erro. Por favor, tente novamente mais tarde.*`;
    if (error.message) {
      errorMessage2 += '\n*- Mensagem de erro:* ' + error.message;
    }
    await conn.reply(m.chat, errorMessage2, m);
  }
 }
};
handler.help = ['update'];
handler.tags = ['owner'];
handler.command = /^(update|actualizar|gitpull)$/i;
handler.rowner = true;
export default handler;

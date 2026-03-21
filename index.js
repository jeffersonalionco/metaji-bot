import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { setupMaster, fork } from 'cluster';
import cfonts from 'cfonts';
import readline from 'readline';
import yargs from 'yargs';
import chalk from 'chalk'; 
import fs from 'fs'; 
import './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { say } = cfonts;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let isRunning = false;
let childProcess = null;
/** Timer do reinício completo do processo (master + worker). Ver METAJI_PROCESS_RESTART_MINUTES. */
let processFullRestartTimer = null;

const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

console.log(chalk.yellow.bold('—◉ㅤIniciando sistema...'));

function verificarOCrearCarpetaAuth() {
  const authPath = join(__dirname, global.authFile);
  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }
}

function verificarCredsJson() {
  const credsPath = join(__dirname, global.authFile, 'creds.json');
  return fs.existsSync(credsPath);
}

function formatearNumeroTelefono(numero) {
  let formattedNumber = numero.replace(/[^\d+]/g, '');
  if (formattedNumber.startsWith('+52') && !formattedNumber.startsWith('+521')) {
    formattedNumber = formattedNumber.replace('+52', '+521');
  } else if (formattedNumber.startsWith('52') && !formattedNumber.startsWith('521')) {
    formattedNumber = `+521${formattedNumber.slice(2)}`;
  } else if (formattedNumber.startsWith('52') && formattedNumber.length >= 12) {
    formattedNumber = `+${formattedNumber}`;
  } else if (!formattedNumber.startsWith('+')) {
    formattedNumber = `+${formattedNumber}`;
  }
  return formattedNumber;
}

function esNumeroValido(numeroTelefono) {
  const regex = /^\+\d{7,15}$/;
  return regex.test(numeroTelefono);
}

async function start(file) {
  if (isRunning) return;
  isRunning = true;

  say('MetaJI\nBot', {
    font: 'chrome',
    align: 'center',
    gradient: ['blue', 'magenta'],
  });

  say(`Bot recriado por Group MetaJI`, {
    font: 'console',
    align: 'center',
    gradient: ['blue', 'magenta'],
  });

  verificarOCrearCarpetaAuth();

  // Se o multiSession estiver habilitado, pula o fluxo interativo (QR/código)
  // e delega toda a gestão de sessões para o multiSessionManager (servidor na porta 3456).
  if (global.multiSession?.enabled) {
    const args = [join(__dirname, file), ...process.argv.slice(2)];
    setupMaster({ exec: args[0], args: args.slice(1) });
    forkProcess(file);
    return;
  }

  if (verificarCredsJson()) {
    const args = [join(__dirname, file), ...process.argv.slice(2)];
    setupMaster({ exec: args[0], args: args.slice(1) });
    forkProcess(file);
    return;
  }

  const opcion = await question(
    chalk.yellowBright.bold('—◉ㅤSelecione uma opção (apenas o número):\n') +
      chalk.white.bold('1. Com código QR\n2. Com código de texto de 8 dígitos\n—> '),
  );

  if (opcion === '2') {
    const phoneNumber = await question(
      chalk.yellowBright.bold('\n—◉ㅤDigite seu número de WhatsApp:\n') +
        chalk.white.bold('◉ㅤExemplo: +5511999999999\n—> '),
    );
    const numeroTelefono = formatearNumeroTelefono(phoneNumber);
    
    if (!esNumeroValido(numeroTelefono)) {
      console.log(
        chalk.bgRed(
          chalk.white.bold(
            '[ ERRO ] Número inválido. Verifique se você escreveu o número no formato internacional e começou com o código do país.\n—◉ㅤExemplo:\n◉ +5511999999999\n',
          ),
        ),
      );
      process.exit(0);
    }
    
    process.argv.push('--phone=' + numeroTelefono);
    process.argv.push('--method=code');
  } else if (opcion === '1') {
    process.argv.push('--method=qr');
  }
  
  const args = [join(__dirname, file), ...process.argv.slice(2)];
  setupMaster({ exec: args[0], args: args.slice(1) });
  forkProcess(file);
}

/**
 * Reinício completo do Node (recomendado em produção com PM2 ou systemd com Restart=always).
 * Encerra o master; o gerenciador de processos sobe o bot de novo do zero.
 *
 * METAJI_PROCESS_RESTART_MINUTES — minutos até encerrar (padrão: 0 = desligado).
 * Use 60 para 1 hora. Saída com código 1 para o PM2 reiniciar (autorestart).
 */
function scheduleFullProcessRestart() {
  if (processFullRestartTimer) {
    clearTimeout(processFullRestartTimer);
    processFullRestartTimer = null;
  }
  const raw = process.env.METAJI_PROCESS_RESTART_MINUTES;
  const minutes = raw === undefined || raw === '' ? 0 : Number(raw);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return;
  }
  const ms = Math.round(minutes * 60 * 1000);
  if (process.env.pm_id === undefined && process.env.INVOCATION_ID === undefined) {
    console.warn(
      chalk.red.bold(
        '[!] METAJI_PROCESS_RESTART_MINUTES: sem PM2/systemd o processo não volta sozinho após o reinício. Use: pm2 start ecosystem.config.cjs',
      ),
    );
  }
  console.log(
    chalk.cyan.bold(
      `—◉ㅤReinício completo do processo agendado: ${minutes} min (variável METAJI_PROCESS_RESTART_MINUTES). Use PM2 (autorestart) ou systemd (Restart=always).`,
    ),
  );
  processFullRestartTimer = setTimeout(() => {
    processFullRestartTimer = null;
    console.log(
      chalk.yellow.bold(
        '—◉ㅤEncerrando processo Node para reinício automático (estado limpo).',
      ),
    );
    process.exit(1);
  }, ms);
}

function forkProcess(file) {
  childProcess = fork();
  scheduleFullProcessRestart();

  childProcess.on('message', (data) => {
    console.log(chalk.green.bold('—◉ㅤRECEBIDO:'), data);
    switch (data) {
      case 'reset':
        console.log(chalk.yellow.bold('—◉ㅤPedido de reinício recebido...'));
        childProcess.removeAllListeners();
        childProcess.kill('SIGTERM');
        isRunning = false;
        setTimeout(() => start(file), 1000);
        break;
      case 'uptime':
        childProcess.send(process.uptime());
        break;
    }
  });

  childProcess.on('exit', (code, signal) => {
    console.log(chalk.yellow.bold(`—◉ㅤProcesso secundário encerrado (${code || signal})`));
    isRunning = false;
    childProcess = null;
    
    if (code !== 0 || signal === 'SIGTERM') {
      console.log(chalk.yellow.bold('—◉ㅤReiniciando processo...'));
      setTimeout(() => start(file), 1000);
    }
  });

  const opts = yargs(process.argv.slice(2)).argv;
  if (!opts.test) {
    rl.on('line', (line) => {
      childProcess.emit('message', line.trim());
    });
  }
}

try {
  start('main.js');
} catch (error) {
  console.error(chalk.red.bold('[ ERROR CRÍTICO ]:'), error);
  process.exit(1);
}

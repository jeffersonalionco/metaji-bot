/**
 * PM2 — exemplo de produção
 *
 *   pm2 start ecosystem.config.cjs
 *   pm2 save && pm2 startup
 *
 * Reinício completo do processo Node:
 * - Opção A (recomendada): no .env use METAJI_PROCESS_RESTART_MINUTES=60 e mantenha autorestart.
 * - Opção B: descomente `cron_restart` abaixo e use METAJI_PROCESS_RESTART_MINUTES=0 para não duplicar.
 */
module.exports = {
  apps: [
    {
      name: 'servidor1',
      cwd: __dirname,
      script: 'index.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 80,
      min_uptime: '15s',
      restart_delay: 3000,
      // Reinício por relógio (todo início de hora). Timezone = do servidor.
      // cron_restart: '0 * * * *',
    },
  ],
};

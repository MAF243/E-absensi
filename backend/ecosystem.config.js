module.exports = {
  apps: [
    {
      name: 'e-absensi-api',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'e-absensi-backup',
      script: 'scripts/backup.js',
      instances: 1,
      autorestart: false,
      watch: false,
      cron_restart: '0 2 * * *',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'e-absensi-watchdog',
      script: 'scripts/watchdog.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

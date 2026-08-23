const http = require('http');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'watchdog_alerts.log');
const TARGET_URL = 'http://localhost:5000/api/health';
const INTERVAL_MS = 60000; // 1 minute

let consecutiveFailures = 0;
const FAILURE_THRESHOLD = 3;

function logAlert(message) {
  const timestamp = new Date().toISOString();
  const alertMsg = `[ALERT] ${timestamp} - ${message}\n`;
  console.error(alertMsg);
  fs.appendFileSync(LOG_FILE, alertMsg);
}

function checkHealth() {
  const req = http.get(TARGET_URL, (res) => {
    if (res.statusCode === 200) {
      if (consecutiveFailures >= FAILURE_THRESHOLD) {
        logAlert('Service RECOVERED! Health endpoint is returning 200 OK.');
      }
      consecutiveFailures = 0;
      console.log(`[OK] Health check passed at ${new Date().toISOString()}`);
    } else {
      handleFailure(`Received HTTP ${res.statusCode}`);
    }
  });

  req.on('error', (e) => {
    handleFailure(`Connection error: ${e.message}`);
  });
  
  req.setTimeout(5000, () => {
    req.destroy();
    handleFailure('Request timeout (5000ms)');
  });
}

function handleFailure(reason) {
  consecutiveFailures++;
  console.warn(`[WARN] Health check failed (${consecutiveFailures}/${FAILURE_THRESHOLD}). Reason: ${reason}`);
  
  if (consecutiveFailures === FAILURE_THRESHOLD) {
    logAlert(`CRITICAL OUTAGE DETECTED! Health check failed ${FAILURE_THRESHOLD} consecutive times. Reason: ${reason}`);
  }
}

console.log('Watchdog service started...');
checkHealth();
setInterval(checkHealth, INTERVAL_MS);

// scripts/webhook.get.js
const api = require('./src/api');

(async function run() {
  try {
    const webhooks = await api.getWebhooks();
    console.log('Existing webhooks:', webhooks);
  } catch (err) {
    console.error('Error listing webhooks:', err.message);
  }
})();

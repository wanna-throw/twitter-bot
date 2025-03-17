// scripts/webhook.delete.js
const api = require('./src/api');

(async function run() {
  try {
    const webhooks = await api.getWebhooks();
    if (!webhooks.length) {
      console.log('No existing webhooks to delete.');
      return;
    }
    // We’ll just delete the first webhook for demonstration
    const webhookId = webhooks[0].id;
    await api.deleteWebhook(webhookId);
    console.log('Deleted webhook with ID:', webhookId);
  } catch (err) {
    console.error('Error deleting webhook:', err.message);
  }
})();

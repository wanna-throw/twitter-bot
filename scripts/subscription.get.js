// scripts/src/subscription.get.js
const api = require('./api');

(async function run() {
  try {
    const subscription = await api.getSubscription();
    console.log('Subscription info:', subscription);
  } catch (err) {
    console.error('Error getting subscription:', err.message);
  }
})();

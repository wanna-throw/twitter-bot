// scripts/subscription.delete.js
const api = require('./src/api');
require('dotenv').config();

(async function run() {
  try {
    // For the user ID, parse from the access token: "<userId>-<randomstring>"
    const userId = process.env.TWITTER_ACCESS_TOKEN.split('-')[0];
    await api.deleteSubscription(userId);
    console.log('Deleted subscription for user:', userId);
  } catch (err) {
    console.error('Error deleting subscription:', err.message);
  }
})();

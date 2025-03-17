// scripts/subscription.post.js
const request = require('request-promise');
require('dotenv').config();

(async function run() {
  try {
    const envName = process.env.TWITTER_WEBHOOK_ENV; // e.g. "development"
    const oauth = {
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      token: process.env.TWITTER_ACCESS_TOKEN,
      token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    };

    await request.post({
      url: `https://api.twitter.com/1.1/account_activity/all/${envName}/subscriptions.json`,
      oauth,
      json: true
    });
    console.log('Successfully subscribed!');
  } catch (err) {
    console.error('Subscription error:', err.message);
  }
})();

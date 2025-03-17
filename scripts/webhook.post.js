// scripts/webhook.post.js
const request = require('request-promise');
require('dotenv').config();

(async function run() {
  try {
    const envName = process.env.TWITTER_WEBHOOK_ENV;     // e.g. "development"
    const webhookUrl = process.env.WEBHOOK_URL;          // e.g. "https://abc123.ngrok.io/webhook"
    const oauth = {
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      token: process.env.TWITTER_ACCESS_TOKEN,
      token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    };

    const response = await request.post({
      url: `https://api.twitter.com/1.1/account_activity/all/${envName}/webhooks.json`,
      oauth,
      form: { url: webhookUrl },
      json: true
    });
    console.log('Webhook created:', response);
  } catch (err) {
    console.error('Error creating webhook:', err.message);
  }
})();

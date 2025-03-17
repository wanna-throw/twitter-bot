// scripts/src/api.js
require("dotenv").config();
const request = require("request-promise");

const {
  TWITTER_API_URL,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET,
  TWITTER_BEARER_TOKEN,
  TWITTER_WEBHOOK_ENV
} = process.env;

// OAuth1 credentials (app + user context)
const oauth = {
  consumer_key: TWITTER_CONSUMER_KEY,
  consumer_secret: TWITTER_CONSUMER_SECRET,
  token: TWITTER_ACCESS_TOKEN,
  token_secret: TWITTER_ACCESS_TOKEN_SECRET
};

// Header-based Bearer token approach
const authorizationHeaders = {
  authorization: `Bearer ${TWITTER_BEARER_TOKEN}`
};

// ----- OPTIONAL: If you need to programmatically retrieve your Bearer Token -----
exports.getBearerToken = function() {
  return request.post({
    url: 'https://api.twitter.com/oauth2/token?grant_type=client_credentials',
    auth: {
      user: TWITTER_CONSUMER_KEY,
      pass: TWITTER_CONSUMER_SECRET
    },
    json: true
  });
};

// ----------------- WEBHOOKS -----------------
exports.getWebhooks = function() {
  return request.get({
    url: `${TWITTER_API_URL}/account_activity/all/${TWITTER_WEBHOOK_ENV}/webhooks.json`,
    headers: authorizationHeaders,
    json: true
  });
};

exports.createWebhook = function(webhookUrl) {
  return request.post({
    url: `${TWITTER_API_URL}/account_activity/all/${TWITTER_WEBHOOK_ENV}/webhooks.json`,
    oauth,
    form: { url: webhookUrl },
    json: true
  });
};

exports.deleteWebhook = function(webhookId) {
  return request.delete({
    url: `${TWITTER_API_URL}/account_activity/all/${TWITTER_WEBHOOK_ENV}/webhooks/${webhookId}.json`,
    oauth,
    json: true
  });
};

// ----------------- SUBSCRIPTIONS -----------------
exports.getSubscription = function() {
  return request.get({
    url: `${TWITTER_API_URL}/account_activity/all/${TWITTER_WEBHOOK_ENV}/subscriptions.json`,
    oauth,
    json: true
  });
};

exports.createSubscription = function() {
  return request.post({
    url: `${TWITTER_API_URL}/account_activity/all/${TWITTER_WEBHOOK_ENV}/subscriptions.json`,
    oauth,
    json: true
  });
};

exports.deleteSubscription = function(userId) {
  return request.delete({
    url: `${TWITTER_API_URL}/account_activity/all/${TWITTER_WEBHOOK_ENV}/subscriptions/${userId}.json`,
    headers: authorizationHeaders,
    json: true
  });
};

// scripts/bearerToken.js
const api = require('./src/api');
require('dotenv').config();

(async function run() {
  try {
    const response = await api.getBearerToken();
    console.log('Bearer token response:', response);
  } catch (err) {
    console.error('Error fetching bearer token:', err.message);
  }
})();

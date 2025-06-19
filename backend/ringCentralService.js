// backend/ringCentralService.js
require('dotenv').config();
const RingCentral = require('@ringcentral/sdk').SDK;

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL, // e.g., 'https://platform.ringcentral.com'
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});

async function authenticate() {
  try {
    await rc.platform().login({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION, // if applicable
      password: process.env.RINGCENTRAL_PASSWORD,
    });
  } catch (error) {
    console.error('RingCentral authentication error:', error);
    throw error;
  }
}

module.exports = { rc, authenticate };

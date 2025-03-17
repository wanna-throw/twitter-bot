// src/index.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const request = require("request-promise");  // or axios
const { getTokenData } = require("./dexScreenerApi");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(bodyParser.json());

/**
 * 1) GET /webhook - Twitter CRC Check
 *    Twitter hits this endpoint with ?crc_token=...
 *    We must respond with { response_token: 'sha256=...' }
 */
app.get("/webhook", (req, res) => {
  console.log("Received GET /webhook from Twitter (CRC check).");
  
  const crcToken = req.query.crc_token;
  if (!crcToken) {
    return res.status(400).send("Error: crc_token missing from request.");
  }

  // HMAC using consumer secret + the crcToken
  const hmac = crypto
    .createHmac("sha256", process.env.TWITTER_CONSUMER_SECRET)
    .update(crcToken)
    .digest("base64");

  const responseToken = `sha256=${hmac}`;
  return res.status(200).json({ response_token: responseToken });
});

/**
 * 2) POST /webhook - Receives mention events, DMs, etc.
 */
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;
    console.log("POST /webhook event:", JSON.stringify(body, null, 2));

    // Mentions appear in "tweet_create_events"
    if (!body.tweet_create_events) {
      // Not relevant, respond 200 to stop retries
      return res.sendStatus(200);
    }

    for (const event of body.tweet_create_events) {
      const tweetText = event.text;
      const tweetId = event.id_str;
      const screenName = event.user.screen_name;
      const botScreenName = process.env.BOT_SCREEN_NAME || "botanalysis";

      // Avoid responding to our own tweets
      if (screenName.toLowerCase() === botScreenName.toLowerCase()) {
        console.log("Ignoring event from the bot itself.");
        continue;
      }

      // Look for: "@botanalysis share data of <token>"
      const regex = new RegExp(`@${botScreenName}\\s+share\\s+data\\s+of\\s+(\\S+)`, "i");
      const match = tweetText.match(regex);
      if (!match) {
        console.log("Does not match mention pattern, ignoring.");
        continue;
      }

      // Extract token name
      const tokenName = match[1].toLowerCase();
      console.log(`User @${screenName} asked for data of: ${tokenName}`);

      // Fetch DexScreener data
      const data = await getTokenData(tokenName);

      let replyMessage;
      if (data) {
        replyMessage = [
          `@${screenName}`,
          `Token: $${tokenName}`,
          `Price (USD): ${data.price}`,
          `24h% Change: ${data.priceChange24h}%`,
          `Market Cap (FDV): ${data.mcap}`,
          `Liquidity: ${data.liquidity}`,
          `Estimated Tx Fees: ${data.txFees}`,
          `Dex Version: ${data.dexVersion}`
        ].join("\n");
      } else {
        replyMessage = `@${screenName} No data found for: ${tokenName}`;
      }

      // Post the reply tweet
      const oauth = {
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        token: process.env.TWITTER_ACCESS_TOKEN,
        token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
      };

      try {
        await request.post({
          url: "https://api.twitter.com/1.1/statuses/update.json",
          oauth,
          form: {
            status: replyMessage,
            in_reply_to_status_id: tweetId,
            auto_populate_reply_metadata: true
          },
          json: true
        });
        console.log(`Replied to @${screenName} about ${tokenName}`);
      } catch (err) {
        console.error("Error sending tweet reply:", err.message);
      }
    }

    // Always 200 after processing
    res.sendStatus(200);
  } catch (err) {
    console.error("Error in POST /webhook:", err);
    res.sendStatus(500);
  }
});

/**
 * Catch-all for other methods on /webhook
 */
app.all("/webhook", (req, res) => {
  console.log(`[${req.method}] /webhook -> 200 OK`);
  res.status(200).send("OK /webhook");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

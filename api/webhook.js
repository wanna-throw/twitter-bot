// api/webhook.js

const crypto = require('crypto');
const request = require('request-promise');

// Utility to generate the CRC response token.
function createCrcResponseToken(crcToken) {
  const hmac = crypto
    .createHmac('sha256', process.env.TWITTER_CONSUMER_SECRET)
    .update(crcToken)
    .digest('base64');
  return `sha256=${hmac}`;
}

// Helper to reply to a mention by posting a tweet.
async function replyToMention(eventBody) {
  // Parse out the mention event details
  // For mention events, Twitter sends data in "tweet_create_events"
  // if someone mentions your bot’s handle.

  const tweetEvents = eventBody.tweet_create_events;
  if (!tweetEvents) {
    return;
  }

  for (let tweetEvent of tweetEvents) {
    const tweetText = tweetEvent.text;
    const tweetId = tweetEvent.id_str;
    const userScreenName = tweetEvent.user.screen_name;
    const botScreenName = process.env.BOT_SCREEN_NAME; 
    // e.g. "GimmeDadJoke" without '@'
    
    // Make sure the event is actually a mention (and not the bot tweeting to itself, etc.)
    // The simplest check: tweetText includes your handle, and the user is not your bot.
    if (
      tweetText.toLowerCase().includes(`@${botScreenName.toLowerCase()}`) &&
      userScreenName.toLowerCase() !== botScreenName.toLowerCase()
    ) {
      // Construct a reply: for example, just say "Hello @user!"
      const replyText = `Hello @${userScreenName}, thanks for the mention!`;

      // Make an OAuth 1.0 signed POST request to Twitter to post a reply
      // (tweet with in_reply_to_status_id set to original tweet).
      const oauth = {
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        token: process.env.TWITTER_ACCESS_TOKEN,
        token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
      };

      // Endpoint for posting a new tweet
      const url = 'https://api.twitter.com/1.1/statuses/update.json';

      try {
        await request.post({
          url,
          oauth,
          form: {
            status: replyText,
            in_reply_to_status_id: tweetId,
            auto_populate_reply_metadata: true
          },
          json: true
        });
        console.log(`Replied to mention from @${userScreenName}`);
      } catch (err) {
        console.error('Error sending reply tweet:', err.message);
      }
    }
  }
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      // CRC challenge
      const crcToken = req.query.crc_token;
      if (crcToken) {
        const responseToken = createCrcResponseToken(crcToken);
        return res.status(200).json({ response_token: responseToken });
      } else {
        return res.status(400).json({
          message: 'Error: crc_token missing from request.'
        });
      }
    } else if (req.method === 'POST') {
      // Handle actual incoming events
      const body = req.body;
      console.log('Received event:', body);

      // If there’s a mention, handle it
      await replyToMention(body);

      // Always respond with 200 to let Twitter know we received the event
      return res.status(200).send();
    } else {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).send('Internal Server Error');
  }
};

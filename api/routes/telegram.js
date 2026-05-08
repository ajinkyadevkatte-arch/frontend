const express = require('express');
const router = express.Router();
const TelegramBot = require('node-telegram-bot-api');

// Initialize bot with a placeholder token. In production, use process.env.TELEGRAM_BOT_TOKEN
const token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
// Use polling only if token is valid
let bot;
if (token !== 'YOUR_TELEGRAM_BOT_TOKEN') {
  bot = new TelegramBot(token, { polling: false });
}

// Send message to investor
router.post('/send', async (req, res) => {
  const { telegramUserId, messageType, customMessage } = req.body;
  
  if (!bot) {
    return res.status(500).json({ message: 'Telegram bot not configured' });
  }

  let messageText = customMessage;

  if (!customMessage) {
    switch (messageType) {
      case 'reminder':
        messageText = `Hello Investor,\nYour premium membership is going to expire soon.\nRenew now to continue receiving premium trading signals and market updates.`;
        break;
      case 'renewal_offer':
        messageText = `Special Renewal Offer:\nRenew today and get an extra 10% discount + bonus support.\nContact us now.`;
        break;
      case 'festival_offer':
        messageText = `🎉 Special Festival Offer! 🎉\nRenew today and get extra bonus support and premium signals.\n\nContact us now to claim.`;
        break;
      case 'payment_confirmation':
        messageText = `Payment Confirmed! ✅\nThank you for your payment. Your premium membership has been successfully updated.`;
        break;
      default:
        messageText = 'Hello from Investor Membership CRM.';
    }
  }

  try {
    await bot.sendMessage(telegramUserId, messageText);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const TelegramBot = require('node-telegram-bot-api');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BOT_TOKEN = '8327659219:AAGmzqRGd0jjRxvd1zQXjba5IZUMSH1JPZI'; // replace with your BotFather token
const BACKEND_URL = 'https://telegram-backend-production-09d7.up.railway.app/create-checkout';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    // Call your backend to get the Stripe checkout link
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegram_id: chatId })
    });
    const data = await response.json();

    // Send a message with an inline button only
    bot.sendMessage(chatId, "Click here ⬇️", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Subscribe", // button text
              url: data.url      // Stripe checkout link
            }
          ]
        ]
      }
    });

  } catch (err) {
    bot.sendMessage(chatId, "Error generating payment link.");
    console.error(err);
  }
});


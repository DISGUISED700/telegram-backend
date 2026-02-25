const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = '8327659219:AAGmzqRGd0jjRxvd1zQXjba5IZUMSH1JPZI'; // replace with your BotFather token
const BACKEND_URL = 'http://localhost:3000/create-checkout'; // local backend

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/subscribe/, async (msg) => {
  const telegram_id = msg.from.id;

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id })
    });
    const data = await response.json();
    bot.sendMessage(telegram_id, `Click here to subscribe: ${data.url}`);
  } catch (err) {
    bot.sendMessage(telegram_id, 'Error generating payment link.');
    console.error(err);
  }
});

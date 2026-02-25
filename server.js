require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

app.post('/create-checkout', async (req, res) => {
  const { telegram_id } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: 'price_1T4T81H4ofBcEnOZAm9bCnt5', quantity: 1 }],
      success_url: `https://example.com/success?telegram_id=${telegram_id}`,
      cancel_url: `https://example.com/cancel`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stripe session failed' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

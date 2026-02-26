require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const paidUsers = {}; // { telegram_id: true }

console.log("Stripe key:", process.env.STRIPE_SECRET_KEY ? "FOUND" : "MISSING");

// Middleware to parse JSON bodies
app.use(express.json());

// --------------------
// Create Stripe Checkout Session
// --------------------
app.post('/create-checkout', async (req, res) => {
  const { telegram_id } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: 'price_1T4SutQfw8utOxzB064sibo2', quantity: 1 }],
      success_url: `https://example.com/success?telegram_id=${telegram_id}`,
      cancel_url: `https://example.com/cancel`,
      metadata: { telegram_id } // store telegram_id in Stripe metadata
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stripe session failed' });
  }
});

// --------------------
// Stripe Webhook Endpoint
// --------------------
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const telegram_id = session.metadata.telegram_id;
    paidUsers[telegram_id] = true;
    console.log(`Payment recorded for Telegram ID: ${telegram_id}`);
  }

  res.json({ received: true });
});

// --------------------
// Endpoint to check payment (for /join command)
// --------------------
app.post('/check-payment', (req, res) => {
  const { telegram_id } = req.body;
  const isPaid = !!paidUsers[telegram_id];
  res.json({ paid: isPaid });
});

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

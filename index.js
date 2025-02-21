const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const morgan = require('morgan');
const cors = require('cors');

const stripe = Stripe('sk_test_51QuDf4H44ZYSFgufQkBKK9CuKSIjxcj40PTHqlxwnzdwJ1xGZF0ip1pBQiLZF5PfDJuUYnP6Ffqr6aAJxXwSEGjO00kwyPziWA');

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Explicit CORS Handling
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allow any frontend (For testing)
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200); // Handle preflight requests
    }
    
    next();
});

// Stripe Checkout Session Endpoint
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { productName, amount } = req.body;

        if (!productName || !amount) {
            return res.status(400).json({ error: 'Product name and amount are required' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: productName },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://yourwebsite.com/success',
            cancel_url: 'https://yourwebsite.com/cancel',
        });

        res.json({ sessionId: session.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Set port dynamically for Vercel
const port = process.env.PORT || 3000;

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app; // Required for Vercel deployment

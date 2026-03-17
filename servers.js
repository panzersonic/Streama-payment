const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔐 YOUR KEYS (PUT NEW ONES HERE)
const Consumer Key: DLWSO6v8jE4BVkgyoJ0GvSTUdLq73uaHIg1eonst Consumer Secret: 2MCJff3OmTXwX6j+uaHIg1e+GY4=.

// 🌐 YOUR DOMAIN
const CALLBACK_URL = "https://streama-media-hub.base44.app/payment-success";
const IPN_URL = "https://streama-payment.onrender.com/ipn";

// 🔑 GET TOKEN
async function getToken() {
  const response = await axios.get(
    "https://pay.pesapal.com/v3/api/Auth/RequestToken",
    {
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
    }
  );
  return response.data.token;
}

// 🔔 REGISTER IPN
async function registerIPN(token) {
  const res = await axios.post(
    "https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN",
    {
      url: IPN_URL,
      ipn_notification_type: "POST",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.ipn_id;
}

// 💳 PAYMENT ROUTE
app.post("/pay", async (req, res) => {
  try {
    const { plan } = req.body;

    const plans = {
      daily: 2000,
      weekly: 5000,
      monthly: 15000,
      three_months: 25000,
      yearly: 80000,
    };

    const amount = plans[plan];

    if (!amount) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const token = await getToken();
    const ipn_id = await registerIPN(token);

    const response = await axios.post(
      "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest",
      {
        id: "ORDER_" + Date.now(),
        currency: "UGX",
        amount: amount,
        description: `Streama ${plan} subscription`,
        callback_url: CALLBACK_URL,
        notification_id: ipn_id,
        billing_address: {
          email_address: "user@test.com",
          phone_number: "256700000000",
          country_code: "UG",
          first_name: "Streama",
          last_name: "User",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json(error.response?.data || error.message);
  }
});

// 🔔 IPN LISTENER
app.post("/ipn", (req, res) => {
  console.log("Payment Notification:", req.body);
  res.sendStatus(200);
});

// 🧪 TEST ROUTE
app.get("/", (req, res) => {
  res.send("Streama Payment Backend is Running 🚀");
});

app.listen(10000, () => console.log("Server running on port 10000"));

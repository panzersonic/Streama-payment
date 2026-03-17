const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const Consumer Key: DLWSO6v8jE4BVkgyoJ0GvSTUdLq73jBW 
 const Consumer Secret: 2MCJff3OmTXwX6j+uaHIg1e+GY4=.

async function getToken() {
  const res = await axios.get(
    "https://pay.pesapal.com/v3/api/Auth/RequestToken",
    {
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
    }
  );
  return res.data.token;
}

app.post("/pay", async (req, res) => {
  try {
    const token = await getToken();

    const response = await axios.post(
      "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest",
      {
        id: "ORDER_" + Date.now(),
        currency: "UGX",
        amount: req.body.amount,
        description: "Streama Subscription",
        callback_url: "https://streama-media-hub.base44.app/payment-success",
        notification_id: "YOUR_IPN_ID",
        billing_address: {
          email_address: "test@gmail.com",
          phone_number: "256700000000",
          country_code: "UG",
          first_name: "User",
          last_name: "Test",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || err.message);
  }
});

app.listen(10000, () => console.log("Server running"));

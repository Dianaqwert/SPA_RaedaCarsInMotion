const express = require('express');
const router = express.Router();
const axios = require('axios');
const paypalConfig = require('./paypal-config');

let accessToken = null;
let tokenExpiry = null;

// Function to get OAuth 2.0 access token from PayPal
async function getAccessToken() {
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    return accessToken;
  }

  const auth = Buffer.from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`).toString('base64');
  try {
    const response = await axios({
      method: 'post',
      url: `${paypalConfig.baseUrl}/v1/oauth2/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      data: 'grant_type=client_credentials'
    });

    accessToken = response.data.access_token;
    // Set token expiry 5 minutes before actual expiry to be safe
    tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000);
    return accessToken;
  } catch (error) {
    console.error('Error getting PayPal access token:', error.response?.data || error.message);
    throw error;
  }
}

// Endpoint to create order
router.post('/create-order', async (req, res) => {
  try {
    const token = await getAccessToken();
    const orderData = req.body;

    const response = await axios({
      method: 'post',
      url: `${paypalConfig.baseUrl}/v2/checkout/orders`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: orderData
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error creating PayPal order:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

// Endpoint to capture order
router.post('/capture-order/:orderId', async (req, res) => {
  try {
    const token = await getAccessToken();
    const orderId = req.params.orderId;

    const response = await axios({
      method: 'post',
      url: `${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}/capture`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error capturing PayPal order:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

module.exports = router;

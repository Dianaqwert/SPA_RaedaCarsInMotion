/**
 * Node.js backend API example using Express and Nodemailer to send emails.
 * This API accepts JSON POST requests with email details and sends an email.
 * 
 * Instructions:
 * 1. Install dependencies: npm install express nodemailer cors body-parser
 * 2. Run the server: node backend/email-api.js
 * 3. Use the API endpoint in your Angular app to send emails.
 * 
 * Note: For beeceptor.com, you can create a mock endpoint to test the API calls.
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Configure your email transporter (use your email service credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Replace with your email
    pass: 'your-email-password'   // Replace with your email password or app password
  }
});

// POST /send-email endpoint to receive email data and send email
app.post('/send-email', (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, text' });
  }

  const mailOptions = {
    from: 'your-email@gmail.com', // Replace with your email
    to,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
    console.log('Email sent:', info.response);
    res.json({ message: 'Email sent successfully' });
  });
});

app.listen(port, () => {
  console.log(`Email API server running at http://localhost:${port}`);
});

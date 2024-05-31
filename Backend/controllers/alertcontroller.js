import nodemailer from 'nodemailer';
import Alert from '../models/Alert.js';
import { getCryptoPrice } from '../service/priceService.js';

const createAlert = async (req, res) => {
  try {
    const { email, cryptoSymbol, targetPrice } = req.body;

    const newAlert = new Alert({
      email,
      cryptoSymbol,
      targetPrice,
    });

    await newAlert.save();
    res.status(201).send({ message: 'Alert created successfully' });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

const sendAlertEmail = async (email, cryptoSymbol, currentPrice) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Price Alert for ${cryptoSymbol}`,
      text: `The price of ${cryptoSymbol} has reached $${currentPrice}.`,
      
    };
    console.log("mail sent")

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending alert email:', error);
  }
};

const checkAlerts = async () => {
  try {
    const alerts = await Alert.find({ triggered: false });

    for (const alert of alerts) {
      const currentPrice = await getCryptoPrice(alert.cryptoSymbol);

      // Check if current price crosses the target price
      if (currentPrice >= alert.targetPrice) {
        await sendAlertEmail(alert.email, alert.cryptoSymbol, currentPrice);
        alert.triggered = true;
        await alert.save();
      }
    }
  } catch (error) {
    console.error('Error checking alerts:', error);
  }
};

export { createAlert, checkAlerts };

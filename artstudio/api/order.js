const { randomUUID } = require('crypto');
const nodemailer = require('nodemailer');

const prices = {
  A4: 10,
  A3: 15,
  A2: 26,
  A1: 40,
  A0: 60
};

const json = (res, status, body) => {
  res.status(status).json(body);
};

const cleanText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { success: false, message: 'POST requests only.' });
  }

  let payload = req.body || {};
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (error) {
      payload = {};
    }
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    ORDER_EMAIL,
    ORDER_FROM_EMAIL
  } = process.env;

  const configuredRecipient = ORDER_EMAIL || 'brooklynwangson@gmail.com';
  const configuredSender = ORDER_FROM_EMAIL || 'brooklynwangson@gmail.com';

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return json(res, 500, {
      success: false,
      message: 'SMTP email service is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and ORDER_EMAIL in the environment.'
    });
  }

  const name = cleanText(payload.name, 120);
  const email = cleanText(payload.email, 254);
  const address = cleanText(payload.address, 500);
  const note = cleanText(payload.note, 1000);
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (!name || !address || !/^\S+@\S+\.\S+$/.test(email) || items.length === 0 || items.length > 50) {
    return json(res, 422, { success: false, message: 'Please provide valid customer details and at least one poster.' });
  }

  const orderLines = [];
  let total = 0;

  for (const item of items) {
    const title = cleanText(item.title, 160) || 'Poster';
    const size = cleanText(item.size, 2).toUpperCase();
    const quantity = Number(item.quantity);

    if (!prices[size] || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return json(res, 422, { success: false, message: 'One or more cart items are invalid.' });
    }

    const lineTotal = prices[size] * quantity;
    total += lineTotal;
    orderLines.push(`${title} | ${size} | Qty ${quantity} | $${lineTotal.toFixed(2)}`);
  }

  const orderNumber = `TB-${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  const text = [
    'New poster order',
    '',
    `Order: ${orderNumber}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Shipping address: ${address}`,
    '',
    'Items:',
    ...orderLines.map(line => `- ${line}`),
    '',
    `Total: $${total.toFixed(2)}`,
    note ? `\nCustomer note:\n${note}` : ''
  ].join('\n');

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: configuredSender,
      to: configuredRecipient,
      replyTo: email,
      subject: `New TopBoy Editions order ${orderNumber}`,
      text
    });
  } catch (error) {
    console.error('Order email send failed:', error);
    return json(res, 502, {
      success: false,
      message: 'The order could not be emailed. Please check the SMTP configuration and try again.'
    });
  }

  return json(res, 200, { success: true, orderNumber });
}

const { randomUUID } = require('crypto');

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

  const { RESEND_API_KEY, ORDER_EMAIL, ORDER_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !ORDER_EMAIL || !ORDER_FROM_EMAIL) {
    return json(res, 500, { success: false, message: 'Order email service is not configured.' });
  }

  const payload = req.body || {};
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

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: ORDER_FROM_EMAIL,
      to: [ORDER_EMAIL],
      reply_to: email,
      subject: `New TopBoy Editions order ${orderNumber}`,
      text
    })
  });

  if (!resendResponse.ok) {
    return json(res, 502, { success: false, message: 'The order could not be emailed. Please try again.' });
  }

  return json(res, 200, { success: true, orderNumber });
}

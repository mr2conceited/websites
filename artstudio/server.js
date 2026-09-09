const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const nodemailer = require('nodemailer');

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = __dirname;

const prices = {
  A4: 10,
  A3: 15,
  A2: 26,
  A1: 40,
  A0: 60
};

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
};

const cleanText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);

const parseBody = (req) => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', chunk => {
    raw += chunk;
    if (raw.length > 1_000_000) {
      req.destroy();
      reject(new Error('Request payload too large.'));
    }
  });
  req.on('end', () => {
    if (!raw) {
      resolve({});
      return;
    }

    try {
      resolve(JSON.parse(raw));
    } catch (error) {
      reject(new Error('Invalid JSON payload.'));
    }
  });
  req.on('error', reject);
});

const buildOrderText = ({ orderNumber, name, email, phone, address, note, orderLines, total }) => {
  const lines = [
    'New poster order',
    '',
    `Order: ${orderNumber}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Shipping address: ${address}`,
    '',
    'Items:',
    ...orderLines.map(line => `- ${line}`),
    '',
    `Total: $${total.toFixed(2)}`
  ];

  if (note) {
    lines.push('', 'Customer note:', note);
  }

  return lines.join('\n');
};

const validateOrderPayload = (payload) => {
  const name = cleanText(payload.name, 120);
  const email = cleanText(payload.email, 254);
  const phone = cleanText(payload.phone, 40);
  const address = cleanText(payload.address, 500);
  const note = cleanText(payload.note, 1000);
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (!name || !phone || !address || !/^\S+@\S+\.\S+$/.test(email) || items.length === 0 || items.length > 50) {
    return { error: 'Please provide your name, email, phone, shipping address, and at least one poster.' };
  }

  const orderLines = [];
  let total = 0;

  for (const item of items) {
    const title = cleanText(item.title, 160) || 'Poster';
    const size = cleanText(item.size, 2).toUpperCase();
    const quantity = Number(item.quantity);

    if (!prices[size] || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return { error: 'One or more cart items are invalid.' };
    }

    const lineTotal = prices[size] * quantity;
    total += lineTotal;
    orderLines.push(`${title} | ${size} | Qty ${quantity} | $${lineTotal.toFixed(2)}`);
  }

  return { name, email, phone, address, note, items, total, orderLines };
};

const sendOrderEmail = async ({ name, email, phone, address, note, orderLines, total }) => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    ORDER_EMAIL,
    ORDER_FROM_EMAIL
  } = process.env;

  const recipient = ORDER_EMAIL || 'brooklynwangson@gmail.com';
  const sender = ORDER_FROM_EMAIL || SMTP_USER || 'brooklynwangson@gmail.com';

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP email service is not configured.');
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE || 'false').toLowerCase() === 'true',
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  const orderNumber = `TB-${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  const text = buildOrderText({ orderNumber, name, email, phone, address, note, orderLines, total });

  await transporter.sendMail({
    from: sender,
    to: recipient,
    replyTo: email,
    subject: `New TopBoy Editions order ${orderNumber}`,
    text
  });

  return orderNumber;
};

async function handleOrder(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { success: false, message: 'POST requests only.' });
  }

  try {
    const payload = await parseBody(req);
    const validated = validateOrderPayload(payload);

    if (validated.error) {
      return json(res, 422, { success: false, message: validated.error });
    }

    const orderNumber = await sendOrderEmail(validated);
    return json(res, 200, { success: true, orderNumber });
  } catch (error) {
    console.error('Order email error:', error);
    const message = error.message || 'The order could not be emailed. Please try again.';
    return json(res, 500, { success: false, message });
  }
}

const serveFile = (res, filePath) => {
  const resolvedPath = path.resolve(ROOT_DIR, filePath);
  fs.readFile(resolvedPath, (error, content) => {
    if (error) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    const extension = path.extname(resolvedPath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.gif': 'image/gif'
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypes[extension] || 'application/octet-stream');
    res.end(content);
  });
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return;
  }

  if (url.pathname === '/api/order') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    handleOrder(req, res);
    return;
  }

  if (url.pathname === '/health') {
    json(res, 200, { ok: true, service: 'artstudio-mail' });
    return;
  }

  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  try {
    serveFile(res, `.${decodeURIComponent(requestedPath)}`);
  } catch (error) {
    res.statusCode = 400;
    res.end('Bad Request');
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`ArtStudio mail server listening on http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  handleOrder,
  sendOrderEmail,
  validateOrderPayload,
  buildOrderText
};

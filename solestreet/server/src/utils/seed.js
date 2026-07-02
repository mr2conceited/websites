require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');

const products = [
  {
    name: 'Air Pulse Runner',
    brand: 'Nexa',
    category: 'sneakers',
    subCategory: 'running',
    gender: 'unisex',
    description: 'Lightweight running sneaker with responsive cushioning and breathable mesh upper.',
    price: 119.99,
    discountPrice: 0,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    variants: [
      { size: 'US 8', color: 'White', stock: 15, sku: 'APR-WHT-8' },
      { size: 'US 9', color: 'White', stock: 20, sku: 'APR-WHT-9' },
      { size: 'US 10', color: 'Black', stock: 12, sku: 'APR-BLK-10' },
    ],
    tags: ['running', 'lightweight', 'breathable'],
    featured: true,
  },
  {
    name: 'Court Classic High-Top',
    brand: 'Nexa',
    category: 'sneakers',
    subCategory: 'basketball',
    gender: 'men',
    description: 'Retro-inspired high-top basketball sneaker with premium leather and ankle support.',
    price: 134.99,
    discountPrice: 109.99,
    images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800'],
    variants: [
      { size: 'US 9', color: 'Red/White', stock: 10, sku: 'CCH-RW-9' },
      { size: 'US 10', color: 'Red/White', stock: 8, sku: 'CCH-RW-10' },
      { size: 'US 11', color: 'Black/Gold', stock: 6, sku: 'CCH-BG-11' },
    ],
    tags: ['basketball', 'retro', 'leather'],
    featured: true,
  },
  {
    name: 'Street Glide Low',
    brand: 'Voltrix',
    category: 'sneakers',
    subCategory: 'lifestyle',
    gender: 'women',
    description: 'Everyday low-top sneaker designed for all-day comfort and street style.',
    price: 89.99,
    images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800'],
    variants: [
      { size: 'US 6', color: 'Pink', stock: 14, sku: 'SGL-PNK-6' },
      { size: 'US 7', color: 'Pink', stock: 18, sku: 'SGL-PNK-7' },
      { size: 'US 8', color: 'Grey', stock: 9, sku: 'SGL-GRY-8' },
    ],
    tags: ['lifestyle', 'casual'],
    featured: false,
  },
  {
    name: 'Essential Pullover Hoodie',
    brand: 'Nexa',
    category: 'hoodies',
    subCategory: 'pullover',
    gender: 'unisex',
    description: 'Heavyweight cotton-blend pullover hoodie with kangaroo pocket and ribbed cuffs.',
    price: 64.99,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'],
    variants: [
      { size: 'S', color: 'Heather Grey', stock: 25, sku: 'EPH-HG-S' },
      { size: 'M', color: 'Heather Grey', stock: 30, sku: 'EPH-HG-M' },
      { size: 'L', color: 'Black', stock: 20, sku: 'EPH-BLK-L' },
      { size: 'XL', color: 'Black', stock: 15, sku: 'EPH-BLK-XL' },
    ],
    tags: ['hoodie', 'streetwear', 'cotton'],
    featured: true,
  },
  {
    name: 'Zip-Up Tech Hoodie',
    brand: 'Voltrix',
    category: 'hoodies',
    subCategory: 'zip-up',
    gender: 'men',
    description: 'Performance zip-up hoodie with moisture-wicking fabric, great for training or layering.',
    price: 74.99,
    discountPrice: 59.99,
    images: ['https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800'],
    variants: [
      { size: 'M', color: 'Navy', stock: 16, sku: 'ZTH-NVY-M' },
      { size: 'L', color: 'Navy', stock: 14, sku: 'ZTH-NVY-L' },
      { size: 'XL', color: 'Charcoal', stock: 10, sku: 'ZTH-CHR-XL' },
    ],
    tags: ['hoodie', 'training', 'zip-up'],
    featured: false,
  },
  {
    name: 'Logo Crewneck Tee',
    brand: 'Nexa',
    category: 'apparel',
    subCategory: 'tshirt',
    gender: 'unisex',
    description: 'Soft cotton crewneck tee featuring an embroidered chest logo.',
    price: 29.99,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    variants: [
      { size: 'S', color: 'White', stock: 40, sku: 'LCT-WHT-S' },
      { size: 'M', color: 'White', stock: 45, sku: 'LCT-WHT-M' },
      { size: 'L', color: 'Black', stock: 35, sku: 'LCT-BLK-L' },
    ],
    tags: ['tshirt', 'basics'],
    featured: false,
  },
  {
    name: 'Track Pants Classic',
    brand: 'Voltrix',
    category: 'apparel',
    subCategory: 'pants',
    gender: 'men',
    description: 'Tapered track pants with side stripe detailing and elastic waistband.',
    price: 54.99,
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'],
    variants: [
      { size: 'S', color: 'Black/White', stock: 20, sku: 'TPC-BW-S' },
      { size: 'M', color: 'Black/White', stock: 25, sku: 'TPC-BW-M' },
      { size: 'L', color: 'Navy/White', stock: 18, sku: 'TPC-NW-L' },
    ],
    tags: ['pants', 'athleisure'],
    featured: true,
  },
  {
    name: 'Cloud Step Slip-On',
    brand: 'Aerofit',
    category: 'sneakers',
    subCategory: 'lifestyle',
    gender: 'unisex',
    description: 'Sock-like slip-on sneaker with ultra-soft foam sole for maximum comfort.',
    price: 99.99,
    images: ['https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800'],
    variants: [
      { size: 'US 7', color: 'Grey', stock: 22, sku: 'CSS-GRY-7' },
      { size: 'US 8', color: 'Grey', stock: 24, sku: 'CSS-GRY-8' },
      { size: 'US 9', color: 'White', stock: 19, sku: 'CSS-WHT-9' },
    ],
    tags: ['slip-on', 'comfort'],
    featured: false,
  },
];

const seed = async () => {
  await connectDB();

  console.log('Clearing existing products...');
  await Product.deleteMany();

  console.log('Inserting sample products...');
  const productsWithSlugs = products.map((product, index) => ({
    ...product,
    slug: slugify(`${product.name}-${product.brand}-${index}`, { lower: true, strict: true }),
  }));
  await Product.insertMany(productsWithSlugs);

  const adminExists = await User.findOne({ email: 'admin@solestreet.com' });
  if (!adminExists) {
    console.log('Creating default admin user...');
    await User.create({
      name: 'Admin',
      email: 'admin@solestreet.com',
      password: 'Admin123!',
      role: 'admin',
    });
    console.log('Admin login -> email: admin@solestreet.com / password: Admin123!');
  }

  console.log('Seed complete!');
  mongoose.connection.close();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

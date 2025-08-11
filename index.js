import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import nodemailer from 'nodemailer';
import cookieParser from 'cookie-parser';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const INSTAGRAM_URL = process.env.INSTAGRAM_URL || 'https://www.instagram.com/stylesyncgeorgia/';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
function loadProducts() {
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read products.json', e);
    return [];
  }
}

app.use((req, res, next) => {
  res.locals.INSTAGRAM_URL = INSTAGRAM_URL;
  next();
});

// Language middleware
app.use((req, res, next) => {
  const lang = req.cookies.lang || 'ka';
  const localePath = path.join(__dirname, 'locales', `${lang}.json`);
  try {
    res.locals.t = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  } catch {
    res.locals.t = {};
  }
  res.locals.lang = lang;
  next();
});

app.get('/', (req, res) => {
  const products = loadProducts();
  res.render('index', { products });
});

app.get('/product/:slug', (req, res) => {
  const products = loadProducts();
  const product = products.find(p => p.slug === req.params.slug);
  if (!product) return res.status(404).render('404');

  const lang = req.cookies.lang || 'ka';
  if (lang === 'en' && product.description_en) {
    product.description = product.description_en;
  } else {
    product.description = product.description_ka;
  }

  res.render('product', { product });
});

app.get('/news', (req, res) => {
  res.render('news');
});

app.get('/about', (req, res) => res.render('about'));

// Language switch route
app.get('/lang/:lang', (req, res) => {
  const selectedLang = req.params.lang;
  if (!['en', 'ka'].includes(selectedLang)) return res.redirect('back');
  res.cookie('lang', selectedLang, { maxAge: 1000 * 60 * 60 * 24 * 30 });
  res.redirect('back');
});

// 📨 Contact form POST route
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send('All fields are required.');
  }

  try {
    // Configure Nodemailer transport
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS  // App password
      }
    });

    // Send the email
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: 'New Contact Form Message',
      text: `From: ${name} (${email})\n\n${message}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p>
             <p>${message}</p>`
    });

    res.render('message-sent');
    
  } catch (error) {
    console.error('Email send failed:', error);
    res.status(500).send('Something went wrong while sending your message.');
  }
});

app.use((req, res) => res.status(404).render('404'));

app.listen(PORT, () => {
  console.log(`StyleSync running on http://localhost:${PORT}`);
});

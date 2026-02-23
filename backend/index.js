const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect('mongodb+srv://anshs9333_db_user:Ansh9670@cluster0.tepuzrk.mongodb.net/jrc-school?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Enquiry Schema
const enquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  company: String,
  service: String,
  budget: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Enquiry = mongoose.model('Enquiry', enquirySchema);

// Admin login credentials
const ADMIN_USER = 'Ansh singh';
const ADMIN_PASS = 'Ansh@9670';

// Simple session storage (for demo, use JWT or sessions for production)
let adminSession = {};

// Admin login endpoint
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Generate a simple session token
    const token = Math.random().toString(36).substr(2);
    adminSession[token] = true;
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Get all enquiries (admin protected)
app.get('/admin/enquiries', (req, res) => {
  const token = req.headers['authorization'];
  if (!token || !adminSession[token]) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  Enquiry.find().sort({ createdAt: -1 }).then(enquiries => {
    res.json({ success: true, enquiries });
  }).catch(err => {
    res.status(500).json({ success: false, error: err.message });
  });
});

app.post('/contact', async (req, res) => {
  const { name, email, phone, company, service, budget, message } = req.body;
  // Save enquiry to MongoDB
  try {
    await Enquiry.create({ name, email, phone, company, service, budget, message });
    // Configure your transporter here
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your.email@gmail.com',
        pass: 'your-app-password'
      }
    });
    await transporter.sendMail({
      from: email,
      to: 'your.email@gmail.com',
      subject: `Portfolio Contact from ${name}` ,
      text: message
    });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(5000, () => {
  console.log('Backend running on port 5000');
});

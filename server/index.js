import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS Configuration
app.use(cors({
  // Reflect the request Origin header (safer when using credentials)
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Handle preflight requests
app.options('*', cors());

// Database Setup
let db;

async function initializeDatabase() {
  db = await open({
    filename: path.join(__dirname, 'gym.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      dob TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      address TEXT,
      occupation TEXT,
      slot TEXT NOT NULL,
      membershipType TEXT NOT NULL,
      membershipPeriod INTEGER,
      startDate TEXT,
      endDate TEXT,
      registrationDay TEXT,
      termsAccepted INTEGER DEFAULT 0,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId TEXT,
      amount REAL,
      finalAmount REAL,
      paidAmount REAL,
      remainingAmount REAL,
      discount REAL DEFAULT 0,
      discountType TEXT,
      paidDate TEXT,
      notes TEXT,
      createdAt TEXT,
      FOREIGN KEY (clientId) REFERENCES clients(clientId)
    );

    CREATE TABLE IF NOT EXISTS emails_sent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId TEXT,
      emailType TEXT,
      recipientEmail TEXT,
      subject TEXT,
      sentAt TEXT,
      FOREIGN KEY (clientId) REFERENCES clients(clientId)
    );

    CREATE TABLE IF NOT EXISTS birthday_emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId TEXT UNIQUE,
      dob TEXT,
      year INTEGER,
      sent INTEGER DEFAULT 0,
      sentAt TEXT,
      FOREIGN KEY (clientId) REFERENCES clients(clientId)
    );
  `);

  console.log('Database initialized successfully');
}

// Email Configuration
const EMAIL_USER = process.env.EMAIL_USER || 'usgymnasium2021@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD || 'fcqd gayb zccq tzjs';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  }
});

// Verify transporter on startup
transporter.verify().then(() => {
  console.log('Email transporter is ready');
}).catch(err => {
  console.error('Error verifying email transporter:', err);
});

// Email Templates
const emailTemplates = {
  welcome: (client) => ({
    subject: 'Welcome to PowerFit Gym! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome ${client.name}!</h2>
        <p>We're thrilled to have you join PowerFit Gym.</p>
        <h3>Your Membership Details:</h3>
        <ul>
          <li><strong>Client ID:</strong> ${client.clientId}</li>
          <li><strong>Email:</strong> ${client.email}</li>
          <li><strong>Membership Type:</strong> ${client.membershipType}</li>
          <li><strong>Start Date:</strong> ${new Date(client.startDate).toLocaleDateString()}</li>
          <li><strong>End Date:</strong> ${new Date(client.endDate).toLocaleDateString()}</li>
          <li><strong>Slot:</strong> ${client.slot}</li>
        </ul>
        <p>Visit us soon and start your fitness journey!</p>
        <p>Best regards,<br/>PowerFit Gym Team</p>
      </div>
    `
  }),
  birthday: (client) => ({
    subject: `Happy Birthday ${client.name}! 🎂`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Happy Birthday, ${client.name}! 🎉🎂</h2>
        <p>On this special day, the entire PowerFit Gym family wishes you health, happiness, and strength!</p>
        <p>As a birthday treat, enjoy a special workout session on us. Visit the front desk to claim your birthday reward.</p>
        <p>Keep crushing your goals!</p>
        <p>Warm wishes,<br/>PowerFit Gym Team</p>
      </div>
    `
  }),
  paymentReminder: (client, amount) => ({
    subject: 'Payment Reminder - PowerFit Gym',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Payment Reminder</h2>
        <p>Dear ${client.name},</p>
        <p>This is a friendly reminder about your pending payment.</p>
        <h3>Payment Details:</h3>
        <ul>
          <li><strong>Remaining Amount:</strong> ₹${amount}</li>
          <li><strong>Client ID:</strong> ${client.clientId}</li>
        </ul>
        <p>Please complete your payment at your earliest convenience.</p>
        <p>Thank you,<br/>PowerFit Gym Team</p>
      </div>
    `
  })
};

// Utility function to send emails
async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: EMAIL_USER,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId, 'to', to);
    return { ok: true, info };
  } catch (error) {
    console.error('Email send error:', error);
    return { ok: false, error };
  }
}

// Scheduled Jobs
// Run at 12:02 AM every day
cron.schedule('2 0 * * *', async () => {
  console.log('Running birthday email check at 12:02 AM...');
  
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `%${month}-${day}`;
    const year = today.getFullYear();

    const clients = await db.all(
      `SELECT * FROM clients WHERE dob LIKE ?`,
      [todayString]
    );

    for (const client of clients) {
      // Avoid sending multiple times in the same year
      const existing = await db.get(
        `SELECT * FROM birthday_emails WHERE clientId = ? AND year = ?`,
        [client.clientId, year]
      );

      if (existing && existing.sent === 1) {
        console.log(`Birthday email already sent this year to ${client.clientId}`);
        continue;
      }

      const { subject, html } = emailTemplates.birthday(client);
      const result = await sendEmail(client.email, subject, html);

      if (result && result.ok) {
        await db.run(
          `INSERT INTO emails_sent (clientId, emailType, recipientEmail, subject, sentAt) 
           VALUES (?, ?, ?, ?, ?)`,
          [client.clientId, 'birthday', client.email, subject, new Date().toISOString()]
        );

        if (existing) {
          await db.run(
            `UPDATE birthday_emails SET sent = 1, sentAt = ? WHERE clientId = ? AND year = ?`,
            [new Date().toISOString(), client.clientId, year]
          );
        } else {
          await db.run(
            `INSERT INTO birthday_emails (clientId, dob, year, sent, sentAt) VALUES (?, ?, ?, ?, ?)`,
            [client.clientId, client.dob, year, 1, new Date().toISOString()]
          );
        }

        console.log(`Birthday email sent to ${client.name} (${client.email})`);
      } else {
        console.error(`Failed to send birthday email to ${client.name}:`, result && result.error ? result.error : 'unknown');
      }
    }
  } catch (error) {
    console.error('Birthday email job error:', error);
  }
}, {
  timezone: 'Asia/Kolkata'
});

// Routes

// Register Client
app.post('/api/clients/register', async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      dob,
      age,
      gender,
      address,
      occupation,
      slot,
      membershipType,
      membershipPeriod,
      startDate,
      endDate,
      registrationDay,
      termsAccepted
    } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !dob || !slot) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate clientId
    const lastClient = await db.get('SELECT clientId FROM clients ORDER BY id DESC LIMIT 1');
    const nextClientId = lastClient 
      ? (parseInt(lastClient.clientId) + 1).toString() 
      : '101';

    const now = new Date().toISOString();

    // Insert client
    await db.run(
      `INSERT INTO clients (clientId, name, email, mobile, dob, age, gender, address, 
       occupation, slot, membershipType, membershipPeriod, startDate, endDate, 
       registrationDay, termsAccepted, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextClientId, name, email, mobile, dob, age, gender, address, occupation,
        slot, JSON.stringify(membershipType), membershipPeriod, startDate, endDate,
        registrationDay, termsAccepted ? 1 : 0, now, now
      ]
    );

    const newClient = await db.get('SELECT * FROM clients WHERE clientId = ?', [nextClientId]);

    // Send welcome email
    const { subject, html } = emailTemplates.welcome(newClient);
    const welcomeResult = await sendEmail(email, subject, html);

    // Log email if sent
    if (welcomeResult && welcomeResult.ok) {
      await db.run(
        `INSERT INTO emails_sent (clientId, emailType, recipientEmail, subject, sentAt) 
         VALUES (?, ?, ?, ?, ?)`,
        [nextClientId, 'welcome', email, subject, now]
      );
    } else {
      console.error('Failed to send welcome email for client', nextClientId, welcomeResult && welcomeResult.error ? welcomeResult.error : 'unknown');
    }

    res.status(201).json({
      success: true,
      client: newClient,
      message: 'Client registered successfully. Welcome email sent.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Get Client by ID
app.get('/api/clients/:clientId', async (req, res) => {
  try {
    const client = await db.get('SELECT * FROM clients WHERE clientId = ?', [req.params.clientId]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client', details: error.message });
  }
});

// Get All Clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await db.all('SELECT * FROM clients');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients', details: error.message });
  }
});

// Send Custom Email
app.post('/api/emails/send', async (req, res) => {
  try {
    const { clientId, emailType, subject, html } = req.body;

    const client = await db.get('SELECT * FROM clients WHERE clientId = ?', [clientId]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const sent = await sendEmail(client.email, subject, html);

    if (sent && sent.ok) {
      await db.run(
        `INSERT INTO emails_sent (clientId, emailType, recipientEmail, subject, sentAt) 
         VALUES (?, ?, ?, ?, ?)`,
        [clientId, emailType, client.email, subject, new Date().toISOString()]
      );

      return res.json({
        success: true,
        message: `Email sent to ${client.email}`
      });
    }

    console.error('Failed to send email via /api/emails/send', sent && sent.error ? sent.error : sent);
    res.status(500).json({ error: 'Failed to send email' });
  } catch (error) {
    res.status(500).json({ error: 'Email send failed', details: error.message });
  }
});

// Add Payment
app.post('/api/payments', async (req, res) => {
  try {
    const { clientId, amount, finalAmount, paidAmount, discount, discountType, notes } = req.body;

    const client = await db.get('SELECT * FROM clients WHERE clientId = ?', [clientId]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const paymentAmount = finalAmount || amount;
    const remainingAmount = paymentAmount - paidAmount;
    const now = new Date().toISOString();

    const result = await db.run(
      `INSERT INTO payments (clientId, amount, finalAmount, paidAmount, remainingAmount, discount, discountType, paidDate, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clientId, amount, paymentAmount, paidAmount, remainingAmount, discount, discountType, now, notes, now]
    );

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Payment recording failed', details: error.message });
  }
});

// Get Payment History
app.get('/api/payments/:clientId', async (req, res) => {
  try {
    const payments = await db.all('SELECT * FROM payments WHERE clientId = ?', [req.params.clientId]);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments', details: error.message });
  }
});

// Get Email History
app.get('/api/emails/:clientId', async (req, res) => {
  try {
    const emails = await db.all('SELECT * FROM emails_sent WHERE clientId = ? ORDER BY sentAt DESC', [req.params.clientId]);
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email history', details: error.message });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running' });
});

// Start Server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

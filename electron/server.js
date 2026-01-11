// Electron Backend Server using sql.js (Pure JavaScript SQLite - No native compilation required)
const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

let db;
let dbPath;
let photoPath;
let SQL;

// Initialize sql.js
async function initSqlJs() {
  const initSqlJsModule = require('sql.js');
  SQL = await initSqlJsModule();
}

// Initialize Database
async function initializeDatabase(customDbPath) {
  if (!SQL) {
    await initSqlJs();
  }
  
  dbPath = customDbPath || path.join(__dirname, 'gym.db');
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('Loaded existing database from:', dbPath);
  } else {
    db = new SQL.Database();
    console.log('Created new database');
  }

  // Create tables
  db.run(`
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
      finalAmount REAL,
      photoPath TEXT,
      termsAccepted INTEGER DEFAULT 0,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId TEXT,
      clientName TEXT,
      amount REAL,
      finalAmount REAL,
      paidAmount REAL,
      remainingAmount REAL,
      membershipPeriod INTEGER,
      offerDiscount REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      discountType TEXT,
      paidDate TEXT,
      notes TEXT,
      createdAt TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS emails_sent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId TEXT,
      emailType TEXT,
      recipientEmail TEXT,
      subject TEXT,
      sentAt TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS birthday_emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId TEXT UNIQUE,
      dob TEXT,
      year INTEGER,
      sent INTEGER DEFAULT 0,
      sentAt TEXT
    )
  `);

  saveDatabase();
  console.log('Database initialized successfully');
}

// Save database to disk
function saveDatabase() {
  if (db && dbPath) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Helper to run SELECT queries
function dbAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper to run SELECT for single row
function dbGet(sql, params = []) {
  const results = dbAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Helper to run INSERT/UPDATE/DELETE
function dbRun(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
}

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Email Configuration
const EMAIL_USER = process.env.EMAIL_USER || 'usgymnasium2021@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASSWORD || 'fcqd gayb zccq tzjs';
const EMAIL_FROM = `"US GYMNASIUM" <${EMAIL_USER}>`;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  }
});

// Email Templates
const emailTemplates = {
  welcome: (client) => ({
    subject: 'Welcome to US Gymnasium! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">US Gymnasium</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #374151;">Welcome ${client.name}!</h2>
          <p style="color: #374151;">We're thrilled to have you join the US Gymnasium family.</p>
          <h3 style="color: #374151;">Your Membership Details:</h3>
          <ul style="color: #374151;">
            <li><strong>Client ID:</strong> ${client.clientId}</li>
            <li><strong>Email:</strong> ${client.email}</li>
            <li><strong>Membership Type:</strong> ${client.membershipType}</li>
            <li><strong>Start Date:</strong> ${new Date(client.startDate).toLocaleDateString()}</li>
            <li><strong>End Date:</strong> ${new Date(client.endDate).toLocaleDateString()}</li>
            <li><strong>Slot:</strong> ${client.slot}</li>
          </ul>
          <p style="color: #374151;">Visit us soon and start your fitness journey!</p>
          <p style="color: #374151;">Best regards,<br/><strong>US Gymnasium Team</strong></p>
        </div>
      </div>
    `
  }),
  birthday: (client) => ({
    subject: `Happy Birthday ${client.name}! 🎂 - US Gymnasium`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🎂 Happy Birthday! 🎉</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #374151;">Happy Birthday, ${client.name}!</h2>
          <p style="color: #374151;">On this special day, the entire US Gymnasium family wishes you health, happiness, and strength!</p>
          <p style="color: #374151;">Keep crushing your goals!</p>
          <p style="color: #374151;">Warm wishes,<br/><strong>US Gymnasium Team</strong></p>
        </div>
      </div>
    `
  })
};

async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return { ok: true, info };
  } catch (error) {
    console.error('Email send error:', error);
    return { ok: false, error };
  }
}

// Set photo path
function setPhotoPath(customPath) {
  photoPath = customPath;
  if (!fs.existsSync(photoPath)) {
    fs.mkdirSync(photoPath, { recursive: true });
  }
}

// Birthday Email Cron Job - 12:02 AM daily
cron.schedule('2 0 * * *', async () => {
  console.log('Running birthday email check...');
  
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayPattern = `%-${month}-${day}`;
    const year = today.getFullYear();

    const clients = dbAll(`SELECT * FROM clients WHERE dob LIKE ?`, [todayPattern]);

    for (const client of clients) {
      const existing = dbGet(
        `SELECT * FROM birthday_emails WHERE clientId = ? AND year = ?`,
        [client.clientId, year]
      );

      if (existing && existing.sent === 1) continue;

      const { subject, html } = emailTemplates.birthday(client);
      const result = await sendEmail(client.email, subject, html);

      if (result && result.ok) {
        dbRun(
          `INSERT INTO emails_sent (clientId, emailType, recipientEmail, subject, sentAt) VALUES (?, ?, ?, ?, ?)`,
          [client.clientId, 'birthday', client.email, subject, new Date().toISOString()]
        );

        if (existing) {
          dbRun(
            `UPDATE birthday_emails SET sent = 1, sentAt = ? WHERE clientId = ? AND year = ?`,
            [new Date().toISOString(), client.clientId, year]
          );
        } else {
          dbRun(
            `INSERT INTO birthday_emails (clientId, dob, year, sent, sentAt) VALUES (?, ?, ?, ?, ?)`,
            [client.clientId, client.dob, year, 1, new Date().toISOString()]
          );
        }
        console.log(`Birthday email sent to ${client.name}`);
      }
    }
  } catch (error) {
    console.error('Birthday email job error:', error);
  }
}, { timezone: 'Asia/Kolkata' });

// ========== API ROUTES ==========

// Register Client
app.post('/api/clients/register', async (req, res) => {
  try {
    const {
      name, email, mobile, dob, age, gender, address, occupation,
      slot, membershipType, membershipPeriod, startDate, endDate,
      registrationDay, finalAmount, termsAccepted, photo
    } = req.body;

    if (!name || !email || !mobile || !dob || !slot) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const lastClient = dbGet('SELECT clientId FROM clients ORDER BY id DESC LIMIT 1');
    const nextClientId = lastClient 
      ? (parseInt(lastClient.clientId) + 1).toString() 
      : '101';

    const now = new Date().toISOString();
    
    // Save photo
    let savedPhotoPath = null;
    if (photo && photoPath) {
      try {
        let base64Data = photo;
        if (photo.startsWith('data:image')) {
          base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
        }
        
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${sanitizedName}_${nextClientId}.jpg`;
        savedPhotoPath = path.join(photoPath, fileName);
        
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(savedPhotoPath, buffer);
        console.log(`Photo saved: ${savedPhotoPath}`);
      } catch (photoErr) {
        console.error('Error saving photo:', photoErr);
      }
    }

    dbRun(
      `INSERT INTO clients (clientId, name, email, mobile, dob, age, gender, address, 
       occupation, slot, membershipType, membershipPeriod, startDate, endDate, 
       registrationDay, finalAmount, photoPath, termsAccepted, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextClientId, name, email, mobile, dob, age, gender, address, occupation,
        slot, JSON.stringify(membershipType), membershipPeriod, startDate, endDate,
        registrationDay, finalAmount, savedPhotoPath, termsAccepted ? 1 : 0, now, now
      ]
    );

    const newClient = dbGet('SELECT * FROM clients WHERE clientId = ?', [nextClientId]);

    const clientForResponse = {
      ...newClient,
      membershipType: typeof newClient?.membershipType === 'string'
        ? JSON.parse(newClient.membershipType)
        : newClient.membershipType,
      payments: [],
    };

    // Send welcome email
    const { subject, html } = emailTemplates.welcome(clientForResponse);
    const welcomeResult = await sendEmail(email, subject, html);

    if (welcomeResult && welcomeResult.ok) {
      dbRun(
        `INSERT INTO emails_sent (clientId, emailType, recipientEmail, subject, sentAt) VALUES (?, ?, ?, ?, ?)`,
        [nextClientId, 'welcome', email, subject, now]
      );
    }

    res.status(201).json({
      success: true,
      client: clientForResponse,
      message: 'Client registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Get All Clients
app.get('/api/clients', (req, res) => {
  try {
    const clients = dbAll('SELECT * FROM clients');

    const parsedClients = clients.map((c) => {
      const payments = dbAll('SELECT * FROM payments WHERE clientId = ? ORDER BY paidDate DESC', [c.clientId]);
      return {
        ...c,
        membershipType: typeof c.membershipType === 'string' ? JSON.parse(c.membershipType) : c.membershipType,
        payments: payments || [],
      };
    });

    res.json(parsedClients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients', details: error.message });
  }
});

// Get Client by ID
app.get('/api/clients/:clientId', (req, res) => {
  try {
    const client = dbGet('SELECT * FROM clients WHERE clientId = ?', [req.params.clientId]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const payments = dbAll('SELECT * FROM payments WHERE clientId = ? ORDER BY paidDate DESC', [req.params.clientId]);

    res.json({
      ...client,
      membershipType: typeof client.membershipType === 'string' ? JSON.parse(client.membershipType) : client.membershipType,
      payments: payments || [],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client', details: error.message });
  }
});

// Update Client
app.put('/api/clients/:clientId', (req, res) => {
  try {
    const { clientId } = req.params;
    const updates = req.body;
    
    const client = dbGet('SELECT * FROM clients WHERE clientId = ?', [clientId]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const membershipType = updates.membershipType ? JSON.stringify(updates.membershipType) : client.membershipType;
    
    dbRun(
      `UPDATE clients SET 
        name = ?, email = ?, mobile = ?, dob = ?, age = ?, gender = ?, 
        address = ?, occupation = ?, slot = ?, membershipType = ?, 
        membershipPeriod = ?, startDate = ?, endDate = ?, finalAmount = ?, updatedAt = ?
       WHERE clientId = ?`,
      [
        updates.name || client.name,
        updates.email || client.email,
        updates.mobile || client.mobile,
        updates.dob || client.dob,
        updates.age || client.age,
        updates.gender || client.gender,
        updates.address || client.address,
        updates.occupation || client.occupation,
        updates.slot || client.slot,
        membershipType,
        updates.membershipPeriod || client.membershipPeriod,
        updates.startDate || client.startDate,
        updates.endDate || client.endDate,
        updates.finalAmount || client.finalAmount,
        new Date().toISOString(),
        clientId
      ]
    );

    const updatedClient = dbGet('SELECT * FROM clients WHERE clientId = ?', [clientId]);
    const payments = dbAll('SELECT * FROM payments WHERE clientId = ? ORDER BY paidDate DESC', [clientId]);

    res.json({
      success: true,
      client: {
        ...updatedClient,
        membershipType: typeof updatedClient?.membershipType === 'string'
          ? JSON.parse(updatedClient.membershipType)
          : updatedClient.membershipType,
        payments: payments || [],
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client', details: error.message });
  }
});

// Delete Client
app.delete('/api/clients/:clientId', (req, res) => {
  try {
    const { clientId } = req.params;
    dbRun('DELETE FROM payments WHERE clientId = ?', [clientId]);
    dbRun('DELETE FROM emails_sent WHERE clientId = ?', [clientId]);
    dbRun('DELETE FROM birthday_emails WHERE clientId = ?', [clientId]);
    dbRun('DELETE FROM clients WHERE clientId = ?', [clientId]);
    res.json({ success: true, message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client', details: error.message });
  }
});

// Send Email
app.post('/api/emails/send', async (req, res) => {
  try {
    const { clientId, emailType, subject, html } = req.body;

    const client = dbGet('SELECT * FROM clients WHERE clientId = ?', [clientId]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const sent = await sendEmail(client.email, subject, html);

    if (sent && sent.ok) {
      dbRun(
        `INSERT INTO emails_sent (clientId, emailType, recipientEmail, subject, sentAt) VALUES (?, ?, ?, ?, ?)`,
        [clientId, emailType, client.email, subject, new Date().toISOString()]
      );
      return res.json({ success: true, message: `Email sent to ${client.email}` });
    }

    res.status(500).json({ error: 'Failed to send email' });
  } catch (error) {
    res.status(500).json({ error: 'Email send failed', details: error.message });
  }
});

// Add Payment
app.post('/api/payments', (req, res) => {
  try {
    const { clientId, name, amount, finalAmount, paidAmount, membershipPeriod, offerDiscount, discount, discountType, notes, paidDate } = req.body;

    const client = dbGet('SELECT * FROM clients WHERE clientId = ?', [clientId]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const paymentAmount = finalAmount || amount;
    const remainingAmount = paymentAmount - paidAmount;
    const paymentDateTime = paidDate || new Date().toISOString();
    const now = new Date().toISOString();

    dbRun(
      `INSERT INTO payments (clientId, clientName, amount, finalAmount, paidAmount, remainingAmount, membershipPeriod, offerDiscount, discount, discountType, paidDate, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clientId, name || client.name, amount, paymentAmount, paidAmount, remainingAmount, membershipPeriod || client.membershipPeriod, offerDiscount || 0, discount || 0, discountType, paymentDateTime, notes, now]
    );

    res.status(201).json({ success: true, message: 'Payment recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Payment recording failed', details: error.message });
  }
});

// Get Payments
app.get('/api/payments/:clientId', (req, res) => {
  try {
    const payments = dbAll('SELECT * FROM payments WHERE clientId = ?', [req.params.clientId]);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments', details: error.message });
  }
});

// Get Emails
app.get('/api/emails/:clientId', (req, res) => {
  try {
    const emails = dbAll('SELECT * FROM emails_sent WHERE clientId = ? ORDER BY sentAt DESC', [req.params.clientId]);
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email history', details: error.message });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date().toISOString() });
});

// Export for Electron
module.exports = { app, initializeDatabase, setPhotoPath, PORT };

// Start server if running standalone
if (require.main === module) {
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

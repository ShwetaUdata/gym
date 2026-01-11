import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

// Photo storage directory - Change this path as needed
const PHOTO_STORAGE_PATH = process.env.PHOTO_STORAGE_PATH || 'C:/GymPhotos';

// Ensure photo directory exists
if (!fs.existsSync(PHOTO_STORAGE_PATH)) {
  fs.mkdirSync(PHOTO_STORAGE_PATH, { recursive: true });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (no Origin) + all origins by default
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    return callback(null, allowedOrigins.includes(origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

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
      finalAmount REAL,
      photoPath TEXT,
      termsAccepted INTEGER DEFAULT 0,
      offerApplied TEXT,
      offerType TEXT,
      offerValue REAL,
      createdAt TEXT,
      updatedAt TEXT
    );

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

  // Ensure `photoPath` column exists (migration for older DBs)
  try {
    const cols = await db.all("PRAGMA table_info('clients')");
    const colNames = (cols || []).map(c => c.name);
    if (!colNames.includes('photoPath')) {
      await db.run("ALTER TABLE clients ADD COLUMN photoPath TEXT");
    }
    // Add offer columns if they don't exist
    if (!colNames.includes('offerApplied')) {
      await db.run("ALTER TABLE clients ADD COLUMN offerApplied TEXT");
    }
    if (!colNames.includes('offerType')) {
      await db.run("ALTER TABLE clients ADD COLUMN offerType TEXT");
    }
    if (!colNames.includes('offerValue')) {
      await db.run("ALTER TABLE clients ADD COLUMN offerValue REAL");
    }

    // Migrate payments table columns
    const paymentCols = await db.all("PRAGMA table_info('payments')");
    const paymentColNames = (paymentCols || []).map(c => c.name);
    if (!paymentColNames.includes('clientName')) {
      await db.run("ALTER TABLE payments ADD COLUMN clientName TEXT");
    }
    if (!paymentColNames.includes('membershipPeriod')) {
      await db.run("ALTER TABLE payments ADD COLUMN membershipPeriod INTEGER");
    }
    if (!paymentColNames.includes('offerDiscount')) {
      await db.run("ALTER TABLE payments ADD COLUMN offerDiscount REAL");
    }
  } catch (mErr) {
    res.status(500).json({ error: 'DB migration failed', details: mErr.message });
  }
}

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

// Verify transporter on startup
transporter.verify().then(() => {
  console.log('Email transporter is ready');
}).catch(err => {
  console.error('Email transporter verification failed:', err);
});

// Email Templates
// const emailTemplates = {
//   welcome: (client) => ({
//     subject: 'Welcome to US Gymnasium! 🎉',
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #8b5cf6, #f59e0b); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
//           <h1 style="color: white; margin: 0;">US Gymnasium</h1>
//         </div>
//         <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
//           <h2 style="color: #374151;">Welcome ${client.name}!</h2>
//           <p style="color: #374151;">We're thrilled to have you join the US Gymnasium family.</p>
//           <h3 style="color: #374151;">Your Membership Details:</h3>
//           <ul style="color: #374151;">
//             <li><strong>Client ID:</strong> ${client.clientId}</li>
//             <li><strong>Email:</strong> ${client.email}</li>
//             <li><strong>Membership Type:</strong> ${client.membershipType}</li>
//             <li><strong>Start Date:</strong> ${new Date(client.startDate).toLocaleDateString()}</li>
//             <li><strong>End Date:</strong> ${new Date(client.endDate).toLocaleDateString()}</li>
//             <li><strong>Slot:</strong> ${client.slot}</li>
//           </ul>
//           <p style="color: #374151;">Visit us soon and start your fitness journey!</p>
//           <p style="color: #374151;">Best regards,<br/><strong>US Gymnasium Team</strong></p>
//         </div>
//         <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
//           <p>© ${new Date().getFullYear()} US Gymnasium. All rights reserved.</p>
//         </div>
//       </div>
//     `
//   }),
//   birthday: (client) => ({
//     subject: `Happy Birthday ${client.name}! 🎂 - US Gymnasium`,
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #8b5cf6, #f59e0b); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
//           <h1 style="color: white; margin: 0;">🎂 Happy Birthday! 🎉</h1>
//         </div>
//         <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
//           <h2 style="color: #374151;">Happy Birthday, ${client.name}!</h2>
//           <p style="color: #374151;">On this special day, the entire US Gymnasium family wishes you health, happiness, and strength!</p>
//           <p style="color: #374151;">As a birthday treat, enjoy a special workout session on us. Visit the front desk to claim your birthday reward.</p>
//           <p style="color: #374151;">Keep crushing your goals!</p>
//           <p style="color: #374151;">Warm wishes,<br/><strong>US Gymnasium Team</strong></p>
//         </div>
//         <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
//           <p>© ${new Date().getFullYear()} US Gymnasium. All rights reserved.</p>
//         </div>
//       </div>
//     `
//   }),
//   paymentReminder: (client, amount) => ({
//     subject: 'Payment Reminder - US Gymnasium',
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #8b5cf6, #f59e0b); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
//           <h1 style="color: white; margin: 0;">Payment Reminder</h1>
//         </div>
//         <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
//           <p style="color: #374151; font-size: 18px;">Dear ${client.name},</p>
//           <p style="color: #374151;">This is a friendly reminder about your pending payment at US Gymnasium.</p>
//           <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
//             <h3 style="margin: 0 0 15px 0; color: #374151;">Payment Details:</h3>
//             <ul style="color: #374151; margin: 0; padding-left: 20px;">
//               <li><strong>Remaining Amount:</strong> ₹${amount}</li>
//               <li><strong>Client ID:</strong> ${client.clientId}</li>
//             </ul>
//           </div>
//           <p style="color: #374151;">Please complete your payment at your earliest convenience.</p>
//           <p style="color: #374151;">Thank you,<br/><strong>US Gymnasium Team</strong></p>
//         </div>
//         <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
//           <p>© ${new Date().getFullYear()} US Gymnasium. All rights reserved.</p>
//         </div>
//       </div>
//     `
//   })
// };


// Utility function to send emails
async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html
    });
    return { ok: true, info };
  } catch (error) {
    return { ok: false, error };
  }
}

// Scheduled Jobs - Run at 12:02 AM every day (IST)
// cron.schedule('2 0 * * *', async () => {
  
//   try {
//     const today = new Date();
//     const month = String(today.getMonth() + 1).padStart(2, '0');
//     const day = String(today.getDate()).padStart(2, '0');
//     const todayString = `%${month}-${day}`;
//     const year = today.getFullYear();

//     const clients = await db.all(
//       `SELECT * FROM clients WHERE dob LIKE ?`,
//       [todayString]
//     );

//     for (const client of clients) {
//       const existing = await db.get(
//         `SELECT * FROM birthday_emails WHERE clientId = ? AND year = ?`,
//         [client.clientId, year]
//       );

//       if (existing && existing.sent === 1) {
//         continue;
//       }

//       const { subject, html } = emailTemplates.birthday(client);
//       const result = await sendEmail(client.email, subject, html);

//       if (result && result.ok) {
//         await db.run(
//           `INSERT INTO emails_sent (clientId, emailType, recipientEmail, subject, sentAt) 
//            VALUES (?, ?, ?, ?, ?)`,
//           [client.clientId, 'birthday', client.email, subject, new Date().toISOString()]
//         );

//         if (existing) {
//           await db.run(
//             `UPDATE birthday_emails SET sent = 1, sentAt = ? WHERE clientId = ? AND year = ?`,
//             [new Date().toISOString(), client.clientId, year]
//           );
//         } else {
//           await db.run(
//             `INSERT INTO birthday_emails (clientId, dob, year, sent, sentAt) VALUES (?, ?, ?, ?, ?)`,
//             [client.clientId, client.dob, year, 1, new Date().toISOString()]
//           );
//         }
//       }
//     }
//   } catch (error) {
//   }
// }, {
//   timezone: 'Asia/Kolkata'
// });

// Routes

// Register Client
app.post('/api/clients/register', async (req, res) => {
  try {
    const {
      name, email, mobile, dob, age, gender, address, occupation,
      slot, membershipType, membershipPeriod, startDate, endDate,
      registrationDay, finalAmount, termsAccepted, termsAcceptedBy, photo
    } = req.body;

    // Log received data for debugging
    // console.log('Registration request received:', {
    //   name,
    //   email,
    //   mobile,
    //   hasPhoto: !!photo,
    //   photoLength: photo ? photo.length : 0,
    //   photoPrefix: photo ? photo.substring(0, 50) : 'none'
    // });

    if (!name || !email || !mobile || !dob || !slot) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const lastClient = await db.get('SELECT clientId FROM clients ORDER BY id DESC LIMIT 1');
    const nextClientId = lastClient 
      ? (parseInt(lastClient.clientId) + 1).toString() 
      : '101';

    const now = new Date().toISOString();
    
    // Save photo to disk if provided
    let photoPath = null;
    if (photo) {
      try {
        // Handle both with and without data URL prefix
        let base64Data = photo;
        if (photo.startsWith('data:image')) {
          base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
        }
        
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${sanitizedName}_${nextClientId}.jpg`;
        photoPath = path.join(PHOTO_STORAGE_PATH, fileName);
        
        // Create buffer from base64 and write to file
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(photoPath, buffer);
      } catch (photoErr) {
        res.status(500).json({ error: 'Failed to save photo', details: photoErr.message });
      }
    } else {
      res.status(400).json({ error: 'Photo is required for registration' });
    }

    await db.run(
      `INSERT INTO clients (clientId, name, email, mobile, dob, age, gender, address, 
       occupation, slot, membershipType, membershipPeriod, startDate, endDate, 
       registrationDay, finalAmount, photoPath, termsAccepted, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextClientId, name, email, mobile, dob, age, gender, address, occupation,
        slot, JSON.stringify(membershipType), membershipPeriod, startDate, endDate,
        registrationDay, finalAmount, photoPath, termsAccepted ? 1 : 0, now, now
      ]
    );

    const newClient = await db.get('SELECT * FROM clients WHERE clientId = ?', [nextClientId]);

    const clientForResponse = {
      ...newClient,
      membershipType:
        typeof newClient?.membershipType === 'string'
          ? JSON.parse(newClient.membershipType)
          : newClient.membershipType,
      payments: [],
    };

    // // Send welcome email
    // const { subject, html } = emailTemplates.welcome(clientForResponse);
    // const welcomeResult = await sendEmail(email, subject, html);

    // if (welcomeResult && welcomeResult.ok) {
    //   await db.run(
    //     `INSERT INTO emails_sent (clientId, emailType, recipientEmail, subject, sentAt) 
    //      VALUES (?, ?, ?, ?, ?)`,
    //     [nextClientId, 'welcome', email, subject, now]
    //   );
    // }

    res.status(201).json({
      success: true,
      client: clientForResponse,
      message: 'Client registered successfully. Welcome email sent.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Get All Clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await db.all('SELECT * FROM clients');

    const parsedClients = await Promise.all(
      clients.map(async (c) => {
        const payments = await db.all('SELECT * FROM payments WHERE clientId = ? ORDER BY paidDate DESC', [c.clientId]);
        return {
          ...c,
          membershipType: typeof c.membershipType === 'string' ? JSON.parse(c.membershipType) : c.membershipType,
          payments: payments || [],
        };
      })
    );

    res.json(parsedClients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients', details: error.message });
  }
});

// Get Client by ID
app.get('/api/clients/:clientId', async (req, res) => {
  try {
    const client = await db.get('SELECT * FROM clients WHERE clientId = ?', [req.params.clientId]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const payments = await db.all('SELECT * FROM payments WHERE clientId = ? ORDER BY paidDate DESC', [req.params.clientId]);

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
app.put('/api/clients/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const updates = req.body;
    
    const client = await db.get('SELECT * FROM clients WHERE clientId = ?', [clientId]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const membershipType = updates.membershipType ? JSON.stringify(updates.membershipType) : client.membershipType;
    
    await db.run(
      `UPDATE clients SET 
        name = ?, email = ?, mobile = ?, dob = ?, age = ?, gender = ?, 
        address = ?, occupation = ?, slot = ?, membershipType = ?, 
        membershipPeriod = ?, startDate = ?, endDate = ?, finalAmount = ?, 
        offerApplied = ?, offerType = ?, offerValue = ?, updatedAt = ?
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
        updates.offerApplied || client.offerApplied || null,
        updates.offerType || client.offerType || null,
        updates.offerValue !== undefined ? updates.offerValue : (client.offerValue || null),
        new Date().toISOString(),
        clientId
      ]
    );

    const updatedClient = await db.get('SELECT * FROM clients WHERE clientId = ?', [clientId]);
    const payments = await db.all('SELECT * FROM payments WHERE clientId = ? ORDER BY paidDate DESC', [clientId]);

    res.json({
      success: true,
      client: {
        ...updatedClient,
        membershipType:
          typeof updatedClient?.membershipType === 'string'
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
app.delete('/api/clients/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    await db.run('DELETE FROM payments WHERE clientId = ?', [clientId]);
    await db.run('DELETE FROM emails_sent WHERE clientId = ?', [clientId]);
    await db.run('DELETE FROM birthday_emails WHERE clientId = ?', [clientId]);
    await db.run('DELETE FROM clients WHERE clientId = ?', [clientId]);
    res.json({ success: true, message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client', details: error.message });
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

      return res.json({ success: true, message: `Email sent to ${client.email}` });
    }

    res.status(500).json({ error: 'Failed to send email' });
  } catch (error) {
    res.status(500).json({ error: 'Email send failed', details: error.message });
  }
});

// Add Payment
app.post('/api/payments', async (req, res) => {
  try {   
    const {
      clientId,
      name,
      amount,
      finalAmount,
      paidAmount,
      membershipPeriod,
      offerDiscount,
      discount,
      discountType,
      notes,
      paidDate,
    } = req.body;

    // Validate required fields
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    if (!finalAmount && !amount) {
      return res.status(400).json({ error: 'finalAmount or amount is required' });
    }

    if (paidAmount === undefined || paidAmount === null) {
      return res.status(400).json({ error: 'paidAmount is required' });
    }

    const client = await db.get('SELECT * FROM clients WHERE clientId = ?', [
      clientId,
    ]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Validate numeric fields
    const amountNum = amount !== undefined ? Number(amount) : NaN;
    const finalAmountNum = finalAmount !== undefined ? Number(finalAmount) : NaN;
    const paidAmountNum = paidAmount !== undefined ? Number(paidAmount) : NaN;

    // Determine effective payment amount
    const paymentAmount = !isNaN(finalAmountNum)
      ? finalAmountNum
      : !isNaN(amountNum)
      ? amountNum
      : null;

    if (paymentAmount === null) {
      return res.status(400).json({
        error: 'Either amount or finalAmount must be provided and be numeric',
      });
    }

    if (isNaN(paidAmountNum) || paidAmountNum < 0) {
      return res
        .status(400)
        .json({
          error: 'paidAmount must be a non-negative number',
        });
    }

    const remainingAmount = paymentAmount - paidAmountNum;
    // Use provided paidDate or current time
    const paymentDateTime = paidDate || new Date().toISOString();
    const now = new Date().toISOString();

    try {
      // console.log('Inserting payment with values:', {
      //   clientId,
      //   name: name || client.name,
      //   amount: isNaN(amountNum) ? null : amountNum,
      //   finalAmount: isNaN(finalAmountNum) ? null : finalAmountNum,
      //   paidAmount: paidAmountNum,
      //   remainingAmount,
      //   membershipPeriod: membershipPeriod || client.membershipPeriod,
      //   offerDiscount: offerDiscount || 0,
      //   discount: discount || 0,
      //   discountType: discountType || null,
      //   paidDate: paymentDateTime,
      //   notes: notes || null,
      //   createdAt: now,
      // });

      await db.run(
        `INSERT INTO payments (clientId, clientName, amount, finalAmount, paidAmount, remainingAmount, membershipPeriod, offerDiscount, discount, discountType, paidDate, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientId,
          name || client.name,
          isNaN(amountNum) ? null : amountNum,
          isNaN(finalAmountNum) ? null : finalAmountNum,
          paidAmountNum,
          remainingAmount,
          membershipPeriod || client.membershipPeriod,
          offerDiscount || 0,
          discount || 0,
          discountType || null,
          paymentDateTime,
          notes || null,
          now,
        ]
      );
      res
        .status(201)
        .json({ success: true, message: 'Payment recorded successfully' });
    } catch (dbErr) {
      return res.status(500).json({
        error: 'Payment recording failed',
        details: dbErr.message,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        error: 'Payment recording failed',
        details: error.message,
      });
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
  res.json({ status: 'Server running', timestamp: new Date().toISOString() });
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

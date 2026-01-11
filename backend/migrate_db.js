import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrateDatabase() {
  const db = await open({
    filename: path.join(__dirname, 'gym.db'),
    driver: sqlite3.Database
  });

  try {

    // Check which columns exist in payments table
    const paymentsSchema = await db.all("PRAGMA table_info('payments')");
    const columnNames = paymentsSchema.map(col => col.name);

    // Add missing columns to payments table
    const missingColumns = [
      { name: 'clientName', type: 'TEXT' },
      { name: 'membershipPeriod', type: 'INTEGER' },
      { name: 'offerDiscount', type: 'REAL' }
    ];

    for (const col of missingColumns) {
      if (!columnNames.includes(col.name)) {
        await db.run(`ALTER TABLE payments ADD COLUMN ${col.name} ${col.type}`);
      } else {
        console.log(`Column ${col.name} already exists in payments table.`);
      }
    }

    // Verify the migration
    const updatedSchema = await db.all("PRAGMA table_info('payments')");
    const updatedColumns = updatedSchema.map(col => col.name);
    
  } catch (err) {
    process.exit(1);
  } finally {
    await db.close();
  }
}

migrateDatabase();

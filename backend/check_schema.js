import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = await open({
  filename: path.join(__dirname, 'gym.db'),
  driver: sqlite3.Database
});

const paymentsSchema = await db.all("PRAGMA table_info('payments')");
const clientsSchema = await db.all("PRAGMA table_info('clients')");

await db.close();


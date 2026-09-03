import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, '..', 'data', 'admin-auth.json');
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
const providedPassword = process.argv.slice(2).join(' ');
const password = providedPassword || Array.from(crypto.randomBytes(20), byte => alphabet[byte % alphabet.length]).join('');
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 64).toString('hex');

fs.writeFileSync(authFile, JSON.stringify({ salt, hash }, null, 2));
console.log(`Admin password: ${password}`);
console.log(`Hash: ${hash}`);
console.log(`Stored salted hash in: ${authFile}`);

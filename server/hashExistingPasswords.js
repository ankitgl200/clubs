import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { User } from './models/index.js';

dotenv.config();

export async function hashAllPlainPasswords() {
  await connectDB();
  const users = await User.find({ password: { $exists: true, $ne: '' } });
  let count = 0;
  for (const u of users) {
    if (u.password && !u.password.startsWith('$2')) {
      const hashed = await bcrypt.hash(u.password, 10);
      await User.updateOne({ _id: u._id }, { $set: { password: hashed } });
      count++;
      console.log(`Hashed password for user: ${u.email}`);
    }
  }
  console.log(`Finished: ${count} user password(s) converted to bcrypt hashes.`);
  return count;
}

if (process.argv[1] && process.argv[1].endsWith('hashExistingPasswords.js')) {
  hashAllPlainPasswords().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Error hashing passwords:', err);
    process.exit(1);
  });
}

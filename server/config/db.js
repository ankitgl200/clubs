import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both root and server directories
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const NODE_ENV = (process.env.NODE_ENV || 'development').trim().toLowerCase();
const MONGODB_MODE = (process.env.MONGODB_MODE || '').trim().toLowerCase();

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/club_studymyte';
const ATLAS_URI = process.env.ATLAS_MONGODB_URI || process.env.MONGODB_URI;

const hasProdFlag = process.argv.includes('--prod') || process.argv.includes('--production') || process.argv.includes('--atlas');
const hasLocalFlag = process.argv.includes('--local') || process.argv.includes('--dev');

// Determine target database:
// 1. If CLI flag --atlas/--prod is passed -> force Atlas
// 2. If CLI flag --local/--dev is passed -> force Localhost
// 3. If MONGODB_MODE is 'atlas' -> force Atlas
// 4. If MONGODB_MODE is 'local' -> force Localhost
// 5. Otherwise: 'production' uses Atlas, 'development' uses Localhost
const isProduction = hasProdFlag
  ? true
  : hasLocalFlag
  ? false
  : NODE_ENV === 'production' || MONGODB_MODE === 'atlas';

export let activeDbInfo = {
  environment: isProduction ? 'production' : 'development',
  type: isProduction ? 'MongoDB Atlas (Cloud)' : 'Localhost MongoDB (127.0.0.1:27017)',
  host: '',
  dbName: '',
};

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  if (isProduction) {
    try {
      console.log(`🌐 [MongoDB Mode: PRODUCTION] Connecting to MongoDB Atlas Cloud...`);
      const conn = await mongoose.connect(ATLAS_URI);
      activeDbInfo.type = 'MongoDB Atlas (Cloud)';
      activeDbInfo.host = conn.connection.host;
      activeDbInfo.dbName = conn.connection.name;
      console.log(`✅ [MongoDB Atlas Connected]: ${conn.connection.host} / Database: ${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.error(`❌ [MongoDB Atlas Connection Error]: ${err.message}`);
      process.exit(1);
    }
  } else {
    try {
      console.log(`💻 [MongoDB Mode: DEVELOPMENT] Connecting to Localhost MongoDB (${LOCAL_URI})...`);
      const conn = await mongoose.connect(LOCAL_URI);
      activeDbInfo.type = 'Localhost MongoDB (127.0.0.1:27017)';
      activeDbInfo.host = conn.connection.host;
      activeDbInfo.dbName = conn.connection.name;
      console.log(`✅ [Localhost MongoDB Connected]: ${conn.connection.host}:${conn.connection.port || 27017} / Database: ${conn.connection.name}`);
      return conn;
    } catch (localErr) {
      console.warn(`⚠️ [Localhost MongoDB Not Available]: ${localErr.message}`);
      console.warn(`🔄 Falling back to MongoDB Atlas Cloud so development is uninterrupted...`);
      try {
        const conn = await mongoose.connect(ATLAS_URI);
        activeDbInfo.type = 'MongoDB Atlas (Cloud Fallback)';
        activeDbInfo.host = conn.connection.host;
        activeDbInfo.dbName = conn.connection.name;
        console.log(`✅ [MongoDB Atlas Connected (Fallback)]: ${conn.connection.host} / Database: ${conn.connection.name}`);
        return conn;
      } catch (atlasErr) {
        console.error(`❌ [MongoDB Atlas Fallback Error]: ${atlasErr.message}`);
        process.exit(1);
      }
    }
  }
};

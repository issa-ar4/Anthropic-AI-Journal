/**
 * Test Setup File
 * Runs before all tests to ensure proper environment configuration
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

// Verify required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ANTHROPIC_API_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`⚠️  Warning: Missing environment variables: ${missingVars.join(', ')}`);
  console.warn('Some tests may fail without proper configuration.');
}

// Set test environment
process.env.NODE_ENV = 'test';

console.log('🔧 Test environment configured');
console.log(`📍 API URL: ${process.env.API_URL || 'http://localhost:5000'}`);
console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
console.log(`🤖 Claude API: ${process.env.ANTHROPIC_API_KEY ? 'Configured' : 'Not configured'}`);

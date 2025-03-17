const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.test') });

if (process.env.DB_NAME !== 'testdb' && process.env.TEST_DB_NAME !== 'testdb') {
  throw new Error("⚠️  Tests must use 'testdb'! Check your .env.test configuration.");
}

console.log("✅ Test environment loaded. Using database:", process.env.TEST_DB_NAME);

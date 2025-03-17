const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? path.resolve(__dirname, '../.env.test') : path.resolve(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_NAME : process.env.DB_NAME,
  password: process.env.DB_PASSWORD, //.replace(/['"]/g, ""),
  port: process.env.DB_PORT || 5432,
});

console.log(`🔍 Using Database: ${process.env.NODE_ENV === 'test' ? process.env.TEST_DB_NAME : process.env.DB_NAME}`);
console.log(`🔍 NODE_ENV: ${process.env.NODE_ENV}`);

module.exports = pool;

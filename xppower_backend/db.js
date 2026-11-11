// xppower_backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'xppower_db', // Thống nhất dùng chung một tên database
  password: '123',
  port: 5432,
});

module.exports = pool;
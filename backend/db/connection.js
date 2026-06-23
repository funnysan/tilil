// =============================================
// TASKFLOW - db/connection.js
// This file creates ONE shared database connection
// that all route files can import and reuse.
//
// TODO : Read about connection pooling:
// https://www.npmjs.com/package/mysql2#using-connection-pools
// =============================================

const mysql = require('mysql2/promise');

// These values come from your .env file — never hardcode passwords!
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'taskmanager',
  waitForConnections: true,
  connectionLimit:    10,  // max simultaneous connections
});

// Test the connection when the server starts
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release(); // always release connections back to the pool!
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Check your .env file and make sure MySQL is running.');
  });

module.exports = pool;

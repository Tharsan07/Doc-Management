const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initTables() {
  const conn = await pool.getConnection();
  try {
    // Create companies table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL
      )
    `);

    // Create assemblies table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS assemblies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL
      )
    `);

    // ✅ Create metadata table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS metadata (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fileName VARCHAR(255) NOT NULL,
        filePath VARCHAR(255) NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        type ENUM('file','folder') DEFAULT 'file',
        fileId INT,
        INDEX(fileId)
      )
    `);

    console.log("Tables initialized successfully!");
  } catch (err) {
    console.error("Error initializing tables:", err);
  } finally {
    conn.release();
  }
}

// Run immediately if this file is executed directly
if (require.main === module) {
  initTables().then(() => process.exit(0));
}

// Export the function to use in other files
module.exports = { initTables };

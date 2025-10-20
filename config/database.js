const mysql = require('mysql2');
require('dotenv').config();

let connection;
let connectionAttempts = 0;
const maxAttempts = 10;

const connectDB = () => {
  connection = mysql.createConnection({
    host: process.env.DB_HOST || 'mysql',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Eklakalam@7070',
    database: process.env.DB_NAME || 'tasktrax_db',
    connectTimeout: 60000
  });

  connection.connect((err) => {
    if (err) {
      connectionAttempts++;
      console.error(`Database connection failed (attempt ${connectionAttempts}/${maxAttempts}):`, err.message);
      
      if (connectionAttempts < maxAttempts) {
        console.log('Retrying in 5 seconds...');
        setTimeout(connectDB, 5000);
      } else {
        console.error('Max connection attempts reached. Please check MySQL service.');
      }
      return;
    }

    console.log('✅ Connected to MySQL database');
    connectionAttempts = 0; // Reset counter on success
    
    // Create table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    connection.execute(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('✅ Tasks table ready');
      }
    });
  });

  // Handle connection errors after initial connect
  connection.on('error', (err) => {
    console.error('Database connection error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Reconnecting to database...');
      connectDB();
    }
  });
};

// Start connection
connectDB();

module.exports = connection;
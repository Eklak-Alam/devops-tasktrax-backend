const mysql = require('mysql2');
require('dotenv').config();

let connection;
let connectionAttempts = 0;
const maxAttempts = 10;

const connectDB = () => {
  console.log(`🔄 Database connection attempt ${connectionAttempts + 1}/${maxAttempts}`);
  
  connection = mysql.createConnection({
    host: process.env.DB_HOST || 'mysql',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Eklakalam@7070',
    database: process.env.DB_NAME || 'tasktrax_db',
    connectTimeout: 60000,
    timeout: 60000,
    charset: 'utf8mb4'
  });

  connection.connect((err) => {
    if (err) {
      connectionAttempts++;
      console.error(`❌ Database connection failed (attempt ${connectionAttempts}/${maxAttempts}):`, err.message);
      
      if (connectionAttempts < maxAttempts) {
        console.log('⏳ Retrying in 5 seconds...');
        setTimeout(connectDB, 5000);
      } else {
        console.error('💥 Max connection attempts reached. Please check MySQL service.');
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;

    connection.execute(createTableQuery, (err) => {
      if (err) {
        console.error('❌ Error creating table:', err);
      } else {
        console.log('✅ Tasks table ready');
        
        // Test the connection with a sample query
        connection.execute('SELECT COUNT(*) as task_count FROM tasks', (err, results) => {
          if (err) {
            console.error('❌ Test query failed:', err);
          } else {
            console.log(`📊 Database test successful. Found ${results[0].task_count} tasks`);
          }
        });
      }
    });
  });

  // Handle connection errors after initial connect
  connection.on('error', (err) => {
    console.error('❌ Database connection error:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('🔄 Connection lost. Reconnecting...');
      connectDB();
    }
  });
};

// Start connection
console.log('🚀 Initializing database connection...');
connectDB();

module.exports = connection;
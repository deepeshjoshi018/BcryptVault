const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // <-- yahan apna MySQL username likhein
  password: 'your_password', // <-- yahan apna MySQL password likhein
  database: 'your_db_name' // <-- yahan apna database name likhein
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected!');
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'TechVault Backend Server is running!' });
});

// Signup endpoint (user registration)
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      return res.status(500).json({ success: false, message: 'Database error', error: err });
    }
    res.json({ success: true, message: 'Signup successful', id: result.insertId });
  });
});

// Login endpoint (user login)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err });
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.json({ success: true, message: 'Login successful', user: results[0] });
  });
});

// Get all users (for testing)
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    users: users.map(user => ({
      name: user.name,
      email: user.email
    }))
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   POST http://localhost:${PORT}/api/login`);
  console.log(`   POST http://localhost:${PORT}/api/signup`);
  console.log(`   GET  http://localhost:${PORT}/api/users`);
}); 
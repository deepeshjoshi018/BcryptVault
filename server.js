const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_mysql_password', // <-- yahan apna MySQL password daalein
  database: 'users'
});
db.connect((err) => {
  if (err) throw err;
  console.log('MySQL Connected!');
});

// Signup API
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Signup successful' });
    });
  });
});

// Login API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(401).json({ error: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // JWT Token
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, name: user.name });
  });
});

// Get user info from token
app.get('/api/user', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.json({ name: 'Guest' });
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    res.json({ name: decoded.name });
  } catch {
    res.json({ name: 'Guest' });
  }
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
}); 
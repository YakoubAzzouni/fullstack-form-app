
const express = require('express');
const cors = require ('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

//JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

//Middleware
app.use(cors());
app.use(express.json());

//Create database table
const initDB = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        age INTEGER,
        phone VARCHAR(20),
        city VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      );
      console.log('databse intialized');
    } catch (err){
        console.error('database initialization error:',err);
    }
};

//JWT auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.status(401).json({error: 'Access token required'});
    
    jwt.verify(token, JWT_SECRET, (err,user) => {
        if (err) return res.status(403).json({error: 'Invalid token'});

        req.user = user;
        next();
    });
};

//verify status of backend api
app.get('/status', (req, res) => {
    res.json({status: 'OK', timestamp: new Date().toISOString() })
});

//signup
app.post('/api/auth/signup', async(req,res) => {
    try {
        const { firstName, lastName, email, age, phone, city, password } = req.body;
        if(!firstName || !lastName || !email || !password) 
            return res.status(400).json({ error: 'Required fields missing' });

        const existingUser = await pool.query('SELECT id FROM users where email=$1', [email]);
        if(existingUser.rows.length > 0 )
            return res.status(400).json({error: 'email already registered'});

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, email, age, phone, city, password) 
            VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, first_name, last_name, email, age, phone, city, created_at`,
            [firstName, lastName, email, age || null, phone || null, city || null, hashedPassword]     
        );

        const user = result.rows[0];
        const token = jwt.sign({userId: user.id, email: user.email}, JWT_SECRET, {expiresIn : '24h'}
        );

        res.status(201).json({ message: 'User created successfully', token, user });

    } catch (err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Sign in
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({message: 'Login successful', token, user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//profile (authenticated user)
app.route('/api/auth/profile')
  .get(authenticateToken, async (req, res) => {
    try {

      const result = await pool.query(
        'SELECT id, first_name, last_name, email, age, phone, city, created_at FROM users WHERE id=$1',
        [req.user.userId]
      );
      if (!result.rows.length) return res.status(404).json({ error: 'User not found' });

      res.json({ user: result.rows[0] });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  })
  .put(authenticateToken, async (req, res) => {
    try {

      const { firstName, lastName, age, phone, city } = req.body;

      const result = await pool.query(
        `UPDATE users SET first_name=$1,last_name=$2,age=$3,phone=$4,city=$5,updated_at=CURRENT_TIMESTAMP
         WHERE id=$6 RETURNING id, first_name, last_name, email, age, phone, city, created_at, updated_at`,
        [firstName, lastName, age || null, phone || null, city || null, req.user.userId]
      );
      if (!result.rows.length) return res.status(404).json({ error: 'User not found' });

      res.json({ message: 'Profile updated', user: result.rows[0] });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  })
  .delete(authenticateToken, async (req, res) => {
    try {

      await pool.query('DELETE FROM users WHERE id=$1', [req.user.userId]);
      res.json({ message: 'Account deleted successfully' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

// Start server 
app.listen(port, async () => {
  console.log(` Server running on port ${port}`);
  await initDB();
});
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, userType = 'farmer' } = req.body;
    
    // Check if user exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      `INSERT INTO users (name, email, password, phone, user_type)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone, userType]
    );
    
    res.json({ 
      id: result.id,
      message: 'User registered successfully',
      name,
      email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Don't send password back
    delete user.password;
    
    res.json({ 
      message: 'Login successful',
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await db.get(
      'SELECT id, name, email, phone, user_type, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

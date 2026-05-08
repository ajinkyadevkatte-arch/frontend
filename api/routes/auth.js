const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Hardcoded admin login for demo purposes
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
    res.json({ token, user: { username, role: 'admin' } });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;

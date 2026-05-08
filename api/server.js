const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('Investor CRM Backend API is running!'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/investors', require('./routes/investors'));
app.use('/api/telegram', require('./routes/telegram'));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/investor_crm')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

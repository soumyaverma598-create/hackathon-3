require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const { verifyToken } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use(express.json()); // Built-in parsing for incoming requests

// Routes
app.use('/api/auth', authRoutes);

// Example protected route requiring JWT
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({
    message: 'Welcome to the protected route! You have been verified.',
    user: req.user
  });
});

// Root fallback
app.get('/', (req, res) => {
  res.send('PARIVESH 3.0 Backend API is running.');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

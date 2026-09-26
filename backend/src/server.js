require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api', require('./routes/foodRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'NutriShield API', version: '1.0.0' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`NutriShield API running on http://localhost:${PORT}`);
  console.log(`LLM: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured (fallback mode)'}`);
});

module.exports = app;

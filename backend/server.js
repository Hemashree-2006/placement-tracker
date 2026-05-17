require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/students',     require('./routes/students'));
app.use('/api/companies',    require('./routes/companies'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/sessions',     require('./routes/sessions'));

// ── Health Check ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: '🎓 Placement Tracker API is running.' });
});

// ── 404 Handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start Server (async so DB is ready before accepting requests) ────
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // 1. Authenticate DB connection
    await connectDB();

    // 2. Register models & associations
    require('./models');

    // 3. Sync schema — create missing tables without touching existing ones.
    //    alter:true fails on SQLite when FK constraints are active + data exists.
    await sequelize.sync({ force: false });
    console.log('✅ DB Sync complete.');

    // 4. Only start listening after DB is ready
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
})();


process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION - shutting down', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason && reason.stack ? reason.stack : reason);
});

require('dotenv').config();
require('reflect-metadata');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AppDataSource = require('./data-source');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('static'));

app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log(`[REQ] ${req.method} ${req.originalUrl} - body:`, req.body);
  } else {
    console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  }
  next();
});

app.get('/', (req, res) => res.send('TypeORM Auth API running'));
app.use('/api/auth', authRoutes);
app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ message: 'protected', user: req.user });
});

(async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Data Source initialized');
    } else {
      console.log('Data Source already initialized');
    }
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (err) {
    console.error('Error during Data Source initialization:', err && err.stack ? err.stack : err);
  }
})();

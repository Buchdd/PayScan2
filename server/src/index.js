import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js'; // импорт пула соединений

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Проверка подключения к базе данных
app.get('/api/db-health', async (_req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({
      status: 'ok',
      message: 'Database connection successful',
      data: result
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Пример endpoint с использованием базы данных
app.get('/api/users', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users LIMIT 10');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Остальные маршруты (оставляем ваши существующие)
const mockUser = {
  id: 'user-001',
  name: 'Александр Петров',
  streams: [
    {
      id: 'stream-personal',
      type: 'personal',
      label: 'Физические лица',
      tenants: [
        {
          id: 'tenant-personal',
          title: 'Личный кабинет',
          wallets: [
            { id: 'w-rub', currency: 'RUB', balance: 152340.5 },
            { id: 'w-thb', currency: 'THB', balance: 90210 },
          ],
        },
      ],
    },
    {
      id: 'stream-b2b',
      type: 'b2b',
      label: 'Юридические лица',
      tenants: [
        {
          id: 'tenant-partner',
          title: 'ООО «ПэйСкан Азия»',
          wallets: [
            { id: 'w-rub-biz', currency: 'RUB', balance: 2350000 },
            { id: 'w-cny', currency: 'CNY', balance: 783000 },
          ],
        },
      ],
    },
  ],
};

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'PayScan shell API is ready',
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  res.json({
    token: 'demo-token',
    user: { ...mockUser, email: email || 'user@example.com' },
  });
});

app.get('/api/streams', (_req, res) => {
  res.json(mockUser.streams);
});

app.post('/api/transfers', (req, res) => {
  res.json({
    status: 'queued',
    transfer: req.body,
    reference: `TRX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
});
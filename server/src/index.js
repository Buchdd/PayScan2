import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js'; // импорт пула соединений
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем текущую директорию ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем .env из корневой директории проекта
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

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

// Удалите этот endpoint - он ищет таблицу users которой нет
// app.get('/api/users', async (_req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT * FROM users LIMIT 10');
//     res.json(rows);
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// Удалите mockUser - он больше не нужен
// const mockUser = {...};

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'PayScan shell API is ready',
  });
});

// Реальная авторизация
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email и пароль обязательны'
      });
    }

    console.log('Login attempt:', { email }); // Для отладки

    // Поиск пользователя в БД
    const [users] = await pool.query(
      'SELECT client_id, first_name, last_name, email, phone, country, password_hash, status FROM clients WHERE email = ?',
      [email]
    );

    console.log('Found users:', users.length); // Для отладки

    if (users.length === 0) {
      console.log('User not found for email:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Пользователь не найден'
      });
    }

    const user = users[0];
    console.log('User found:', { 
      id: user.client_id, 
      email: user.email,
      password_hash: user.password_hash ? 'set' : 'empty'
    });

    // Проверка статуса
    if (user.status !== 'active') {
      return res.status(403).json({
        status: 'error',
        message: `Аккаунт ${user.status === 'suspended' ? 'заблокирован' : 'неактивен'}`
      });
    }

    // РЕАЛЬНАЯ проверка пароля
    let isValid = false;
    
    if (user.password_hash) {
      // Если пароль хеширован
      try {
        // Проверяем пароль напрямую (предполагая, что в БД пароль в чистом виде для теста)
        // В реальном приложении здесь должно быть: await bcrypt.compare(password, user.password_hash)
        isValid = password === user.password_hash;
        console.log('Password check result:', isValid);
      } catch (hashError) {
        console.error('Password hash error:', hashError);
        isValid = false;
      }
    } else {
      // Если пароль не установлен
      console.log('No password hash in DB');
    }
    
    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Неверный пароль'
      });
    }

    // Получаем кошельки пользователя
    const [wallets] = await pool.query(
      'SELECT * FROM client_wallets WHERE client_id = ? AND is_active = TRUE',
      [user.client_id]
    );

    console.log('User wallets:', wallets.length);

    // Формируем ответ в формате клиента
    const userData = {
      id: user.client_id,
      client_id: user.client_id,
      name: `${user.first_name} ${user.last_name}`,
      full_name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      phone: user.phone || '',
      country: user.country || 'Russia',
      status: user.status,
      streams: formatUserStreams(wallets, user)
    };

    // Генерируем токен
    const token = generateToken(user);

    res.json({
      status: 'success',
      token,
      user: userData,
      message: 'Авторизация успешна'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка сервера при авторизации',
      error: error.message
    });
  }
});

// Форматирование потоков пользователя
function formatUserStreams(wallets, user) {
  const streams = [];
  
  // Персональные кошельки
  const personalWallets = wallets.filter(w => w.wallet_type === 'main');
  if (personalWallets.length > 0) {
    streams.push({
      id: 'stream-personal',
      type: 'personal',
      label: 'Физические лица',
      tenants: [{
        id: `tenant-${user.client_id}`,
        title: 'Личный кабинет',
        client_id: user.client_id,
        wallets: personalWallets.map(w => ({
          id: `w-${w.wallet_id}`,
          wallet_id: w.wallet_id,
          client_id: w.client_id,
          currency_code: w.currency_code,
          balance: parseFloat(w.balance),
          wallet_type: w.wallet_type,
          is_active: w.is_active,
          label: `${w.currency_code} кошелёк`
        }))
      }]
    });
  }

  // Бизнес кошельки
  const businessWallets = wallets.filter(w => w.wallet_type === 'business');
  if (businessWallets.length > 0) {
    streams.push({
      id: 'stream-business',
      type: 'business',
      label: 'Юридические лица',
      tenants: businessWallets.reduce((acc, wallet) => {
        // Группируем по клиенту (в будущем можно по компании)
        const tenantId = `tenant-business-${wallet.client_id}`;
        let tenant = acc.find(t => t.id === tenantId);
        
        if (!tenant) {
          tenant = {
            id: tenantId,
            title: user.company_name || `Бизнес ${user.first_name}`,
            client_id: wallet.client_id,
            wallets: []
          };
          acc.push(tenant);
        }
        
        tenant.wallets.push({
          id: `w-${wallet.wallet_id}`,
          wallet_id: wallet.wallet_id,
          client_id: wallet.client_id,
          currency_code: wallet.currency_code,
          balance: parseFloat(wallet.balance),
          wallet_type: wallet.wallet_type,
          is_active: wallet.is_active,
          label: `${wallet.currency_code} бизнес`
        });
        
        return acc;
      }, [])
    });
  }

  // Сберегательные кошельки
  const savingsWallets = wallets.filter(w => w.wallet_type === 'savings');
  if (savingsWallets.length > 0) {
    streams.push({
      id: 'stream-savings',
      type: 'savings',
      label: 'Сбережения',
      tenants: [{
        id: `tenant-savings-${user.client_id}`,
        title: 'Накопительный счёт',
        client_id: user.client_id,
        wallets: savingsWallets.map(w => ({
          id: `w-${w.wallet_id}`,
          wallet_id: w.wallet_id,
          client_id: w.client_id,
          currency_code: w.currency_code,
          balance: parseFloat(w.balance),
          wallet_type: w.wallet_type,
          is_active: w.is_active,
          label: `${w.currency_code} накопительный`
        }))
      }]
    });
  }

  return streams;
}

// Генерация токена (упрощенная)
function generateToken(user) {
  const payload = {
    sub: user.client_id,
    email: user.email,
    name: `${user.first_name} ${user.last_name}`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 часа
  };
  
  // В реальном приложении используйте JWT
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Получение потоков (реальный endpoint)
app.get('/api/streams', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Требуется авторизация'
      });
    }

    // Декодируем токен (в реальности проверяем подпись)
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const clientId = decoded.sub;

    // Получаем кошельки пользователя
    const [wallets] = await pool.query(
      'SELECT * FROM client_wallets WHERE client_id = ? AND is_active = TRUE',
      [clientId]
    );

    // Получаем данные пользователя
    const [users] = await pool.query(
      'SELECT * FROM clients WHERE client_id = ?',
      [clientId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Пользователь не найден'
      });
    }

    const user = users[0];
    const streams = formatUserStreams(wallets, user);

    res.json({
      status: 'success',
      data: streams
    });

  } catch (error) {
    console.error('Error fetching streams:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при загрузке потоков',
      error: error.message
    });
  }
});

// Endpoint для списка клиентов (для админки)
app.get('/api/clients', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT client_id, first_name, last_name, email, phone, country, status FROM clients LIMIT 10'
    );
    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при загрузке клиентов',
      error: error.message
    });
  }
});

// Создание перевода
app.post('/api/transfers', async (req, res) => {
  try {
    const { fromWallet, toWallet, amount, memo } = req.body;
    
    // Здесь будет логика создания перевода в БД
    // Пока возвращаем успешный ответ
    
    res.json({
      status: 'success',
      data: {
        reference: `TRX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        transfer: req.body
      },
      message: 'Перевод создан успешно'
    });
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при создании перевода',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
});
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/database/db');

// Импорт роутов
const excursionsRouter = require('./src/routes/excursions');
const bookingsRouter = require('./src/routes/bookings');
const reviewsRouter = require('./src/routes/reviews');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5500',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Статические файлы
app.use('/public', express.static('public'));

// ====== БАЗОВЫЕ ENDPOINTS ======

// 1. Проверка здоровья API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API системы записи на экскурсии работает',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: 'PostgreSQL'
    });
});

// 2. Проверка подключения к БД
app.get('/api/db-check', async (req, res) => {
    try {
        const isConnected = await db.checkConnection();
        if (isConnected) {
            res.json({ 
                status: 'success', 
                message: 'База данных подключена',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({ 
                status: 'error', 
                message: 'Нет подключения к БД' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
});

// ====== ОСНОВНЫЕ РОУТЫ ======

// Экскурсии
app.use('/api/excursions', excursionsRouter);

// Записи
app.use('/api/bookings', bookingsRouter);

// Отзывы
app.use('/api/reviews', reviewsRouter);

// ====== ОБРАБОТКА ОШИБОК ======

// Обработка 404
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Маршрут не найден',
        available_endpoints: [
            'GET  /api/health',
            'GET  /api/db-check',
            'GET  /api/excursions',
            'GET  /api/excursions/:id',
            'GET  /api/excursions/:id/availability',
            'POST /api/bookings',
            'GET  /api/bookings/excursion/:excursion_id',
            'GET  /api/reviews',
            'POST /api/reviews',
            'GET  /api/reviews/stats'
        ]
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Необработанная ошибка:', err);
    res.status(500).json({
        status: 'error',
        message: 'Внутренняя ошибка сервера'
    });
});

// ====== ЗАПУСК СЕРВЕРА ======
const startServer = async () => {
    try {
        // Проверяем подключение к БД
        console.log('🔍 Проверка подключения к PostgreSQL...');
        const dbConnected = await db.checkConnection();
        
        if (!dbConnected) {
            console.log('⚠️  Внимание: нет подключения к БД, но сервер запускается');
        }
        
        app.listen(PORT, () => {
            console.log(`\n🚀 СЕРВЕР ЗАПУЩЕН УСПЕШНО!`);
            console.log(`========================================`);
            console.log(`📍 Локальный адрес: http://localhost:${PORT}`);
            console.log(`📊 Проверка API:     http://localhost:${PORT}/api/health`);
            console.log(`🗄️  Проверка БД:      http://localhost:${PORT}/api/db-check`);
            console.log(`🗓️  Список экскурсий: http://localhost:${PORT}/api/excursions`);
            console.log(`💬 Список отзывов:   http://localhost:${PORT}/api/reviews`);
            console.log(`========================================`);
            console.log(`⚡ Режим: ${process.env.NODE_ENV}`);
            console.log(`🕐 ${new Date().toLocaleString()}`);
        });
        
    } catch (error) {
        console.error('❌ Ошибка запуска сервера:', error);
        process.exit(1);
    }
};

// Обработка graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Остановка сервера...');
    await db.close();
    console.log('👋 До свидания!');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Остановка сервера...');
    await db.close();
    process.exit(0);
});

startServer();
const { Pool } = require('pg');
require('dotenv').config();

// Простой пул подключений
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Проверка подключения
async function checkConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ PostgreSQL подключен');
        return true;
    } catch (error) {
        console.error('❌ Ошибка PostgreSQL:', error.message);
        return false;
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    checkConnection
};
require('dotenv').config();
const { Pool } = require('pg');

console.log('=== ФИНАЛЬНАЯ ПРОВЕРКА ===\n');
console.log('Конфигурация из .env:');
console.log(`Порт: ${process.env.DB_PORT}`);
console.log(`БД: ${process.env.DB_NAME}`);
console.log(`Пользователь: ${process.env.DB_USER}`);
console.log(`Пароль: ${process.env.DB_PASSWORD ? '***установлен***' : '❌ НЕ УСТАНОВЛЕН'}`);

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function check() {
    try {
        console.log('\n1. Подключение к БД...');
        await pool.query('SELECT 1');
        console.log('✅ УСПЕШНО!');
        
        console.log('\n2. Проверка таблиц...');
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log(`Найдено таблиц: ${tables.rows.length}`);
        tables.rows.forEach(t => console.log(` - ${t.table_name}`));
        
        if (tables.rows.length >= 3) {
            console.log('\n🎉 ВСЁ ГОТОВО!');
            console.log('Запускайте сервер: npm run dev');
            console.log('Проверьте: http://localhost:3000/api/excursions');
        } else {
            console.log('\n⚠️  Таблиц мало, нужно создать');
        }
        
    } catch (error) {
        console.log('\n❌ ОШИБКА:', error.message);
        console.log('\nВозможные причины:');
        console.log('1. Неправильный порт в .env');
        console.log('2. Неправильный пароль');
        console.log('3. БД не существует на этом порту');
    } finally {
        await pool.end();
    }
}

check();
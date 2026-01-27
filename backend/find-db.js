const { Pool } = require('pg');

const ports = [5432, 5433, 5434];
const password = '11111'; 

async function findDatabase() {
    console.log('🔍 Поиск БД factory_website_db на всех портах...\n');
    
    for (const port of ports) {
        console.log(`Порт ${port}:`);
        
        // Пробуем подключиться к стандартной БД postgres
        const pool = new Pool({
            host: 'localhost',
            port: port,
            database: 'postgres',
            user: 'postgres',
            password: password,
            connectionTimeoutMillis: 2000
        });
        
        try {
            // Проверяем подключение
            await pool.query('SELECT 1');
            
            // Ищем нашу БД
            const result = await pool.query(`
                SELECT datname FROM pg_database 
                WHERE datname = 'factory_website_db'
            `);
            
            if (result.rows.length > 0) {
                console.log(`  ✅ БД factory_website_db НАЙДЕНА на порту ${port}!`);
                
                // Проверяем таблицы
                const pool2 = new Pool({
                    host: 'localhost',
                    port: port,
                    database: 'factory_website_db',
                    user: 'postgres',
                    password: password
                });
                
                try {
                    const tables = await pool2.query(`
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public'
                    `);
                    
                    console.log(`  📊 Таблиц в БД: ${tables.rows.length}`);
                    tables.rows.forEach(t => console.log(`     - ${t.table_name}`));
                    
                    await pool2.end();
                    console.log(`\n🎯 ИСПОЛЬЗУЙТЕ ЭТОТ ПОРТ В .env ФАЙЛЕ:`);
                    console.log(`DB_PORT=${port}`);
                    return port; // Нашли, выходим
                    
                } catch (err) {
                    console.log(`  ❌ Ошибка подключения к БД: ${err.message}`);
                }
                
            } else {
                console.log(`  ❌ БД factory_website_db НЕ НАЙДЕНА`);
            }
            
        } catch (error) {
            console.log(`  ❌ Не удалось подключиться к порту: ${error.message}`);
        } finally {
            await pool.end();
        }
        console.log('');
    }
    
    console.log('❌ БД factory_website_db не найдена ни на одном порту!');
    console.log('\nСоздайте БД через pgAdmin:');
    console.log('1. Откройте pgAdmin');
    console.log('2. Выберите любой сервер PostgreSQL');
    console.log('3. Правой кнопкой на Databases → Create → Database');
    console.log('4. Имя: factory_website_db');
    return null;
}

findDatabase();
const { Pool } = require("pg");

const ports = [5432, 5433, 5434];
const password = "ваш_пароль"; // ЗАМЕНИТЕ НА ВАШ ПАРОЛЬ!

async function testVersion(port) {
    console.log(`\n🔍 Тест порта ${port}...`);

    const config = {
        host: "localhost",
        port: port,
        database: "postgres", // стандартная БД
        user: "postgres",
        password: password,
        connectionTimeoutMillis: 2000
    };

    try {
        const pool = new Pool(config);
        const result = await pool.query("SELECT version() as version");
        await pool.end();

        const version = result.rows[0].version;
        console.log(`✅ Порт ${port}: ${version.split(' ')[0]} ${version.split(' ')[1]}`);

        // Проверим есть ли наша БД
        const pool2 = new Pool({ ...config, database: "factory_website_db" });
        try {
            await pool2.query("SELECT 1");
            console.log(`   📁 БД factory_website_db СУЩЕСТВУЕТ`);
            return { port: port, version: version, dbExists: true };
        } catch (dbError) {
            if (dbError.message.includes("does not exist")) {
                console.log(`   ❌ БД factory_website_db НЕ СУЩЕСТВУЕТ`);
                return { port: port, version: version, dbExists: false };
            }
            throw dbError;
        } finally {
            await pool2.end();
        }

    } catch (error) {
        console.log(`❌ Порт ${port} ошибка: ${error.message}`);
        return { port: port, version: null, dbExists: false };
    }
}

async function main() {
    console.log("Определение версий PostgreSQL на портах...");
    console.log("===========================================");

    const results = [];
    for (const port of ports) {
        results.push(await testVersion(port));
    }

    console.log("\n🎯 РЕКОМЕНДАЦИИ:");
    console.log("================");

    // Найдем порт с PostgreSQL 16 (скорее всего 5432)
    const pg16 = results.find(r => r.version && r.version.includes("16"));
    const pg17 = results.find(r => r.version && r.version.includes("17"));
    const pg18 = results.find(r => r.version && r.version.includes("18"));

    if (pg18 && pg18.dbExists) {
        console.log("1. Используйте PostgreSQL 18 (порт 5434) - БД уже существует");
        console.log(`   В .env укажите: DB_PORT=5434`);
    } else if (pg18) {
        console.log("2. Используйте PostgreSQL 18 (порт 5434) - но нужно создать БД");
        console.log(`   В .env укажите: DB_PORT=5434`);
        console.log(`   Затем создайте БД factory_website_db`);
    } else if (pg16 && pg16.dbExists) {
        console.log("3. Используйте PostgreSQL 16 (порт 5432) - БД уже существует");
        console.log(`   В .env укажите: DB_PORT=5432`);
    } else {
        console.log("4. Выберите любой работающий порт и создайте БД");
        const working = results.filter(r => r.version);
        if (working.length > 0) {
            console.log(`   Работающие порты: ${working.map(w => w.port).join(', ')}`);
        }
    }
}

main();
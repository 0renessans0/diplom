DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS excursions CASCADE;


CREATE TABLE excursions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL DEFAULT 'Экскурсия на производство',
    excursion_date DATE NOT NULL DEFAULT CURRENT_DATE + 3,
    start_time TIME NOT NULL DEFAULT '10:00',
    max_visitors INTEGER NOT NULL DEFAULT 15,
    booked_count INTEGER DEFAULT 0,
    meeting_point VARCHAR(200) DEFAULT 'Главный вход',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    excursion_id INTEGER NOT NULL REFERENCES excursions(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    visitors_count INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(excursion_id, phone) 
);


CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    review_text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





INSERT INTO excursions (title, excursion_date, start_time, max_visitors) VALUES
('Экскурсия по хлебозаводу', CURRENT_DATE + 2, '10:00', 12),
('Технологический тур', CURRENT_DATE + 4, '14:00', 10),
('Семейная экскурсия', CURRENT_DATE + 7, '11:00', 15);


INSERT INTO bookings (excursion_id, full_name, phone, visitors_count, status) VALUES
(1, 'Иванов Алексей', '+79161234567', 2, 'confirmed'),
(1, 'Петрова Мария', '+79031112233', 1, 'confirmed'),
(2, 'Сидоров Иван', '+79219998877', 3, 'pending');


INSERT INTO reviews (author_name, review_text, rating, is_approved) VALUES
('Анна К.', 'Отличная экскурсия! Все очень понравилось.', 5, TRUE),
('Сергей М.', 'Интересно, познавательно. Рекомендую.', 4, TRUE),
('Ольга В.', 'Хорошая организация, все понравилось.', 5, TRUE),
('Гость', 'Не понравилось', 2, FALSE); -- не одобрен



SELECT '✅ БАЗА ДАННЫХ ГОТОВА!' as сообщение;

SELECT '=== СТАТИСТИКА ===' as раздел;
SELECT 'Экскурсий:' as показатель, COUNT(*) as значение FROM excursions
UNION ALL
SELECT 'Записей:', COUNT(*) FROM bookings
UNION ALL
SELECT 'Отзывов:', COUNT(*) FROM reviews
UNION ALL
SELECT 'Одобренных отзывов:', COUNT(*) FROM reviews WHERE is_approved = TRUE;

SELECT '=== ПЕРВЫЕ 2 ЭКСКУРСИИ ===' as раздел;
SELECT id, title, excursion_date, start_time, max_visitors, booked_count 
FROM excursions 
ORDER BY excursion_date;

SELECT '=== API БУДЕТ РАБОТАТЬ ПО АДРЕСАМ ===' as раздел;
SELECT 'http://localhost:3000/api/excursions' as endpoint
UNION ALL
SELECT 'http://localhost:3000/api/reviews'
UNION ALL
SELECT 'http://localhost:3000/api/bookings (POST запрос)';
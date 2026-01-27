const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Создать новую запись
router.post('/', async (req, res) => {
    try {
        const { excursion_id, full_name, phone, email, visitors_count } = req.body;
        
        // Простая валидация
        if (!excursion_id || !full_name || !phone || !visitors_count) {
            return res.status(400).json({
                status: 'error',
                message: 'Не все обязательные поля заполнены'
            });
        }
        
        // Создание записи
        const query = `
            INSERT INTO bookings (excursion_id, full_name, phone, email, visitors_count, status)
            VALUES ($1, $2, $3, $4, $5, 'pending')
            RETURNING id, full_name, phone, visitors_count
        `;
        
        const result = await db.query(query, [
            excursion_id, 
            full_name, 
            phone, 
            email || null, 
            visitors_count
        ]);
        
        res.status(201).json({
            status: 'success',
            message: 'Запись успешно создана',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Ошибка при создании записи:', error);
        res.status(500).json({
            status: 'error',
            message: 'Ошибка сервера'
        });
    }
});

module.exports = router;
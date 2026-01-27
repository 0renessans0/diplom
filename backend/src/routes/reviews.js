const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Получить все одобренные отзывы
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                author_name,
                review_text,
                rating,
                TO_CHAR(created_at, 'DD.MM.YYYY') as date,
                is_featured
            FROM reviews 
            WHERE is_approved = TRUE
            ORDER BY created_at DESC
            LIMIT 20
        `;
        
        const result = await db.query(query);
        
        res.json({
            status: 'success',
            data: result.rows,
            count: result.rowCount
        });
        
    } catch (error) {
        console.error('Ошибка при получении отзывов:', error);
        res.status(500).json({
            status: 'error',
            message: 'Ошибка сервера'
        });
    }
});

// Добавить новый отзыв
router.post('/', async (req, res) => {
    try {
        const { author_name, review_text, rating } = req.body;
        
        // Простая валидация
        if (!author_name || !review_text || !rating) {
            return res.status(400).json({
                status: 'error',
                message: 'Не все обязательные поля заполнены'
            });
        }
        
        const query = `
            INSERT INTO reviews (author_name, review_text, rating, is_approved)
            VALUES ($1, $2, $3, FALSE)
            RETURNING id, author_name, rating
        `;
        
        const result = await db.query(query, [author_name, review_text, rating]);
        
        res.status(201).json({
            status: 'success',
            message: 'Отзыв отправлен на модерацию',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Ошибка при добавлении отзыва:', error);
        res.status(500).json({
            status: 'error',
            message: 'Ошибка сервера'
        });
    }
});

module.exports = router;
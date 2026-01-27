const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Получить все активные экскурсии
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                title,
                TO_CHAR(excursion_date, 'DD.MM.YYYY') as date,
                start_time as time,
                max_visitors,
                booked_count,
                (max_visitors - booked_count) as available_seats,
                meeting_point
            FROM excursions 
            WHERE is_active = TRUE 
                AND excursion_date >= CURRENT_DATE
            ORDER BY excursion_date, start_time
        `;
        
        const result = await db.query(query);
        
        res.json({
            status: 'success',
            data: result.rows,
            count: result.rowCount
        });
        
    } catch (error) {
        console.error('Ошибка при получении экскурсий:', error);
        res.status(500).json({
            status: 'error',
            message: 'Ошибка сервера'
        });
    }
});

module.exports = router;
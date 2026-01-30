// frontend/js/api.js - ОБНОВЛЕННАЯ ВЕРСИЯ
const API_BASE_URL = 'http://localhost:3000/api';

// Получить ID экскурсии по типу
function getExcursionId(tourType) {
    // Вам нужно знать ID ваших экскурсий в базе данных
    // Например: пиво = 1, квас = 2
    const excursionMap = {
        'beer': 1,  // ID пивной экскурсии
        'kvas': 2   // ID квасной экскурсии
    };
    return excursionMap[tourType] || 1;
}

async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// Функции для работы с экскурсиями
export const excursionsApi = {
    async getAll() {
        return await apiRequest('/excursions');
    },
    
    async getById(id) {
        return await apiRequest(`/excursions/${id}`);
    },
    
    async getAvailability(id, date) {
        const dateStr = date.toISOString().split('T')[0];
        return await apiRequest(`/excursions/${id}/availability?date=${dateStr}`);
    }
};

// Функции для работы с бронированиями
export const bookingsApi = {
    async create(bookingData) {
        // Преобразуем данные под ваш API
        const apiData = {
            excursion_id: getExcursionId(bookingData.tour),
            booking_date: bookingData.date,
            booking_time: bookingData.time,
            visitor_name: bookingData.name,
            visitor_phone: bookingData.phone,
            visitor_email: bookingData.email,
            number_of_people: bookingData.peopleCount,
            status: 'pending'
        };
        
        return await apiRequest('/bookings', 'POST', apiData);
    },
    
    async getByExcursion(excursionId) {
        return await apiRequest(`/bookings/excursion/${excursionId}`);
    }
};

// Функции для работы с отзывами
export const reviewsApi = {
    async getAll() {
        return await apiRequest('/reviews');
    },
    
    async create(reviewData) {
        // Преобразуем данные под ваш API
        const apiData = {
            excursion_id: getExcursionId(reviewData.tour),
            visitor_name: reviewData.name,
            visitor_phone: reviewData.phone,
            review_text: reviewData.text,
            rating: reviewData.rating,
            review_date: new Date().toISOString().split('T')[0]
        };
        
        return await apiRequest('/reviews', 'POST', apiData);
    },
    
    async getStats() {
        return await apiRequest('/reviews/stats');
    }
};

// Проверка здоровья API
export const healthApi = {
    async check() {
        return await apiRequest('/health');
    },
    
    async checkDatabase() {
        return await apiRequest('/db-check');
    }
};
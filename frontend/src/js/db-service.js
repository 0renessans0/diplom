// СЕРВИС РАБОТЫ С ДАННЫМИ (ЗАМЕНЯЕТ БАЗУ ДАННЫХ)
class DatabaseService {
    constructor() {
        this.STORAGE_KEY = 'factory_tours_database_v2';
        this.initDatabase();
        console.log('📊 База данных инициализирована');
    }

    // Инициализация базы данных
    initDatabase() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            console.log('🆕 Создаем новую базу данных...');
            const database = {
                version: '2.0',
                createdAt: new Date().toISOString(),
                
                // Данные экскурсий
                tours: {
                    beer: this.createTourSlots('beer'),
                    kvas: this.createTourSlots('kvas')
                },
                
                // Отзывы
                reviews: [],
                
                // Бронирования
                bookings: [],
                
                // Статистика
                stats: {
                    totalBookings: 0,
                    totalReviews: 0,
                    beerBookings: 0,
                    kvasBookings: 0,
                    lastUpdate: new Date().toISOString()
                }
            };
            
            this.saveDatabase(database);
            console.log('✅ База данных создана');
        } else {
            console.log('✅ База данных загружена из localStorage');
        }
    }

    // Создание слотов для экскурсий
    createTourSlots(tourType) {
        const slots = {};
        const days = ['monday', 'wednesday', 'friday'];
        const times = tourType === 'beer' 
            ? ['12:00', '14:00', '16:00'] 
            : ['13:00', '15:00', '17:00'];

        days.forEach(day => {
            slots[day] = {};
            times.forEach(time => {
                slots[day][time] = {
                    seats: 15,               // 15 мест на КАЖДОЕ время в КАЖДЫЙ день
                    available: true,         // Доступно ли бронирование
                    bookings: [],            // Список бронирований для этого времени
                    lastBooking: null
                };
            });
        });

        return slots;
    }

    // Получение всей базы данных
    getDatabase() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : this.initDatabase();
    }

    // Сохранение базы данных
    saveDatabase(db) {
        db.stats.lastUpdate = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(db));
        console.log('💾 База данных сохранена');
    }

    // ===== ОСНОВНЫЕ МЕТОДЫ =====

    // Получение данных экскурсий в старом формате для совместимости
    getToursData() {
        const db = this.getDatabase();
        return {
            beerTours: db.tours.beer,
            kvasTours: db.tours.kvas
        };
    }

    // Получение доступных мест
    getAvailableSeats(tourType, day, time) {
        const db = this.getDatabase();
        
        if (!db.tours[tourType] || !db.tours[tourType][day] || !db.tours[tourType][day][time]) {
            console.error('Слот не найден:', { tourType, day, time });
            return 0;
        }
        
        return db.tours[tourType][day][time].seats;
    }

    // Бронирование
    bookTour(tourType, day, time, userData) {
        const db = this.getDatabase();
        
        if (!db.tours[tourType] || !db.tours[tourType][day] || !db.tours[tourType][day][time]) {
            return { success: false, message: 'Время не найдено' };
        }
        
        const slot = db.tours[tourType][day][time];
        const peopleCount = parseInt(userData.people) || 1;
        
        console.log(`Бронирование на ${peopleCount} человек:`, { tourType, day, time });
        
        if (slot.seats < peopleCount) {
            return { 
                success: false, 
                message: `Недостаточно мест. Осталось: ${slot.seats}, а вы хотите: ${peopleCount}` 
            };
        }
        
        if (peopleCount < 1 || peopleCount > 15) {
            return { 
                success: false, 
                message: 'Количество человек должно быть от 1 до 15' 
            };
        }
        
        // Создаем бронирование
        const bookingId = Date.now();
        const booking = {
            id: bookingId,
            tourType: tourType,
            day: day,
            time: time,
            user: {
                name: userData.name,
                phone: userData.phone,
                email: userData.email || '',
                people: peopleCount,
                bookingDate: new Date().toISOString()
            },
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        // Уменьшаем места на количество человек
        slot.seats -= peopleCount;
        if (slot.seats === 0) {
            slot.available = false;
        }
        slot.bookings.push(bookingId);
        slot.lastBooking = new Date().toISOString();
        
        // Сохраняем бронирование
        db.bookings.push(booking);
        db.stats.totalBookings += 1;
        if (tourType === 'beer') {
            db.stats.beerBookings += 1;
        } else {
            db.stats.kvasBookings += 1;
        }
        
        this.saveDatabase(db);
        
        console.log(`✅ Бронирование создано на ${peopleCount} человек. Осталось мест: ${slot.seats}`);
        
        return { 
            success: true, 
            bookingId: bookingId,
            seatsLeft: slot.seats,
            peopleBooked: peopleCount,
            message: `Бронирование успешно оформлено на ${peopleCount} человек`
        };
    }

    // Добавление отзыва
    addReview(reviewData) {
        const db = this.getDatabase();
        
        const review = {
            id: Date.now(),
            name: reviewData.name,
            phone: reviewData.phone,
            tour: reviewData.tour,
            text: reviewData.text,
            rating: reviewData.rating,
            date: reviewData.date,
            moderated: true,
            createdAt: new Date().toISOString()
        };
        
        db.reviews.push(review);
        db.stats.totalReviews += 1;
        
        this.saveDatabase(db);
        
        console.log('✅ Отзыв добавлен:', review.id);
        return true;
    }

    // Получение отзывов с пагинацией
    getReviews(limit = 5, offset = 0) {
        const db = this.getDatabase();
        const reviews = db.reviews
            .filter(review => review.moderated)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return reviews.slice(offset, offset + limit);
    }

    // Получение количества отзывов
    getReviewsCount() {
        const db = this.getDatabase();
        return db.reviews.filter(review => review.moderated).length;
    }

    // Получение статистики
    getStats() {
        const db = this.getDatabase();
        return db.stats;
    }

    // Получение всех бронирований
    getBookings() {
        const db = this.getDatabase();
        return db.bookings;
    }

    // Сброс данных (для тестирования)
    resetDatabase() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.initDatabase();
        console.log('🔄 База данных сброшена');
        return true;
    }

    // Экспорт данных (для админки)
    exportData() {
        return this.getDatabase();
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    const bookingCountInput = document.getElementById('bookingCount');
    
    if (!bookingForm) return;
    
    // Обработчик изменения количества человек
    if (bookingCountInput) {
        bookingCountInput.addEventListener('change', function() {
            const value = parseInt(this.value);
            if (value < 1) this.value = 1;
            if (value > 15) this.value = 15;
        });
    }
    
    // Обработка отправки формы бронирования
    bookingForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Получаем выбранные значения
        const selectedTour = document.querySelector('.tour-option.active')?.dataset.tour;
        const selectedDate = window.selectedDate; // Из calendar.js
        const selectedTime = window.selectedTime; // Из calendar.js
        
        // Проверяем, все ли данные выбраны
        if (!selectedTour || !selectedDate || !selectedTime) {
            showNotification('Пожалуйста, выберите экскурсию, дату и время', 'error');
            return;
        }
        
        // Собираем данные формы
        const formData = {
            tour: selectedTour,
            date: selectedDate.toISOString().split('T')[0],
            time: selectedTime,
            name: document.getElementById('bookingName').value,
            phone: document.getElementById('bookingPhone').value,
            email: document.getElementById('bookingEmail').value,
            peopleCount: parseInt(document.getElementById('bookingCount').value),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Валидация
        if (!validateBookingForm(formData)) {
            return;
        }
        
        // Проверка доступности мест
        try {
            const availability = await checkAvailability(formData);
            
            if (!availability.available || availability.availableSeats < formData.peopleCount) {
                showNotification(`Недостаточно мест. Доступно: ${availability.availableSeats}`, 'error');
                return;
            }
            
            // Создание бронирования
            const result = await createBooking(formData);
            
            if (result.success) {
                showNotification('Бронирование успешно создано!', 'success');
                // Можно перенаправить на страницу подтверждения
                // или показать детали бронирования
                setTimeout(() => {
                    showBookingConfirmation(result.bookingId, formData);
                }, 1500);
            } else {
                showNotification('Ошибка при создании бронирования', 'error');
            }
        } catch (error) {
            console.error('Booking error:', error);
            showNotification('Ошибка сети. Попробуйте позже.', 'error');
        }
    });
    
    // Проверка доступности мест
    async function checkAvailability(bookingData) {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tour: bookingData.tour,
                    date: bookingData.date,
                    time: bookingData.time
                })
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                // Моковая проверка
                return {
                    available: Math.random() > 0.5,
                    availableSeats: Math.floor(Math.random() * 16),
                    totalSeats: 15
                };
            }
        } catch (error) {
            // Моковая проверка при ошибке сети
            return {
                available: Math.random() > 0.5,
                availableSeats: Math.floor(Math.random() * 16),
                totalSeats: 15
            };
        }
    }
    
    // Создание бронирования
    async function createBooking(bookingData) {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                // Моковое создание
                return await mockApi.createBooking(bookingData);
            }
        } catch (error) {
            // Моковое создание при ошибке сети
            return await mockApi.createBooking(bookingData);
        }
    }
    
    // Валидация формы бронирования
    function validateBookingForm(data) {
        if (!data.name || data.name.trim().length < 2) {
            showNotification('Пожалуйста, введите корректное ФИО', 'error');
            return false;
        }
        
        if (!data.phone || !isValidPhone(data.phone)) {
            showNotification('Пожалуйста, введите корректный номер телефона', 'error');
            return false;
        }
        
        if (!data.email || !isValidEmail(data.email)) {
            showNotification('Пожалуйста, введите корректный email', 'error');
            return false;
        }
        
        if (!data.peopleCount || data.peopleCount < 1 || data.peopleCount > 15) {
            showNotification('Количество человек должно быть от 1 до 15', 'error');
            return false;
        }
        
        return true;
    }
    
    // Проверка email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Проверка телефона (такая же как в reviews.js)
    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[7]?[8]?[\s]?\(?\d{3}\)?[\s]?\d{3}[\s]?\d{2}[\s]?\d{2}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
    
    // Показать подтверждение бронирования
    function showBookingConfirmation(bookingId, bookingData) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        const tourName = bookingData.tour === 'beer' ? 'Пивная экскурсия' : 'Квасная экскурсия';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="this.parentElement.parentElement.style.display='none'">&times;</span>
                <h2>✅ Бронирование подтверждено!</h2>
                <div class="booking-details">
                    <p><strong>Номер брони:</strong> ${bookingId}</p>
                    <p><strong>Экскурсия:</strong> ${tourName}</p>
                    <p><strong>Дата:</strong> ${new Date(bookingData.date).toLocaleDateString('ru-RU')}</p>
                    <p><strong>Время:</strong> ${bookingData.time}</p>
                    <p><strong>Количество человек:</strong> ${bookingData.peopleCount}</p>
                    <p><strong>Имя:</strong> ${bookingData.name}</p>
                    <p><strong>Телефон:</strong> ${bookingData.phone}</p>
                </div>
                <div style="margin-top: 2rem; text-align: center;">
                    <button onclick="window.print()" class="btn btn-secondary" style="margin-right: 1rem;">🖨️ Распечатать</button>
                    <button onclick="this.parentElement.parentElement.parentElement.style.display='none'" class="btn btn-primary">Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }
    
    // Функция showNotification (если еще не определена)
    if (typeof showNotification === 'undefined') {
        window.showNotification = function(message, type = 'info') {
            // Такая же реализация как в reviews.js
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 4px;
                color: white;
                font-weight: 600;
                z-index: 3000;
                animation: slideIn 0.3s ease-out;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            `;
            
            if (type === 'success') {
                notification.style.backgroundColor = '#27ae60';
            } else if (type === 'error') {
                notification.style.backgroundColor = '#e74c3c';
            } else {
                notification.style.backgroundColor = '#3498db';
            }
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 5000);
        };
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const reviewModal = document.getElementById('reviewModal');
    const openReviewBtn = document.getElementById('openReview');
    const closeReviewBtn = reviewModal?.querySelector('.close-modal');
    const reviewForm = document.getElementById('reviewForm');
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('reviewRating');
    
    // Инициализация звезд рейтинга
    let currentRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.dataset.value);
            currentRating = value;
            ratingInput.value = value;
            
            // Обновление отображения звезд
            stars.forEach((s, index) => {
                if (index < value) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
        
        // Эффект при наведении
        star.addEventListener('mouseover', function() {
            const value = parseInt(this.dataset.value);
            stars.forEach((s, index) => {
                if (index < value) {
                    s.style.color = '#f1c40f';
                }
            });
        });
        
        star.addEventListener('mouseout', function() {
            stars.forEach((s, index) => {
                if (index >= currentRating) {
                    s.style.color = '#ddd';
                }
            });
        });
    });
    
    // Открытие модалки отзыва
    if (openReviewBtn) {
        openReviewBtn.addEventListener('click', function() {
            reviewModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Блокируем скролл
        });
    }
    
    // Закрытие модалки отзыва
    if (closeReviewBtn) {
        closeReviewBtn.addEventListener('click', function() {
            reviewModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            resetReviewForm();
        });
    }
    
    // Закрытие по клику вне модалки
    window.addEventListener('click', function(event) {
        if (event.target === reviewModal) {
            reviewModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            resetReviewForm();
        }
    });
    
    // Обработка отправки формы отзыва
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Собираем данные формы
            const formData = {
                name: document.getElementById('reviewName').value,
                phone: document.getElementById('reviewPhone').value,
                tour: document.getElementById('reviewTour').value,
                text: document.getElementById('reviewText').value,
                rating: parseInt(ratingInput.value) || 0,
                date: new Date().toISOString()
            };
            
            // Валидация
            if (!validateReviewForm(formData)) {
                return;
            }
            
            try {
                // Отправка данных (используем mock или реальный API)
                const result = await sendReview(formData);
                
                if (result.success) {
                    showNotification('Отзыв успешно отправлен!', 'success');
                    resetReviewForm();
                    reviewModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                } else {
                    showNotification('Ошибка при отправке отзыва', 'error');
                }
            } catch (error) {
                console.error('Error submitting review:', error);
                showNotification('Ошибка сети. Попробуйте позже.', 'error');
            }
        });
    }
    
    // Валидация формы отзыва
    function validateReviewForm(data) {
        if (!data.name || data.name.trim().length < 2) {
            showNotification('Пожалуйста, введите корректное ФИО', 'error');
            return false;
        }
        
        if (!data.phone || !isValidPhone(data.phone)) {
            showNotification('Пожалуйста, введите корректный номер телефона', 'error');
            return false;
        }
        
        if (!data.tour) {
            showNotification('Пожалуйста, выберите экскурсию', 'error');
            return false;
        }
        
        if (!data.text || data.text.trim().length < 10) {
            showNotification('Отзыв должен содержать минимум 10 символов', 'error');
            return false;
        }
        
        return true;
    }
    
    // Проверка номера телефона
    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[7]?[8]?[\s]?\(?\d{3}\)?[\s]?\d{3}[\s]?\d{2}[\s]?\d{2}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
    
    // Отправка отзыва (реальная или моковая)
    async function sendReview(data) {
        try {
            // Пробуем реальный API
            const response = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                // Если API недоступен, используем мок
                return await mockApi.createReview(data);
            }
        } catch (error) {
            // Если ошибка сети, используем мок
            return await mockApi.createReview(data);
        }
    }
    
    // Сброс формы отзыва
    function resetReviewForm() {
        if (reviewForm) {
            reviewForm.reset();
            currentRating = 0;
            ratingInput.value = 0;
            stars.forEach(star => {
                star.classList.remove('active');
                star.style.color = '#ddd';
            });
        }
    }
    
    // Показать уведомление
    function showNotification(message, type = 'info') {
        // Создаем элемент уведомления
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
        
        // Удаляем уведомление через 5 секунд
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    // Добавляем стили анимации для уведомлений
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
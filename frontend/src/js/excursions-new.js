// excursions-new.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 excursions-new.js загружен');
    
    // Элементы DOM
    const beerDaysGrid = document.getElementById('beerDays');
    const kvasDaysGrid = document.getElementById('kvasDays');
    const bookingBtn = document.getElementById('openBooking');
    const bookingModal = document.getElementById('bookingModal');
    const closeModalBtn = bookingModal?.querySelector('.close-modal');
    
    // Проверяем что элементы существуют
    if (!beerDaysGrid || !kvasDaysGrid || !bookingBtn) {
        console.error('❌ Не найдены элементы DOM');
        return;
    }
    
    // Данные экскурсий
    const tours = {
        beer: {
            name: 'Пивная экскурсия',
            times: ['12:00', '14:00', '16:00'],
            days: ['ПН', 'СР', 'ПТ'],
            color: 'beer',
            icon: '🍺'
        },
        kvas: {
            name: 'Квасная экскурсия',
            times: ['13:00', '15:00', '17:00'],
            days: ['ПН', 'СР', 'ПТ'],
            color: 'kvas',
            icon: '🥤'
        }
    };
    
    // Состояние выбора
    let selectedTour = null;
    let selectedDay = null;
    let selectedTime = null;
    
    // Инициализация
    initCalendar();
    
    // 1. Создаем календарь
    function initCalendar() {
        console.log('📅 Инициализация календаря');
        
        // Пивная экскурсия
        beerDaysGrid.innerHTML = '';
        tours.beer.days.forEach(day => {
            const dayElement = createDayElement(day, 'beer');
            beerDaysGrid.appendChild(dayElement);
        });
        
        // Квасная экскурсия
        kvasDaysGrid.innerHTML = '';
        tours.kvas.days.forEach(day => {
            const dayElement = createDayElement(day, 'kvas');
            kvasDaysGrid.appendChild(dayElement);
        });
        
        updateBookingButton();
    }
    
    // 2. Создаем элемент дня
    function createDayElement(dayName, tourType) {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.dataset.day = dayName;
        dayCard.dataset.tour = tourType;
        
        // Заглушка для занятых времен
        const bookedTimes = getBookedTimes(tourType, dayName);
        
        // Полное название дня
        const fullDayName = getFullDayName(dayName);
        
        dayCard.innerHTML = `
            <div class="day-name">${fullDayName}</div>
            <div class="day-circle">${getDayNumber(dayName)}</div>
            <div class="times-container">
                ${tours[tourType].times.map(time => {
                    const isBooked = bookedTimes.includes(time);
                    return `
                        <div class="time-slot ${isBooked ? 'booked' : 'available'}" 
                             data-time="${time}"
                             data-booked="${isBooked}">
                            <span>${time}</span>
                            ${isBooked ? '<small>(занято)</small>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Обработчики кликов
        dayCard.addEventListener('click', function(event) {
            // Проверяем кликнули ли на время
            const timeSlot = event.target.closest('.time-slot');
            
            if (timeSlot) {
                // Клик на время
                const time = timeSlot.dataset.time;
                const isBooked = timeSlot.dataset.booked === 'true';
                
                if (!isBooked) {
                    selectTime(tourType, dayName, time, timeSlot);
                } else {
                    console.log('⏰ Это время уже занято');
                }
            } else {
                // Клик на день
                selectDay(tourType, dayName, dayCard);
            }
        });
        
        return dayCard;
    }
    
    // 3. Выбор дня
    function selectDay(tourType, dayName, dayCard) {
        console.log('📅 Выбран день:', dayName, 'экскурсия:', tourType);
        
        // Сбрасываем предыдущие выделения дней
        document.querySelectorAll('.day-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Сбрасываем предыдущие выделения времени
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Сбрасываем выбранное время (только день выбрали)
        selectedTour = tourType;
        selectedDay = dayName;
        selectedTime = null;
        
        // Выделяем выбранный день
        if (dayCard) {
            dayCard.classList.add('selected');
        }
        
        updateBookingButton();
    }
    
    // 4. Выбор времени
    function selectTime(tourType, dayName, time, timeSlot) {
        console.log('⏰ Выбрано время:', time, 'день:', dayName);
        
        // Сначала выбираем день
        const dayCard = document.querySelector(`.day-card[data-tour="${tourType}"][data-day="${dayName}"]`);
        selectDay(tourType, dayName, dayCard);
        
        // Сбрасываем предыдущие выделения времени
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Устанавливаем выбранное время
        selectedTime = time;
        selectedTour = tourType;
        selectedDay = dayName;
        
        // Выделяем выбранное время
        if (timeSlot) {
            timeSlot.classList.add('selected');
        }
        
        updateBookingButton();
    }
    
    // 5. Обновление кнопки записи
    function updateBookingButton() {
        console.log('🔄 Обновление кнопки. Выбрано:', 
            selectedTour, selectedDay, selectedTime);
        
        if (selectedTour && selectedDay && selectedTime) {
            // ВСЁ ВЫБРАНО - кнопка активна
            bookingBtn.disabled = false;
            bookingBtn.innerHTML = `
                <span class="btn-icon">📋</span>
                Записаться на ${tours[selectedTour].name}
            `;
            
            const hint = document.querySelector('.booking-hint');
            if (hint) {
                hint.textContent = `Готово! Выбрано: ${getFullDayName(selectedDay)} ${selectedTime}`;
                hint.style.color = '#e3ce30';
                hint.style.fontWeight = '600';
            }
        } else {
            // Не всё выбрано - кнопка неактивна
            bookingBtn.disabled = true;
            
            const hint = document.querySelector('.booking-hint');
            if (hint) {
                hint.textContent = 'Выберите дату и время для записи';
                hint.style.color = '#e3ce30';
            }
        }
    }
    
    // 6. Обработчик кнопки записи
    bookingBtn.addEventListener('click', function() {
        console.log('📝 Нажата кнопка записи');
        
        if (!selectedTour || !selectedDay || !selectedTime) {
            alert('Пожалуйста, выберите дату и время экскурсии');
            return;
        }
        
        // Обновляем модальное окно
        updateBookingModal();
        
        // Показываем модальное окно
        if (bookingModal) {
            bookingModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    });
    
    // 7. Обновление модального окна
    function updateBookingModal() {
        // Находим элементы в модалке
        const tourNameEl = document.getElementById('modalTourName');
        const tourDateEl = document.getElementById('modalTourDate');
        const tourTimeEl = document.getElementById('modalTourTime');
        const freeSeatsEl = document.getElementById('modalFreeSeats');
        const remainingSeatsEl = document.getElementById('remainingSeats');
        const countInput = document.getElementById('bookingCount');
        
        if (tourNameEl && tourDateEl && tourTimeEl) {
            // Обновляем информацию
            tourNameEl.textContent = tours[selectedTour].name;
            tourDateEl.textContent = getFullDayName(selectedDay);
            tourTimeEl.textContent = selectedTime;
            
            // Рассчитываем свободные места
            const freeSeats = calculateFreeSeats();
            
            if (freeSeatsEl) freeSeatsEl.textContent = freeSeats;
            if (remainingSeatsEl) remainingSeatsEl.textContent = `Осталось мест: ${freeSeats}`;
            if (countInput) {
                countInput.max = freeSeats;
                if (parseInt(countInput.value) > freeSeats) {
                    countInput.value = freeSeats;
                }
            }
        }
    }
    
    // 8. Закрытие модального окна
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            bookingModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Закрытие по клику вне модалки
    window.addEventListener('click', function(event) {
        if (event.target === bookingModal) {
            bookingModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // 9. Вспомогательные функции
    function getFullDayName(shortName) {
        const days = { 
            'ПН': 'Понедельник', 
            'СР': 'Среда', 
            'ПТ': 'Пятница' 
        };
        return days[shortName] || shortName;
    }
    
    function getDayNumber(dayName) {
        const map = { 'ПН': '1', 'СР': '3', 'ПТ': '5' };
        return map[dayName] || '';
    }
    
    function getBookedTimes(tourType, dayName) {
        // Заглушка: случайные занятые слоты для демо
        const times = tours[tourType].times;
        const booked = [];
        
        // 20% шанс что слот занят
        if (Math.random() < 0.2) {
            const randomIndex = Math.floor(Math.random() * times.length);
            booked.push(times[randomIndex]);
        }
        
        return booked;
    }
    
    function calculateFreeSeats() {
        // Заглушка: случайное количество свободных мест
        return Math.floor(Math.random() * 11) + 5; // 5-15 мест
    }
    
    console.log('✅ excursions-new.js инициализирован');
});
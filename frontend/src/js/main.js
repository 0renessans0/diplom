document.addEventListener('DOMContentLoaded', function() {
    // Инициализация языкового переключателя
    initLanguageSwitcher();
    
    // Инициализация навигации
    initNavigation();
    
    // Инициализация игры (заглушка)
    initGame();
    
    // Проверка API при загрузке
    checkApiHealth();
});

// Языковой переключатель
function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.textContent.trim();
            
            // Убираем активный класс у всех кнопок
            langButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Меняем язык (заглушка - в реальном проекте нужно переводить контент)
            console.log(`Язык изменен на: ${lang}`);
            
            // Можно добавить реальную логику перевода
            // changeLanguage(lang);
        });
    });
}

// Навигация
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Если это ссылка на игру (заглушка)
            if (this.id === 'gameLink' || this.textContent.includes('Игра')) {
                e.preventDefault();
                showGameNotification();
            }
        });
    });
}

// Уведомление об игре (заглушка)
function showGameNotification() {
    showNotification('Игра находится в разработке. Скоро будет доступна!', 'info');
}

// Заглушка для инициализации игры
function initGame() {
    console.log('Инициализация игры...');
    // Здесь будет логика игры, когда она будет готова
}

// Проверка здоровья API
async function checkApiHealth() {
    try {
        const response = await fetch('http://localhost:3000/api/health');
        if (response.ok) {
            console.log('✅ API доступен');
        } else {
            console.warn('⚠️ API отвечает с ошибкой');
        }
    } catch (error) {
        console.error('❌ API недоступен:', error.message);
        // Показываем предупреждение, если это продакшн
        if (!window.location.hostname.includes('localhost')) {
            showNotification('Временные технические работы. Некоторые функции могут быть недоступны.', 'info');
        }
    }
}

// Функция переключения языка (заготовка для будущей реализации)
function changeLanguage(lang) {
    // Сохраняем выбранный язык в localStorage
    localStorage.setItem('preferredLanguage', lang);
    
    // Здесь должна быть логика загрузки переводов
    // и обновления контента на странице
    
    // Пример изменения текста:
    const translations = {
        'РУС': {
            'Записаться на экскурсию': 'Записаться на экскурсию',
            'Записаться': 'Записаться',
            'Экскурсии': 'Экскурсии',
            'Игра': 'Игра'
        },
        'ENG': {
            'Записаться на экскурсию': 'Book a tour',
            'Записаться': 'Book now',
            'Экскурсии': 'Tours',
            'Игра': 'Game'
        }
    };
    
    // Обновляем тексты на странице
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.dataset.translate;
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

// Функция для обновления текстов при загрузке страницы
function updateTextsByLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'РУС';
    changeLanguage(savedLang);
    
    // Устанавливаем активную кнопку языка
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.textContent.trim() === savedLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Общая функция для уведомлений (если еще не определена)
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
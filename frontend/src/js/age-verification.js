// Проверка возраста
document.addEventListener('DOMContentLoaded', function() {
    const ageModal = document.getElementById('ageModal');
    const confirmAgeBtn = document.getElementById('confirmAge');
    const denyAgeBtn = document.getElementById('denyAge');
    const denyModal = document.getElementById('denyModal');
    const closeDenyBtn = document.getElementById('closeDeny');
    const mainContent = document.getElementById('mainContent');

    // Проверяем, уже подтвержден ли возраст
    const ageConfirmed = localStorage.getItem('ageConfirmed');
    
    if (ageConfirmed === 'true') {
        // Если уже подтвержден, показываем контент
        ageModal.style.display = 'none';
        if (mainContent) {
            mainContent.style.display = 'block';
            document.body.style.overflow = 'auto';
        }
    } else {
        // Если не подтвержден, показываем модальное окно
        ageModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Подтверждение возраста
    if (confirmAgeBtn) {
        confirmAgeBtn.addEventListener('click', function() {
            localStorage.setItem('ageConfirmed', 'true');
            ageModal.style.display = 'none';
            if (mainContent) {
                mainContent.style.display = 'block';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Отказ
    if (denyAgeBtn) {
        denyAgeBtn.addEventListener('click', function() {
            ageModal.style.display = 'none';
            denyModal.style.display = 'flex';
        });
    }

    // Закрыть окно отказа
    if (closeDenyBtn) {
        closeDenyBtn.addEventListener('click', function() {
            denyModal.style.display = 'none';
            // Можно перенаправить на другую страницу или оставить как есть
            alert('Доступ к сайту запрещен для лиц младше 18 лет.');
        });
    }

    // Закрытие по клику вне модалки
    window.addEventListener('click', function(event) {
        if (event.target === denyModal) {
            denyModal.style.display = 'none';
        }
        // Не закрываем возрастное окно по клику вне - нужно обязательно выбрать
    });

    // Запрет закрытия через Esc
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && ageModal.style.display === 'flex') {
            event.preventDefault();
        }
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const ageModal = document.getElementById('ageModal');
    const denyModal = document.getElementById('denyModal');
    const mainContent = document.getElementById('mainContent');
    const confirmBtn = document.getElementById('confirmAge');
    const denyBtn = document.getElementById('denyAge');
    const closeDenyBtn = document.getElementById('closeDeny');
    
    // Проверяем, было ли уже подтверждение возраста в текущей сессии
    const ageVerified = sessionStorage.getItem('ageVerified');
    
    if (ageVerified === 'true') {
        // Возраст уже подтвержден в этой сессии
        ageModal.style.display = 'none';
        if (mainContent) {
            mainContent.style.display = 'block';
        }
    } else {
        // Показываем модалку проверки возраста
        ageModal.style.display = 'flex';
        if (mainContent) mainContent.style.display = 'none';
    }
    
    // Обработчик подтверждения возраста
    confirmBtn.addEventListener('click', function() {
        // Сохраняем в sessionStorage (только на текущую сессию)
        sessionStorage.setItem('ageVerified', 'true');
        ageModal.style.display = 'none';
        if (mainContent) {
            mainContent.style.display = 'block';
        }
    });
    
    // Обработчик отказа
    denyBtn.addEventListener('click', function() {
        ageModal.style.display = 'none';
        if (denyModal) {
            denyModal.style.display = 'flex';
        } else {
            showAccessDeniedPage();
        }
    });
    
    // Закрытие модалки отказа
    if (closeDenyBtn) {
        closeDenyBtn.addEventListener('click', function() {
            if (denyModal) denyModal.style.display = 'none';
            showAccessDeniedPage();
        });
    }
    
    // Функция показа страницы отказа
    function showAccessDeniedPage() {
        document.body.innerHTML = `
            <style>
                body {
                    background: linear-gradient(135deg, #1f6643 0%, #0d4a2a 100%);
                    font-family: 'Inter', sans-serif;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #e3ce30;
                }
                
                .access-denied {
                    text-align: center;
                    padding: 3rem;
                    background: rgba(0, 0, 0, 0.7);
                    border-radius: 20px;
                    border: 3px solid #e3ce30;
                    max-width: 600px;
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
                }
                
                .denied-icon {
                    font-size: 5rem;
                    margin-bottom: 2rem;
                }
                
                h2 {
                    font-size: 2.5rem;
                    margin-bottom: 1.5rem;
                    color: #e3ce30;
                }
                
                p {
                    font-size: 1.2rem;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                    color: #ffffff;
                }
                
                .contact-info {
                    margin-top: 2rem;
                    font-size: 1.1rem;
                    color: #e3ce30;
                }
            </style>
            
            <div class="access-denied">
                <div class="denied-icon">🔞</div>
                <h2>Доступ запрещен</h2>
                <p>К сожалению, доступ к сайту разрешен только лицам старше 18 лет.</p>
                <p>Согласно законодательству РФ, информация на этом сайте содержит материалы, предназначенные для взрослой аудитории.</p>
                <div class="contact-info">
                    <p>По вопросам сотрудничества:</p>
                    <p>📞 8 800 352-67-66</p>
                    <p>✉️ pivo@yandex.ru</p>
                </div>
            </div>
        `;
    }
});
// app.js

// Разрешить загрузку внешних ресурсов
const meta = document.createElement('meta');
meta.httpEquiv = "Content-Security-Policy";
meta.content = "default-src 'self' https: 'unsafe-inline' 'unsafe-eval' data: gap:";
document.head.appendChild(meta);

const SoundManager = {
    hoverSound: new Audio('./sounds/navodka.mp3'),
    copySound: new Audio('./sounds/ckilk.mp3'),
    
    init: function() {
        this.hoverSound.volume = 0.3;
        this.copySound.volume = 0.7;
        this.hoverSound.preload = 'auto';
        this.copySound.preload = 'auto';
    }
};
SoundManager.init();

const initialCards = [
    {
        id: 1,
        title: "Пример карточки",
        image: "card1.jpg",
        link: "#",
        promoCodes: ["PROMO1", "PROMO2"],
        instruction: [
            {text: "Шаг 1: Активируйте промокод", image: "step1.jpg"},
            {text: "Шаг 2: Получите бонусы", image: "step2.jpg"}
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initCards();
    setupEventListeners();
});

function initCards() {
    if (!localStorage.getItem('cards')) {
        localStorage.setItem('cards', JSON.stringify(initialCards));
    }
    const cards = JSON.parse(localStorage.getItem('cards')) || [];
    renderCards(cards);
}

function renderCards(cards) {
    const grid = document.querySelector('.grid');
    grid.innerHTML = cards.map(card => `
        <div class="card">
            <div class="card-image">
                <img src="${card.image}" alt="${card.title}">
            </div>
            <div class="card-content">
                <h3>${card.title}</h3>
                <div class="promo-section">
                    ${card.promoCodes.map(code => `
                        <div class="promo-code">
                            <span>${code.trim()}</span>
                            <button class="copy-btn">Копировать</button>
                        </div>
                    `).join('')}
                </div>
                <div class="card-buttons">
                    <a href="${card.link}" class="site-link" target="_blank">Перейти на сайт</a>
                    <button class="site-link instruction-btn">Инструкция</button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Кнопки инструкций
    document.querySelectorAll('.instruction-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const cards = JSON.parse(localStorage.getItem('cards'));
            openModal(cards[index].id);
        });
    });

    // Кнопки копирования
    document.querySelectorAll('.copy-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const cards = JSON.parse(localStorage.getItem('cards'));
            copyCode(cards[0].promoCodes[index]);
        });
    });

    // Навигационные кнопки
    document.querySelectorAll('.nav-btn[data-link]').forEach(btn => {
        btn.addEventListener('click', () => window.open(btn.dataset.link, '_blank'));
    });

    // Контакты
    document.getElementById('contactsBtn').addEventListener('click', toggleContacts);
    
    // Закрытие модалок
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Глобальные обработчики
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeAllModals();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });

    // Звуки (обновленная версия)
    document.querySelectorAll('button, a').forEach(el => {
        el.addEventListener('mouseenter', () => {
            SoundManager.hoverSound.currentTime = 0;
            SoundManager.hoverSound.play().catch(() => {});
        });
        el.addEventListener('click', () => {
            SoundManager.copySound.currentTime = 0;
            SoundManager.copySound.play().catch(() => {});
        });
    });

    // Анимация верхней панели
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const topBar = document.getElementById('topBar');
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            topBar.classList.add('hidden');
        } else {
            topBar.classList.remove('hidden');
        }
        lastScroll = currentScroll;
    });
} // Закрытие функции setupEventListeners

// Функции модальных окон
function openModal(cardId) {
    const cards = JSON.parse(localStorage.getItem('cards'));
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <h2>📘 ${card.title}</h2>
        ${card.instruction.map((step, i) => `
            <div class="step">
                <p>${i + 1}. ${step.text}</p>
                ${step.image ? `<img src="${step.image}" alt="Шаг ${i + 1}">` : ''}
            </div>
        `).join('')}
    `;
    document.getElementById('instructionModal').style.display = 'block';
}

function toggleContacts() {
    const modal = document.getElementById('contactsModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

// Функции работы с буфером обмена
function copyCode(code) {
    navigator.clipboard.writeText(code)
        .then(() => showNotification(`✅ Промокод "${code}" скопирован!`))
        .catch(err => console.error('Ошибка:', err));
}

function showNotification(text) {
    const notification = document.getElementById('notification');
    notification.textContent = text;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 2000);
}
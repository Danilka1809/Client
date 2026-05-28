// ========== ХРАНИЛИЩЕ ==========
let users = JSON.parse(localStorage.getItem('griflauncher_users') || '{}');
let currentUser = localStorage.getItem('griflauncher_current_user');
let messages = JSON.parse(localStorage.getItem('griflauncher_messages') || '[]');

// ========== UI ==========
function renderUI() {
    const userPanel = document.getElementById('userPanel');
    const usernameDisplay = document.getElementById('usernameDisplay');
    
    if (currentUser) {
        userPanel.style.display = 'block';
        usernameDisplay.innerText = currentUser;
        const user = users[currentUser];
        if (user) {
            document.getElementById('nickInput').value = currentUser;
            document.getElementById('passInput').value = user.password;
            document.getElementById('cloudPassInput').value = user.cloudPassword;
        }
    } else {
        userPanel.style.display = 'none';
    }
}

// ========== АВТОРИЗАЦИЯ ==========
function openLogin() {
    const nick = prompt('Никнейм');
    if (!nick) return;
    const pass = prompt('Пароль');
    if (!pass) return;
    if (users[nick] && users[nick].password === pass) {
        currentUser = nick;
        localStorage.setItem('griflauncher_current_user', currentUser);
        renderUI();
        alert('Вход выполнен!');
    } else {
        alert('Неверный логин или пароль');
    }
}

function openRegister() {
    const nick = prompt('Никнейм');
    if (!nick || users[nick]) {
        alert('Ник занят');
        return;
    }
    const pass = prompt('Пароль');
    if (!pass) return;
    const cloudPass = prompt('Облачный пароль');
    if (!cloudPass) return;
    
    users[nick] = { password: pass, cloudPassword: cloudPass };
    localStorage.setItem('griflauncher_users', JSON.stringify(users));
    currentUser = nick;
    localStorage.setItem('griflauncher_current_user', currentUser);
    renderUI();
    alert('Регистрация успешна!');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('griflauncher_current_user');
    renderUI();
}

function saveProfile() {
    if (!currentUser) {
        alert('Сначала войдите');
        return;
    }
    const nick = document.getElementById('nickInput').value;
    const pass = document.getElementById('passInput').value;
    const cloudPass = document.getElementById('cloudPassInput').value;
    
    if (nick !== currentUser) {
        if (users[nick]) {
            alert('Ник занят');
            return;
        }
        users[nick] = users[currentUser];
        delete users[currentUser];
        currentUser = nick;
        localStorage.setItem('griflauncher_current_user', currentUser);
    }
    
    users[currentUser] = { password: pass, cloudPassword: cloudPass };
    localStorage.setItem('griflauncher_users', JSON.stringify(users));
    renderUI();
    alert('Профиль сохранён!');
}

// ========== ЧАТ ==========
function renderMessages() {
    const container = document.getElementById('messagesList');
    if (!container) return;
    container.innerHTML = '';
    messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'chat-message';
        div.innerHTML = `<b>${escapeHtml(msg.author)}:</b> ${escapeHtml(msg.text)}`;
        container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text) return;
    
    const author = currentUser || 'Гость';
    messages.push({ author, text, time: Date.now() });
    if (messages.length > 50) messages.shift();
    localStorage.setItem('griflauncher_messages', JSON.stringify(messages));
    input.value = '';
    renderMessages();
}

// ========== ЗАПУСК ИГРЫ ==========
function playGame(ip) {
    window.location.href = `minecraft://?server=${ip}`;
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ==========
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    // Кнопки авторизации
    document.getElementById('loginBtn')?.addEventListener('click', openLogin);
    document.getElementById('registerBtn')?.addEventListener('click', openRegister);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('saveProfileBtn')?.addEventListener('click', saveProfile);
    
    // Кнопка отправки сообщения
    document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
    document.getElementById('messageInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Кнопки серверов
    document.querySelectorAll('.play-server').forEach(btn => {
        btn.addEventListener('click', () => {
            const ip = btn.getAttribute('data-ip');
            if (ip) playGame(ip);
        });
    });
    
    renderUI();
    renderMessages();
});

// Обновление чата каждые 2 секунды
setInterval(() => {
    messages = JSON.parse(localStorage.getItem('griflauncher_messages') || '[]');
    renderMessages();
}, 2000);

// ✅ Фикс для локального теста: замена Telegram WebApp на фейковый
if (!window.Telegram?.WebApp?.initDataUnsafe) {
    window.Telegram = {
        WebApp: {
            initDataUnsafe: {
                user: {
                    id: 999999,
                    username: "test_admin"
                }
            }
        }
    };
}

const adminTelegramIds = [999999];

function checkTelegramAccess() {
    const initData = window.Telegram?.WebApp?.initDataUnsafe;
    if (!initData || !initData.user || !adminTelegramIds.includes(initData.user.id)) {
        alert("⛔ Доступ запрещён. Только для администратора.");
        document.body.innerHTML = "<h1 style='color:red'>Нет доступа</h1>";
        throw new Error("Access denied");
    }
}

function submitLogin() {
    const login = document.getElementById('admin-login')?.value;
const password = document.getElementById('admin-password')?.value;

    const error = document.getElementById('login-error');

    const validLogin = "1";
    const validPassword = "1";

    if (login !== validLogin || password !== validPassword) {
        if (error) error.textContent = "⛔ Неверный логин или пароль.";
        return;
    }

    // Успешный вход — показать админку
    document.getElementById('login-screen').style.display = 'none';
    document.querySelector('.admin-wrapper').style.display = 'block';
}


let filteredPlayers = [];
let currentPlayerPage = 1;
const playersPerPage = 3;


// 🧠 Логи системы игрока
const playerSystemLogs = [];

function getCurrentUID() {
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "unknown_uid";
}

function getCurrentUsername() {
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.username || "anonymous";
}

function Player_join(gameName, extra = "") {
    const uid = getCurrentUID();
    const username = getCurrentUsername();

    const message = `🎮 Игрок ${uid} (${username}) вошёл в игру ${gameName}${extra ? " | " + extra : ""}`;
    playerSystemLogs.push({
        uid,
        username,
        game: gameName,
        type: "join",
        message,
        timestamp: new Date().toISOString()
    });
    notifyAdmin(message);
}

function Player_leave(gameName, extra = "") {
    const uid = getCurrentUID();
    const username = getCurrentUsername();

    const message = `🚪 Игрок ${uid} (${username}) покинул игру ${gameName}${extra ? " | " + extra : ""}`;
    playerSystemLogs.push({
        uid,
        username,
        game: gameName,
        type: "leave",
        message,
        timestamp: new Date().toISOString()
    });
    notifyAdmin(message);
}

function Player_action(gameName, action, detail = "") {
    const uid = getCurrentUID();
    const username = getCurrentUsername();

    const message = `🎯 ${uid} (${username}) — ${action} в игре ${gameName}${detail ? ": " + detail : ""}`;
    playerSystemLogs.push({
        uid,
        username,
        game: gameName,
        type: "action",
        action,
        detail,
        message,
        timestamp: new Date().toISOString()
    });
    notifyAdmin(message);
}

function notifyAdmin(message) {
    console.log("[ADMIN LOG]", message);
    // TODO: можно отправить через Telegram Bot
}

const fakePlayers = [
    { id: 11111, username: 'ton_master', ton: 150.5, usdt: 20, totalGames: 5, wins: 3, losses: 2, lastSeen: '2024-06-05' },
    { id: 22222, username: 'usdt_girl', ton: 0, usdt: 300.75, totalGames: 12, wins: 6, losses: 6, lastSeen: '2024-06-05' },
    { id: 12345, username: 'pro_player', ton: 0, usdt: 0, totalGames: 0, wins: 0, losses: 0, lastSeen: '2024-06-05' },
    { id: 67890, username: 'crasher', ton: 100, usdt: 0, totalGames: 4, wins: 1, losses: 3, lastSeen: '2024-06-05' },
    { id: 24680, username: 'blocked_guy', ton: 0, usdt: 0, totalGames: 0, wins: 0, losses: 0, lastSeen: '2024-06-01' },
    { id: 1002, username: 'winner_777', ton: 10, usdt: 10, totalGames: 1, wins: 1, losses: 0, lastSeen: '2024-06-03' },
    { id: 7579125260, username: '', ton: 0, usdt: 0, totalGames: 0, wins: 0, losses: 0, lastSeen: '—' }
];

function getUsername(uid) {
    const player = fakePlayers.find(p => String(p.id) === String(uid));
    return player?.username || "—";
}


// 📦 Фейковые данные
const deposits = [
    { date: '24.04.2024', uid: '11111', amount: 150, currency: 'TON', status: 'Выполнен' },
    { date: '23.04.2024', uid: '22222', amount: 200, currency: 'USDT', status: 'Ожидает' }
];

const withdrawals = [
    { date: '24.04.2024', uid: '12345', amount: 100, currency: 'TON', status: 'Выполнен' },
    { date: '23.04.2024', uid: '67890', amount: 400, currency: 'USDT', status: 'Ожидает' },
    { date: '21.04.2024', uid: '24680', amount: 5000, currency: 'USDT', status: 'Отклонен' }
];



function renderStats() {
    const stats = {
        totalPlayers: fakePlayers.length,
        tonBalance: fakePlayers.reduce((sum, p) => sum + (p.ton || 0), 0),
        usdtBalance: fakePlayers.reduce((sum, p) => sum + (p.usdt || 0), 0),
        tonDeposits: deposits.filter(d => d.currency === 'TON').reduce((sum, d) => sum + d.amount, 0),
        usdtDeposits: deposits.filter(d => d.currency === 'USDT').reduce((sum, d) => sum + d.amount, 0),
        tonWithdraws: withdrawals.filter(w => w.currency === 'TON').reduce((sum, w) => sum + w.amount, 0),
        usdtWithdraws: withdrawals.filter(w => w.currency === 'USDT').reduce((sum, w) => sum + w.amount, 0),
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        totalBets: 0,
        betCount: 0,
        mostGamesUid: '',
        mostGamesCount: 0,
        mostProfitUid: '',
        mostProfitAmount: -Infinity
    };

    // Парсинг userLogs
    Object.entries(userLogs).forEach(([uid, log]) => {
        const games = log.games || [];
        stats.totalGames += games.length;

        let userProfit = 0;

        games.forEach(g => {
            stats.totalBets += g.bet;
            stats.betCount += 1;

            if (g.result.includes("выиграл")) {
                stats.totalWins += 1;
                const amount = parseFloat(g.result.split("выиграл")[1]);
                if (!isNaN(amount)) userProfit += (amount - g.bet);
            } else {
                stats.totalLosses += 1;
                userProfit -= g.bet;
            }
        });

        if (games.length > stats.mostGamesCount) {
            stats.mostGamesCount = games.length;
            stats.mostGamesUid = uid;
        }

        if (userProfit > stats.mostProfitAmount) {
            stats.mostProfitAmount = userProfit;
            stats.mostProfitUid = uid;
        }
    });

    const averageBet = stats.betCount ? (stats.totalBets / stats.betCount).toFixed(2) : "—";

    const html = `
        <div class="stats-card"><h3>Всего игроков</h3><p>${stats.totalPlayers}</p></div>
        <div class="stats-card"><h3>Общий баланс</h3><p>TON: ${stats.tonBalance.toFixed(2)}<br>USDT: ${stats.usdtBalance.toFixed(2)}</p></div>
        <div class="stats-card"><h3>Пополнено</h3><p>TON: ${stats.tonDeposits.toFixed(2)}<br>USDT: ${stats.usdtDeposits.toFixed(2)}</p></div>
        <div class="stats-card"><h3>Выведено</h3><p>TON: ${stats.tonWithdraws.toFixed(2)}<br>USDT: ${stats.usdtWithdraws.toFixed(2)}</p></div>
        <div class="stats-card"><h3>Сыграно игр</h3><p>${stats.totalGames}</p></div>
        <div class="stats-card"><h3>Выигрышей / проигрышей</h3><p>${stats.totalWins} / ${stats.totalLosses}</p></div>
        <div class="stats-card"><h3>Средняя ставка</h3><p>${averageBet}</p></div>
        <div class="stats-card"><h3>Самый активный игрок</h3><p>UID: ${stats.mostGamesUid}<br>Игр: ${stats.mostGamesCount}</p></div>
        <div class="stats-card"><h3>Самый прибыльный игрок</h3><p>UID: ${stats.mostProfitUid}<br>Прибыль: ${stats.mostProfitAmount.toFixed(2)}</p></div>
    `;

    document.getElementById("stats-content").innerHTML = html;
}

function renderPlayerPagination() {
    const container = document.getElementById("player-pagination");
    if (!container) return;

    const source = filteredPlayers.length ? filteredPlayers : fakePlayers;
const totalPages = Math.ceil(source.length / playersPerPage);


    container.innerHTML = `
        <button ${currentPlayerPage === 1 ? 'disabled' : ''} onclick="changePlayerPage(-1)">← Назад</button>
        <span>Страница ${currentPlayerPage} из ${totalPages}</span>
        <button ${currentPlayerPage === totalPages ? 'disabled' : ''} onclick="changePlayerPage(1)">Вперёд →</button>
    `;
}

function changePlayerPage(offset) {
    const totalPages = Math.ceil(fakePlayers.length / playersPerPage);
    currentPlayerPage += offset;

    if (currentPlayerPage < 1) currentPlayerPage = 1;
    if (currentPlayerPage > totalPages) currentPlayerPage = totalPages;

    loadPlayers();

    window.scrollTo({
    top: document.getElementById("playersTable").offsetTop - 90, // чуть выше таблицы
    behavior: "smooth"
});

}

// 🛠️ Список игр и их названия
const gameList = [
    { id: 'game-coin', name: 'Орёл и решка' },
    { id: 'game-boxes', name: 'Три коробки' },
    { id: 'game-dice', name: 'Кубики' },
    { id: 'game-crash', name: 'Самолёт' },
    { id: 'game-chicken', name: 'Курица на дороге' },
    { id: 'game-safe', name: 'Открой сейф' },
    { id: 'game-bombs', name: 'Бомбочки' },
    { id: 'game-wheel', name: 'Колесо удачи' },
    { id: 'game-arrow', name: 'Стрела' },
    { id: 'game-21', name: '21 очко' }
];

// ⚙️ Глобальный объект доступности
let activeGames = {
    "game-coin": true,
    "game-boxes": true,
    "game-dice": true,
    "game-crash": true,
    "game-chicken": true,
    "game-safe": true,
    "game-bombs": true,
    "game-wheel": true,
    "game-arrow": true,
    "game-21": true
};

// 📦 Загрузка списка игр в настройки
function renderSettings() {
    const container = document.getElementById("section-settings");
    container.innerHTML = '<h2>⚙️ Настройки</h2>';

    const table = document.createElement("table");
    table.className = "admin-table";
    table.innerHTML = `
        <thead>
            <tr><th>Игра</th><th>Статус</th></tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    gameList.forEach(game => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${game.name}</td>
            <td>
                <label class="switch">
                    <input type="checkbox" ${activeGames[game.id] ? "checked" : ""} data-game="${game.id}">
                    <span class="slider round"></span>
                </label>
            </td>
        `;
        tbody.appendChild(tr);
    });

    container.appendChild(table);

    // 🎯 Обработчик переключателей
container.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
    checkbox.addEventListener("change", (e) => {
        const gameId = e.target.dataset.game;
        const isEnabled = e.target.checked;

        activeGames[gameId] = isEnabled;
        console.log(`Игра ${gameId} теперь ${isEnabled ? "включена" : "отключена"}`);

        showCustomAlert(
            `Игра ${gameId} ${isEnabled ? "включена ✅" : "отключена ⛔"}`,
            isEnabled ? "success" : "error"
        );
    });
});

}

function loadPlayers() {
    const tbody = document.querySelector("#playersTable tbody");
    tbody.innerHTML = '';

    const startIndex = (currentPlayerPage - 1) * playersPerPage;
    const endIndex = startIndex + playersPerPage;
    const source = filteredPlayers.length ? filteredPlayers : fakePlayers;
const playersToRender = source.slice(startIndex, endIndex);


    playersToRender.forEach(player => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="UID">${player.id}</td>
            <td data-label="Username">@${player.username || '—'}</td>
            <td data-label="TON">${player.ton?.toFixed(2) ?? '0.00'}</td>
            <td data-label="USDT">${player.usdt?.toFixed(2) ?? '0.00'}</td>
            <td data-label="Игр">${player.totalGames ?? 0}</td>
            <td data-label="Победы / Поражения">${player.wins ?? 0} / ${player.losses ?? 0}</td>
            <td data-label="Онлайн">${player.lastSeen || '—'}</td>
            <td data-label="Действия">
                <button class="action-btn" onclick="viewLogs(${player.id})">Профиль</button>
                <button class="action-btn" onclick="resetBalance(${player.id})">Обнулить</button>
                <button class="action-btn btn-danger" onclick="toggleBlock(${player.id}, this)" data-blocked="false">Заблокировать</button>
                ${
                    player.username
                        ? `<a href="https://t.me/${player.username}" target="_blank" class="action-btn" style="background:#0088cc;">Telegram</a>`
                        : `<a href="tg://user?id=${player.id}" class="action-btn" style="background:#444;">Telegram (ID)</a>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderPlayerPagination();
}



function viewLogs(uid) {
    // Переход на вкладку "Логи"
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.textContent.trim() === "Логи") {
            btn.click();
        }
    });

    // Автоматическая подстановка UID в поле
    const input = document.getElementById("uid-search");
    const select = document.getElementById("user-select");

    setTimeout(() => {
        input.value = uid;
        select.value = ""; // сбросить select, чтобы не мешал
        renderUserLogs(uid);
    }, 100); // небольшая задержка, чтобы успела прогрузиться вкладка
}


function resetBalance(uid) {
    alert(`✅ Баланс игрока ${uid} обнулён (фиктивно)`);
    // TODO: в будущем — отправка на backend: /admin/reset_balance
}

function toggleBlock(uid, btn) {
    const isBlocked = btn.dataset.blocked === "true";

    if (isBlocked) {
        // Разблокировка
        btn.textContent = "Заблокировать";
        btn.dataset.blocked = "false";
        btn.classList.remove("btn-success");
        btn.classList.add("btn-danger");
        alert(`🔓 Игрок ${uid} разблокирован`);
    } else {
        // Блокировка
        btn.textContent = "Разблокировать";
        btn.dataset.blocked = "true";
        btn.classList.remove("btn-danger");
        btn.classList.add("btn-success");
        alert(`⛔ Игрок ${uid} заблокирован`);
    }
}






// 🖥 Отрисовка таблиц
function renderDeposits() {
    const tbody = document.getElementById("deposits-body");
    tbody.innerHTML = '';

    deposits.forEach(req => {
        const username = getUsername(req.uid); // Получаем username по UID

        const row = document.createElement("tr");
        row.innerHTML = `
            <td data-label="Дата">${req.date}</td>
            <td data-label="UID">
                ${req.uid}<br>
                <small style="color:gray">@${username}</small>
            </td>
            <td data-label="Сумма">
                ${req.status === 'Ожидает' ? `<button class="approve-btn">Одобрить</button>` : req.amount}
            </td>
            <td data-label="Валюта">${req.currency}</td>
            <td data-label="Статус">
                <span class="badge ${badgeClass(req.status)}">${req.status}</span>
            </td>
        `;
        tbody.appendChild(row);
    });
}






function renderWithdraws() {

    const tbody = document.querySelector("#section-withdraws tbody");
    tbody.innerHTML = '';
    withdrawals.forEach(req => {
        const username = getUsername(req.uid); // Получаем username по UID
        const row = document.createElement("tr");
        row.innerHTML = `
            <td data-label="Дата">${req.date}</td>
            <td data-label="UID">
                ${req.uid}<br>
                <small style="color:gray">@${username}</small>
            </td>
            <td data-label="Сумма">${req.status === 'Ожидает' ? `<button class="approve-btn">Одобрить</button>` : req.amount}</td>
            <td data-label="Валюта">${req.currency}</td>
            <td data-label="Статус"><span class="badge ${badgeClass(req.status)}">${req.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}



function badgeClass(status) {
    return status === 'Выполнен' ? 'success' : status === 'Отклонен' ? 'danger' : '';
}

// 🧭 Вкладки
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = {
        "Пополнения": document.getElementById("section-deposits"),
        "Выводы": document.getElementById("section-withdraws"),
        "Статистика": document.getElementById("section-stats"),
        "Игроки": document.getElementById("section-players"),
        "Логи": document.getElementById("section-logs"),
        "Настройки": document.getElementById("section-settings")
    };

    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    Object.values(sections).forEach(sec => sec.style.display = 'none');
    const target = sections[btn.textContent.trim()];
    if (target) target.style.display = 'block';

    const tabName = btn.textContent.trim();
        if (tabName === "Игроки") {
            currentPlayerPage = 1;   // 🟢 Сброс страницы при переходе
            loadPlayers();
        }
        if (tabName === "Статистика") renderStats();
        if (tabName === "Настройки") renderSettings();
    });

    });
}

const userLogs = {
    "12345": {
        deposits: ["+50 TON", "+100 USDT"],
        withdraws: ["Запрошен 30 TON", "Выполнен 30 TON"],
        games: [
    {
        game: "Safe Cracker",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-06-01T12:34:00"
    },
    {
        game: "Crash",
        bet: 20,
        currency: "USDT",
        result: "проиграл",
        timestamp: "2025-06-01T14:10:00"
    }
]

    },
    "67890": {
        deposits: ["+200 USDT"],
        withdraws: ["Запрошен 100 USDT"],
        games: [
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-06-01T12:34:00",
        balanceStart: { ton: 10, usdt: 50 },
        balanceEnd: { ton: 10, usdt: 20 }
    },
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-09-01T12:34:00",
        balanceStart: { ton: 10, usdt: 20 },
        balanceEnd: { ton: 10, usdt: 30 }
    },
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-09-01T12:34:00",
        balanceStart: { ton: 10, usdt: 20 },
        balanceEnd: { ton: 10, usdt: 30 }
    },
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-09-01T12:34:00",
        balanceStart: { ton: 10, usdt: 20 },
        balanceEnd: { ton: 10, usdt: 30 }
    },
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-09-01T12:34:00",
        balanceStart: { ton: 10, usdt: 20 },
        balanceEnd: { ton: 10, usdt: 30 }
    },
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-09-01T12:34:00",
        balanceStart: { ton: 10, usdt: 20 },
        balanceEnd: { ton: 10, usdt: 30 }
    },
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-09-01T12:34:00",
        balanceStart: { ton: 10, usdt: 20 },
        balanceEnd: { ton: 10, usdt: 30 }
    },
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-09-01T12:34:00",
        balanceStart: { ton: 10, usdt: 20 },
        balanceEnd: { ton: 10, usdt: 30 }
    },
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-09-01T12:34:00",
        balanceStart: { ton: 10, usdt: 20 },
        balanceEnd: { ton: 10, usdt: 30 }
    },
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-09-01T12:34:00",
        balanceStart: { ton: 10, usdt: 20 },
        balanceEnd: { ton: 10, usdt: 30 }
    },
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-09-01T12:34:00",
        balanceStart: { ton: 10, usdt: 20 },
        balanceEnd: { ton: 10, usdt: 30 }
    },
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-09-01T12:34:00",
        balanceStart: { ton: 10, usdt: 20 },
        balanceEnd: { ton: 10, usdt: 30 }
    },
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-09-01T12:34:00",
        balanceStart: { ton: 10, usdt: 20 },
        balanceEnd: { ton: 10, usdt: 30 }
    },
    {
        game: "Dice",
        bet: 10,
        currency: "TON",
        result: "выиграл 30 TON",
        timestamp: "2025-09-01T12:34:00",
        balanceStart: { ton: 10, usdt: 20 },
        balanceEnd: { ton: 10, usdt: 30 }
    },
    {
        game: "Chicken",
        bet: 20,
        currency: "USDT",
        result: "проиграл",
        timestamp: "2025-06-01T14:10:00"
    }
]

    }
};


let currentPage = 1;
const itemsPerPage = 5;
let modalGame = "";
let modalUid = "";

function openGameModalByGame(uid, gameName) {
    modalGame = gameName;
    modalUid = uid;
    currentPage = 1; // 👈 сброс гарантирован

    document.getElementById("filter-date").value = "";
    document.getElementById("filter-result").value = "";
    document.getElementById("filtered-game-results").innerHTML = "";
    document.getElementById("game-summary").innerHTML = "";

    document.getElementById("game-modal").style.display = "flex";

    document.getElementById("filter-date").oninput = () => applyGameFilter(true);
    document.getElementById("filter-result").oninput = () => applyGameFilter(true);

    applyGameFilter(true);
}

function applyGameFilter(resetPage = false, isFromArrow = false) {
    if (resetPage || !isFromArrow) currentPage = 1;

    const logs = userLogs[modalUid]?.games || [];
    const results = logs.filter(g => g.game === modalGame);

    const date = document.getElementById("filter-date").value;
    const resultFilter = document.getElementById("filter-result").value;

    const filtered = results.filter(g => {
        const gameDate = new Date(g.timestamp).toISOString().split("T")[0];
        const isDateOk = !date || gameDate === date;
        const isResultOk =
            !resultFilter ||
            (resultFilter === "win" && g.result.includes("выиграл")) ||
            (resultFilter === "lose" && g.result.includes("проиграл"));
        return isDateOk && isResultOk;
    });

    const totalBets = filtered.reduce((sum, g) => sum + g.bet, 0);
    const totalWins = filtered.reduce((sum, g) => {
        if (g.result.includes("выиграл")) {
            const amount = parseFloat(g.result.split("выиграл")[1]);
            return isNaN(amount) ? sum : sum + amount;
        }
        return sum;
    }, 0);

    const currency = filtered[0]?.currency || '';
    document.getElementById("game-summary").innerHTML = filtered.length > 0 ? `
        <strong>Ставок:</strong> ${filtered.length}<br>
        <strong>Сумма ставок:</strong> ${totalBets} ${currency}<br>
        <strong>Выигрыш:</strong> ${totalWins} ${currency}<br>
        <strong>Итог:</strong> <span style="color:${totalWins - totalBets >= 0 ? 'lime' : 'red'};">
            ${totalWins - totalBets} ${currency}
        </span>
    ` : '';

    let winStreak = 0;
    const rendered = [];

    for (let i = 0; i < filtered.length; i++) {
        const g = filtered[i];
        const [d, t] = g.timestamp.replace("T", " ").split(" ");
        const isWin = g.result.includes("выиграл");
        if (isWin) winStreak++; else winStreak = 0;
        const suspiciousBet = isWin && g.bet >= 100;
        const suspiciousStreak = winStreak >= 5;

        rendered.push(`
            <div style="margin-bottom: 10px; border-left: 4px solid ${suspiciousBet || suspiciousStreak ? 'red' : 'var(--accent-blue)'}; padding-left: 10px;">
                <strong>${d} ${t.slice(0, 5)}</strong><br>
                Ставка: ${g.bet} ${g.currency}<br>
                Результат: ${g.result}<br>
                Баланс до: TON ${g.balanceStart?.ton ?? '-'} / USDT ${g.balanceStart?.usdt ?? '-'}<br>
                Баланс после: TON ${g.balanceEnd?.ton ?? '-'} / USDT ${g.balanceEnd?.usdt ?? '-'}
                ${suspiciousBet ? '<div style="color:red;">⚠️ Подозрительно крупная ставка</div>' : ''}
                ${suspiciousStreak ? '<div style="color:orange;">⚠️ Подозрительная серия побед</div>' : ''}
            </div>
        `);
    }

    const pagination = document.getElementById("pagination-controls");
    const pageInfo = document.getElementById("page-info");
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");

    const pageCount = Math.ceil(rendered.length / itemsPerPage);
    if (currentPage > pageCount) currentPage = 1;

    if (rendered.length === 0) {
        document.getElementById("filtered-game-results").innerHTML = "<p>Нет совпадений</p>";
        pagination.style.display = "none";
        pageInfo.textContent = "";
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = rendered.slice(startIndex, startIndex + itemsPerPage);
    document.getElementById("filtered-game-results").innerHTML = pageItems.join("");

    if (pagination && pageInfo && prevBtn && nextBtn) {
        if (rendered.length > itemsPerPage) {
            pagination.style.display = "flex";
            pageInfo.textContent = `Страница ${currentPage} из ${pageCount}`;
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === pageCount;
        } else {
            pagination.style.display = "none";
            pageInfo.textContent = "";
            prevBtn.disabled = true;
            nextBtn.disabled = true;
        }
    }
}

function closeGameModal() {
    document.getElementById("game-modal").style.display = "none";
    currentPage = 1;
    document.getElementById("filter-date").value = "";
    document.getElementById("filter-result").value = "";
}







function initUserLogFilter() {
    const select = document.getElementById("user-select");
    const input = document.getElementById("uid-search");

    // Заполняем select UID'ами
    Object.keys(userLogs).forEach(uid => {
        const opt = document.createElement("option");
        opt.value = uid;
        opt.textContent = uid;
        select.appendChild(opt);
    });

    // При выборе из списка
    select.addEventListener("change", () => {
        const uid = select.value;
        renderUserLogs(uid);
        input.value = ""; // очищаем input
    });

    // При вводе вручную
    input.addEventListener("input", () => {
        const uid = input.value.trim();
        if (uid in userLogs) {
            renderUserLogs(uid);
            select.value = ""; // сбрасываем select
        } else {
            clearUserLogs();
        }
    });
}

function clearUserLogs() {
    document.querySelector("#log-deposits .log-list").innerHTML = '';
    document.querySelector("#log-withdraws .log-list").innerHTML = '';
    document.querySelector("#log-games .log-list").innerHTML = '';
}


function renderUserLogs(uid) {
    const logs = userLogs[uid];

    const depositsList = document.querySelector("#log-deposits .log-list");
    const withdrawsList = document.querySelector("#log-withdraws .log-list");
    const gamesList = document.querySelector("#log-games .log-list");

    depositsList.innerHTML = logs.deposits.map(item =>
        `<li><strong>Пополнение:</strong> ${item}</li>`
    ).join("");

    withdrawsList.innerHTML = logs.withdraws.map(item =>
        `<li><strong>Вывод:</strong> ${item}</li>`
    ).join("");

   const grouped = {};

logs.games.forEach(g => {
    if (!grouped[g.game]) grouped[g.game] = [];
    grouped[g.game].push(g);
});

gamesList.innerHTML = Object.entries(grouped).map(([gameName, entries]) => {
    const first = entries[0];
    return `
        <li>
            <div><strong>${gameName}</strong> — ${entries.length} запис${entries.length === 1 ? 'ь' : 'и'}</div>
            <div>
                <button class="approve-btn" onclick="openGameModalByGame('${uid}', '${gameName}')">Открыть</button>
            </div>
        </li>
    `;
}).join("");

}



function showCustomAlert(message, type = "info") {
    const alertBox = document.createElement("div");
    alertBox.textContent = message;
    alertBox.style.position = "fixed";
    alertBox.style.bottom = "30px";
    alertBox.style.left = "50%";
    alertBox.style.transform = "translateX(-50%)";
    alertBox.style.color = "white";
    alertBox.style.padding = "12px 24px";
    alertBox.style.borderRadius = "8px";
    alertBox.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    alertBox.style.zIndex = "10000";
    alertBox.style.fontSize = "14px";
    alertBox.style.opacity = "0";
    alertBox.style.transition = "opacity 0.3s ease";

    // 🎨 Цвет по типу
    if (type === "success") {
        alertBox.style.background = "#22c55e"; // зелёный
    } else if (type === "error") {
        alertBox.style.background = "#ef4444"; // красный
    } else {
        alertBox.style.background = "#0072ff"; // синий по умолчанию
    }

    document.body.appendChild(alertBox);

    setTimeout(() => {
        alertBox.style.opacity = "1";
    }, 10);

    setTimeout(() => {
        alertBox.style.opacity = "0";
        setTimeout(() => alertBox.remove(), 300);
    }, 2000);
}





// ✅ Запуск
document.addEventListener("DOMContentLoaded", () => {
    checkTelegramAccess(); // ✅ теперь точно после подмены
    document.getElementById('login-screen').style.display = 'flex';
    document.querySelector('.admin-wrapper').style.display = 'none';

    initTabs();
    renderDeposits();
    renderWithdraws();
    initUserLogFilter();

        document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        applyGameFilter(false, true); // 👈
    }
});

document.getElementById("next-page").addEventListener("click", () => {
    currentPage++;
    applyGameFilter(false, true); // 👈
});

document.getElementById('playerSearch').addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();

    if (query === '') {
        filteredPlayers = [];
    } else {
        filteredPlayers = fakePlayers.filter(p =>
            p.username?.toLowerCase().includes(query) ||
            p.id.toString().includes(query)
        );
    }

    currentPlayerPage = 1;
    loadPlayers();
});





});

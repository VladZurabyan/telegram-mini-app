
function hideAll() {
    ['main','game-container','game-coin','game-boxes','game-dice','rules','partners'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showMain() {
    hideAll();
    document.getElementById('main').style.display = 'block';
}

function updateBetUI() {
    document.querySelectorAll('#betValue').forEach(s => s.innerText = bet);
}

function changeBet(delta) {
    bet = Math.min(Math.max(bet + delta, minBet), maxBet);
    updateBetUI();
}

function setBet(type) {
    bet = (type === 'min' ? minBet : type === 'max' ? maxBet : bet);
    updateBetUI();
}

function showLoader() {
    document.getElementById('loader').style.display = 'flex';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

// ✅ Фиктивные функции логирования — потом заменим на реальные
function Player_join(game, extra = "") {
    const log = `[LOG] Игрок вошёл в игру: ${game}${extra ? " | " + extra : ""}`;
    console.log(log);
}

function Player_action(game, type, detail = "") {
    const log = `[LOG] ${game} — ${type}${detail ? ": " + detail : ""}`;
    console.log(log);
}

function Player_leave(game, extra = "") {
    const log = `[LOG] Игрок покинул игру: ${game}${extra ? " | " + extra : ""}`;
    console.log(log);
}

function forceBalance(delay = 500) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
            if (!user) return resolve(); // даже если нет юзера — завершаем

            fetch(`${apiUrl}/balance/force`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: user.id })
            })
            .then(res => res.json())
            .then(data => {
                if (typeof data.ton === "number" && typeof data.usdt === "number") {
                    window.fakeBalance.ton = data.ton;
                    window.fakeBalance.usdt = data.usdt;
                    updateBalanceUI();
                }
                resolve(); // 🔑 завершаем Promise после обновления
            })
            .catch((err) => {
                console.error(err);
                resolve(); // даже при ошибке завершаем, чтобы не зависло
            });
        }, delay);
    });
}


window.showCustomAlert = function(message, type = "") {
    let alert = document.getElementById("custom-alert");
    let messageSpan = document.getElementById("custom-alert-message");

    if (!alert || !messageSpan) {
        document.body.insertAdjacentHTML("beforeend", `
            <div id="custom-alert" class="custom-alert" style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 99999;
                background: #323232;
                color: white;
                padding: 16px 24px;
                border-radius: 10px;
                font-family: 'Segoe UI', sans-serif;
                box-shadow: 0 0 10px rgba(0,0,0,0.4);
                max-width: 90%;
                text-align: center;
            ">
                <span id="custom-alert-message" style="display: block; margin-bottom: 10px;"></span>
                <button onclick="closeCustomAlert()" style="
                    background: #00c853;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    color: white;
                    cursor: pointer;
                ">OK</button>
            </div>
        `);
        alert = document.getElementById("custom-alert");
        messageSpan = document.getElementById("custom-alert-message");
    }

    alert.classList.remove("success", "error", "hidden");
    if (type) alert.classList.add(type);
    if (messageSpan) messageSpan.innerText = message;
};


window.closeCustomAlert = function() {
    const alert = document.getElementById("custom-alert");
    if (alert) {
        alert.classList.add("hidden");
        alert.classList.remove("success", "error");
    }
};





// Экспорт
window.showCustomAlert = showCustomAlert;
window.closeCustomAlert = closeCustomAlert;
window.forceBalance = forceBalance;
window.hideAll = hideAll;
window.showMain = showMain;
window.updateBetUI = updateBetUI;
window.changeBet = changeBet;
window.setBet = setBet;
window.showLoader = showLoader;
window.hideLoader = hideLoader;

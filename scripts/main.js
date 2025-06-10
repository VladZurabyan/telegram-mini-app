// 🔐 Блокировка запуска вне Telegram WebApp (надёжно)
(function () {
    const ua = navigator.userAgent;
    const isMobileTelegram = /Android|iPhone|iPad|iOS/i.test(ua);
    const isDesktopTelegram = /TelegramBot|Telegram Desktop|Electron/.test(ua);
    const isWebTelegram = !isMobileTelegram && !isDesktopTelegram;

    function denyAccess() {
        document.body.innerHTML = `
            <div style="position: fixed; inset: 0; display: flex; justify-content: center; align-items: center; background: rgba(15, 15, 15, 0.85); backdrop-filter: blur(10px); z-index: 99999; font-family: 'Segoe UI', sans-serif; color: #fff;">
                <div style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 16px; padding: 30px 40px; text-align: center; box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); animation: fadeIn 0.5s ease-out;">
                    <h2 style="font-size: 28px; margin-bottom: 16px; color: #ff4e4e;">⛔ Доступ запрещён</h2>
                    <p style="font-size: 18px; line-height: 1.5;">
                        Откройте игру из <b>Telegram Mini App</b><br>
                        на телефоне или через Telegram Desktop.
                    </p>
                </div>
            </div>
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            </style>
        `;
        throw new Error("⛔ Запрещён запуск вне Telegram");
    }

    // Ждём загрузки Telegram WebApp SDK
    if (window.Telegram?.WebApp) {
        Telegram.WebApp.ready();

        setTimeout(() => {
            const initDataExists = !!Telegram.WebApp.initData;
            const isUserValid = !!Telegram.WebApp.initDataUnsafe?.user;

            if (!initDataExists || !isUserValid || isWebTelegram) {
                denyAccess();
            }
        }, 200); // можно увеличить до 300–400 мс если лаги
    } else {
        denyAccess();
    }
})();


// 🛡️ DevTools защита
(function () {
    // Блокировка F12, Ctrl+Shift+I/J/C, Ctrl+U
    document.addEventListener("keydown", function (e) {
        if (
            e.key === "F12" ||
            (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
            (e.ctrlKey && e.key === "U")
        ) {
            e.preventDefault();
            
           
                alert("⛔ DevTools запрещены");
            
              
            return false;
        }
    });

    // Блокировка ПКМ
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });

    // Проверка на DevTools через размеры
    let devtoolsTriggered = false;
    setInterval(() => {
        const isDevToolsOpen =
            window.outerHeight - window.innerHeight > 160 ||
            window.outerWidth - window.innerWidth > 160;

        if (isDevToolsOpen && !devtoolsTriggered) {
            devtoolsTriggered = true;

           
                alert("⛔ Обнаружено возможное открытие DevTools. Это запрещено.");
             
            if (typeof Player_action === 'function') {
                Player_action("Security", "DevTools", "DevTools замечены через resize");
            }
        }
    }, 1000);

    // Проверка через debugger
    setInterval(() => {
        const start = performance.now();
        debugger;
        const end = performance.now();
        if (end - start > 100) {
            document.body.innerHTML = "<h1 style='color:red; text-align:center;'>⛔ DevTools запрещены</h1>";
        }
    }, 2000);
})();












const apiUrl = "https://miniapp-backend.onrender.com";
const tg = window.Telegram.WebApp;
const user = tg.initDataUnsafe?.user;

const fakeBalance = {
        ton: 0,
        usdt: 0
};

const winsCount = 2;
const lossesCount = 10;
const totalCount = winsCount + lossesCount;


let lastActivityTime = Date.now();
let isIdle = false;
let isListening = false;
let balanceAbortController = null;

const activeGames = {
        'partners': true,
        'rules': true,
        'deposit': true,
        'withdraw': true,
        'game-coin': true,
        'game-crash': true,
        'game-boxes': true,
        'game-dice': true,
        'game-chicken': true,
        'game-safe': true,
        'game-bombs': true,
        'game-arrow': false,
        'game-21': true,
        'game-wheel': true
    };

 
    function showDatabaseErrorOverlay() {
    document.body.innerHTML = `
    <div id="overlay" style="
        position: fixed;
        inset: 0;
        background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
        backdrop-filter: blur(14px);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Segoe UI', sans-serif;
        z-index: 99999;
        animation: fadeIn 0.4s ease-out;
    ">
        <div style="
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 40px 30px;
            box-shadow: 0 0 20px rgba(0,0,0,0.4);
            max-width: 420px;
            width: 70%;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
        ">
            <h2 style="
                font-size: 32px;
                color: #ff4e4e;
                margin-bottom: 12px;
                text-shadow: 0 0 12px #ff4e4e;
            ">База данных недоступна</h2>
            
            <p id="overlay-message" style="
                font-size: 18px;
                margin: 10px 0 30px;
                color: #f1f1f1;
            ">Пожалуйста, подождите или нажмите кнопку ниже, чтобы попробовать ещё раз.</p>
            
            <button onclick="retryInit()" style="
                padding: 14px 30px;
                font-size: 16px;
                border-radius: 10px;
                border: none;
                background: #00c853;
                color: white;
                cursor: pointer;
                box-shadow: 0 0 12px #00c853;
                transition: background 0.3s, transform 0.2s;
            " onmouseover="this.style.background='#00e676'" onmouseout="this.style.background='#00c853'">
                🔄 Повторить
            </button>
        </div>
    </div>

    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
    </style>
    `;
}


async function retryInit() {
    const msgEl = document.getElementById("overlay-message");

    try {
        const res = await fetch(`${apiUrl}/health`, { method: "GET" });

        if (!res.ok) {
            if (msgEl) msgEl.innerText = "⛔ Сервер отвечает с ошибкой. Попробуйте позже.";
            return;
        }

        const data = await res.json();

        if (data.status === "ok") {
            document.body.innerHTML = "";
            window.location.reload();
        } else {
            if (msgEl) msgEl.innerText = "⛔ Сервер всё ещё недоступен. Попробуйте позже.";
        }

    } catch (err) {
        console.error("Ошибка при fetch:", err);

        // Диагностика по сообщению ошибки (работает в Chrome/Firefox)
        const isNetworkError = err instanceof TypeError;

        if (msgEl) {
            msgEl.innerText = isNetworkError
                ? "⛔ Нет ответа от сервера. Возможно, он выключен или перегружен."
                : "⛔ Не удалось подключиться к серверу. Проверьте интернет.";
        }
    }
}





    async function checkBackendHealth() {
    try {
        const res = await fetch(`${apiUrl}/health`);
        const data = await res.json();
        if (data.status !== "ok") {
            throw new Error("Database unavailable");
        }
    } catch (err) {
        showDatabaseErrorOverlay();
        throw new Error("⛔ Бэкенд не доступен");
    }
}

let backendHealthy = true;

function startBackendHealthMonitor() {
    setInterval(async () => {
        try {
            const res = await fetch(`${apiUrl}/health`);
            const data = await res.json();
            if (data.status !== "ok") throw new Error();
            backendHealthy = true;
        } catch {
            if (backendHealthy) {
                backendHealthy = false;
                showDatabaseErrorOverlay();
            }
        }
    }, 10000); // проверка каждые 10 секунд
}


function checkBackendConnection() {
    console.log("✅ Бэкенд успешно подключен.");
}



// 🔁 Главная инициализация
  (async function () {  
    tg.ready();
    tg.expand();
    tg.requestFullscreen();
    tg.disableVerticalSwipes();

        
        
    try {
        await checkBackendHealth();      // ✅ проверка бэкенда
            startBackendHealthMonitor();
        checkBackendConnection();        // ✅ лог успешного подключения


            // ✅ Синхронизация баланса при старте
if (user) {
    fetch(`${apiUrl}/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, username: user.username || "unknown" })
    })
    .then(r => r.json())
    .then(d => {
        window.fakeBalance.ton = d.ton;
        window.fakeBalance.usdt = d.usdt;
        updateBalanceUI();
     // ⏳ Сразу обновим баланс, чтобы он был точным
        startBalanceListener();
       
    });
}
        // здесь продолжай инициализацию
    } catch (err) {
        console.error(err.message);
    }
})();



























function openDeposit() {
    loadGame('deposit');
}

function initDeposit() {
    window.selectedCurrency = 'ton';

    const tonBtn = document.getElementById('deposit-ton');
    const usdtBtn = document.getElementById('deposit-usdt');
    const input = document.getElementById('deposit-amount');
    const submitBtn = document.getElementById('deposit-submit');

    // Валюта переключение
    tonBtn.addEventListener('click', () => setDepositCurrency('ton'));
    usdtBtn.addEventListener('click', () => setDepositCurrency('usdt'));

    // Автофокус
    setTimeout(() => input.focus(), 300);

    // Отправка
    submitBtn.addEventListener('click', () => {
        const raw = parseFloat(input.value);
        const amount = Math.floor(raw);

        if (!raw || raw <= 0) {
            showCustomAlert("Введите сумму", "error");
            return;
        }

        if (!Number.isInteger(raw)) {
            showCustomAlert("Введите целое число без копеек", "error");
            return;
        }

        if (window.selectedCurrency === 'ton' && amount < 2) {
            showCustomAlert("Минимум 2 TON", "error");
            return;
        }

        if (window.selectedCurrency === 'usdt' && amount < 10) {
            showCustomAlert("Минимум 10 USDT", "error");
            return;
        }

        const payload = {
            user_id: window.Telegram.WebApp.initDataUnsafe?.user?.id || "unknown",
            currency: window.selectedCurrency,
            amount: amount
        };

        console.log("⏳ Запрос на пополнение:", payload);

        showCustomAlert(
            `✅ Запрос на пополнение отправлен\n\nВалюта: ${payload.currency.toUpperCase()}\nСумма: ${payload.amount}`,
            "success"
        );

        // TODO: отправить на backend
    });

    function setDepositCurrency(curr) {
        window.selectedCurrency = curr;
        tonBtn.classList.toggle('active', curr === 'ton');
        usdtBtn.classList.toggle('active', curr === 'usdt');
        input.placeholder = `Введите сумму в ${curr.toUpperCase()}`;
    }
}




function openWithdraw() {
    loadGame('withdraw');
}

function initWithdraw() {
    window.selectedCurrency = 'ton';
    let selectedNetwork = 'bep20';

    const tonBtn = document.getElementById('withdraw-ton');
    const usdtBtn = document.getElementById('withdraw-usdt');
    const networkContainer = document.getElementById('usdt-network-container');
    const addressInput = document.getElementById('withdraw-address');

    // Переключение валюты
    tonBtn.addEventListener('click', () => {
        window.selectedCurrency = 'ton';
        tonBtn.classList.add('active');
        usdtBtn.classList.remove('active');
        networkContainer.style.display = 'none';
        addressInput.placeholder = 'Адрес TON';
    });

    usdtBtn.addEventListener('click', () => {
        window.selectedCurrency = 'usdt';
        tonBtn.classList.remove('active');
        usdtBtn.classList.add('active');
        networkContainer.style.display = 'flex';
        addressInput.placeholder = `Адрес USDT (${selectedNetwork.toUpperCase()})`;
    });

    // Селектор сети
    const networkBtns = document.querySelectorAll('.network-btn');
    networkBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            networkBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedNetwork = btn.dataset.network;
            if (window.selectedCurrency === 'usdt') {
                addressInput.placeholder = `Адрес USDT (${selectedNetwork.toUpperCase()})`;
            }
        });
    });

    // Отправка
   document.getElementById('withdraw-submit').addEventListener('click', () => {
    const rawAmount = parseFloat(document.getElementById('withdraw-amount').value);
    const amount = Math.floor(rawAmount);
    const address = addressInput.value.trim();

    if (!rawAmount || rawAmount <= 0) return showCustomAlert("Введите сумму", "error");
    if (!Number.isInteger(rawAmount)) return showCustomAlert("Введите целое число без копеек", "error");
    if (window.selectedCurrency === 'ton' && amount < 2) return showCustomAlert("Минимум 2 TON", "error");
    if (window.selectedCurrency === 'usdt' && amount < 10) return showCustomAlert("Минимум 10 USDT", "error");
    if (!address) return showCustomAlert("Введите адрес", "error");

    const payload = {
        user_id: window.Telegram.WebApp.initDataUnsafe?.user?.id || "unknown",
        currency: window.selectedCurrency,
        amount: amount,
        address: address,
        network: window.selectedCurrency === 'usdt' ? selectedNetwork.toUpperCase() : 'TON'
    };

    console.log("⏳ Запрос на вывод:", payload);

    // TODO: отправить на backend
    showCustomAlert(`✅ Запрос отправлен\n\nВалюта: ${payload.currency.toUpperCase()}\nСумма: ${payload.amount}\nСеть: ${payload.network}\nАдрес: ${payload.address}`, "success");
});

}

async function startBalanceListener() {
    if (isListening || isIdle) return;

    isListening = true;
    const user = tg.initDataUnsafe?.user;
    if (!user) return;

    while (isListening) {
        try {
            balanceAbortController = new AbortController();

            const res = await fetch(`${apiUrl}/balance/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: balanceAbortController.signal,
                body: JSON.stringify({
                    user_id: user.id,
                    current_ton: window.fakeBalance.ton,
                    current_usdt: window.fakeBalance.usdt
                })
            });

            const data = await res.json();
            if (data.update === false) continue;

            if (typeof data.ton === "number" && typeof data.usdt === "number") {
                window.fakeBalance.ton = data.ton;
                window.fakeBalance.usdt = data.usdt;
                updateBalanceUI();
            }
        } catch (e) {
            if (e.name !== "AbortError") {
                console.error("Balance listener error:", e);
                await new Promise(res => setTimeout(res, 3000));
            }
        }
    }
}

function stopBalanceListener() {
    isListening = false;
    if (balanceAbortController) {
        balanceAbortController.abort();
        balanceAbortController = null;
    }
}



function updateBalanceOnce() {
    const user = tg.initDataUnsafe?.user;
    if (!user) return;

    fetch(`${apiUrl}/balance/${user.id}`)
        .then(res => res.json())
        .then(data => {
            if (typeof data.ton === "number" && typeof data.usdt === "number") {
                window.fakeBalance.ton = data.ton;
                window.fakeBalance.usdt = data.usdt;
                updateBalanceUI();
            }
        })
        .catch(console.error);
}
window.updateBalanceOnce = updateBalanceOnce;


function resetIdleTimer() {
    lastActivityTime = Date.now();
    if (isIdle) {
        isIdle = false;
        startBalanceListener(); // возобновить подписку
        
    }
}

["click", "mousemove", "keydown", "touchstart"].forEach(evt =>
    document.addEventListener(evt, resetIdleTimer)
);

// ⏱ Проверка на бездействие каждые 10 сек
setInterval(() => {
    if (!isIdle && Date.now() - lastActivityTime > 60000) {
        isIdle = true;
        stopBalanceListener();
        console.log("🛑 Подписка остановлена по бездействию");
    }
}, 10000);






function backToMain() {
    const game = window.activeGameId;
    if (game === 'game-coin') resetCoinScreen();
    else if (game === 'game-safe') resetSafeScreen();
    else if (game === 'game-boxes') resetBoxesScreen();
    else if (game === 'game-chicken') resetChickenScreen();
    else if (game === 'game-dice') resetDiceScreen();
    else if (game === 'game-crash') resetCrashScreen();
     else if (game === 'game-bombs') resetBombsScreen();
     else if (game === 'game-wheel') resetWheelScreen();
    else if (game === 'game-arrow') resetTarget();
     else if (game === 'game-21') reset21Screen();




        showMain();
}

function loadGame(gameId) {
        const path = {
            'withdraw': 'games/withdraw.html',
                 'deposit': 'games/deposit.html',
                'game-21': 'games/game-21.html',
                'game-arrow': 'games/game-arrow.html',
                'game-wheel': 'games/game-wheel.html',
                'game-bombs': 'games/game-bombs.html',
                'game-safe': 'games/game-safe.html',
                'game-chicken': 'games/game-chicken.html',
                'game-crash': 'games/game-crash.htm', // ← ДОБАВЬ ЭТУ СТРОКУ
                'game-coin': 'games/game-coin.html',
                'game-boxes': 'games/game-boxes.html',
                'game-dice': 'games/game-dice.html',
                'rules': 'games/rules.html',
                'partners': 'games/partners.html',
        }[gameId];

        if (!path) return;

         const container = document.getElementById('game-container');
        // ✅ Проверка отключённой игры
    if (!activeGames[gameId]) {
        hideAll();
        container.style.display = 'block';
        container.innerHTML = `
    <div id="disabled-screen" class="game-screen" style="min-height: 100vh; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: white;">
        <div class="disabled-wrapper" style="border: 2px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 30px 20px; background: rgba(255,255,255,0.05); backdrop-filter: blur(6px); box-shadow: 0 0 10px rgba(0,0,0,0.4); max-width: 400px;">
            <h2 style="font-size: 24px; margin-bottom: 10px;">⚙️ Игра недоступна</h2>
            <p style="font-size: 16px;">Эта игра временно отключена администратором или находится в доработке.</p>
        </div>
        <button id="btn-disabled-back" class="back-btn" style="margin-top: 30px;">Назад</button>
    </div>
`;

        // ⏳ Подождём, пока DOM вставится, затем назначим обработчик

        document.getElementById('btn-disabled-back')?.addEventListener('click', backToMain);



        return;
    }




        bet = minBet;

        hideAll();

        container.innerHTML = '';
        container.style.display = 'block';
        showLoader();

        fetch(path)
                .then(r => {
                        if (!r.ok) throw new Error("Ошибка загрузки: " + r.status);
                        return r.text();
                })
                .then(html => {
                        container.innerHTML = html;
                        if (gameId === 'deposit') initDeposit();
                        if (gameId === 'withdraw') initWithdraw();

                        const screen = document.getElementById(gameId);
                        if (screen) {
                                screen.classList.remove('game-screen');
                                screen.style.display = 'block';
                        }

                        updateBalanceUI();

                        if (gameId === 'game-coin') {
    // При входе в игру сразу обновим баланс
    if (typeof updateBalanceOnce === 'function') updateBalanceOnce();

    // Валюта
    document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
    document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));
    setCurrency(selectedCurrency);

    // Кнопки ставки
    const betBtns = document.querySelectorAll('#game-coin .bet-box button');
    betBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.innerText.toLowerCase();
            if (text === 'min') setBet('min');
            else if (text === 'max') setBet('max');
            else if (text === '+') changeBet(1);
            else if (text === '-') changeBet(-1);
        });
    });

    updateBalanceUI();
    updateBetUI();

    // Выбор стороны
    document.getElementById('btn-heads')?.addEventListener('click', () => setCoinChoice('heads'));
    document.getElementById('btn-tails')?.addEventListener('click', () => setCoinChoice('tails'));

    // Играть
    document.querySelector('.play-btn')?.addEventListener('click', function () {
        playCoin(this); // внутри playCoin — local fakeBalance списывается и recordGame()
    });

    // Назад
    document.getElementById('btn-back-coin')?.addEventListener('click', () => {
        backToMain(); // внутри backToMain: resetCoinScreen(), showMain(), ничего не сбрасывает поток
    });
}


                        if (gameId === 'game-boxes') {
                            // При входе в игру сразу обновим баланс
    if (typeof updateBalanceOnce === 'function') updateBalanceOnce();

                                document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
                                document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));
                                setCurrency(selectedCurrency);

                                const boxes = container.querySelectorAll('.boxes img');
                                boxes.forEach((img, i) => {
                                        img.src = `assets/box${i + 1}.png`;
                                        img.style.opacity = '0';
                                        img.style.transform = 'translateY(50px)';
                                        img.style.border = 'none';
                                        img.style.pointerEvents = 'auto';
                                        img.classList.remove('selected-box', 'prize-box');
                                        img.addEventListener('click', () => selectBox(i));
                                });



                                const result = document.getElementById('boxResult');
                                if (result) result.innerText = '';

                                const betBtns = document.querySelectorAll('#game-boxes .bet-box button');
                                betBtns.forEach(btn => {
                                        btn.addEventListener('click', () => {
                                                const text = btn.innerText.toLowerCase();
                                                if (text === 'min') setBet('min');
                                                else if (text === 'max') setBet('max');
                                                else if (text === '+') changeBet(1);
                                                else if (text === '-') changeBet(-1);
                                        });
                                });

                                document.getElementById('btn-box-replay')?.addEventListener('click', () => {
                                        document.querySelector('#game-boxes .currency-selector')?.classList.remove('disabled');
                                        document.querySelector('#game-boxes .bet-box')?.classList.remove('disabled');

                                        const boxImgs = document.querySelectorAll('#game-boxes .boxes img');
                                        boxImgs.forEach((img, i) => {
                                                img.src = `assets/box${i + 1}.png`;
                                                img.style.pointerEvents = 'auto';
                                                img.classList.remove('selected-box', 'prize-box');
                                        });

                                        document.getElementById('boxResult').innerText = '';
                                        document.getElementById('boxPrize').innerText = ''; // ← очищает надпись выигрыша
                                        document.getElementById('btn-box-replay').style.display = 'none';
                                });

                                bet = minBet;
                                updateBalanceUI(); // чтобы сразу отображалось
                                 updateBetUI();
                               
                                container.querySelector('.back-btn')?.addEventListener('click', backToMain);
                        }

        if (gameId === 'game-dice') {
           // При входе в игру сразу обновим баланс
    if (typeof updateBalanceOnce === 'function') updateBalanceOnce();
        // Добавляем обработчики валют
        document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
        document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));
        setCurrency(selectedCurrency); // отобразить выбранную валюту

        // Кнопка Играть
        const playBtn = container.querySelector('.play-btn');
        if (playBtn) {
                const newPlayBtn = playBtn.cloneNode(true);
                playBtn.replaceWith(newPlayBtn);
                newPlayBtn.addEventListener('click', function () {
                        playDice(this);
                });
        }
        updateBalanceUI(); // чтобы сразу отображалось
    updateBetUI();
                               
        // Назад
        container.querySelector('.back-btn')?.addEventListener('click', backToMain);
}




if (gameId === 'game-crash') {
    if (typeof updateBalanceOnce === 'function') updateBalanceOnce();

    document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
    document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));
    setCurrency(selectedCurrency); // Выставить текущую валюту
    updateBalanceUI(); // И сразу отобразить

    // Обработчики кнопок ставок
    const betBtns = document.querySelectorAll('#game-crash .bet-box button');
    betBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.innerText.toLowerCase();
            if (text === 'min') setBet('min');
            else if (text === 'max') setBet('max');
            else if (text === '+') changeBet(1);
            else if (text === '-') changeBet(-1);
        });
    });
    updateBetUI();

    // Кнопки "Играть" и "Забрать"
    const startBtn = document.getElementById('crash-start');
    const cashBtn = document.getElementById('crash-cashout');
    if (startBtn) {
        const newStart = startBtn.cloneNode(true);
        startBtn.replaceWith(newStart);
        newStart.addEventListener('click', () => playCrash());
    }
    if (cashBtn) {
        const newCash = cashBtn.cloneNode(true);
        cashBtn.replaceWith(newCash);
        newCash.addEventListener('click', () => crashCashOut());
    }

    // Назад
    document.getElementById('btn-back-crash')?.addEventListener('click', backToMain);
}




        if (gameId === 'game-chicken') {
           if (typeof updateBalanceOnce === 'function') updateBalanceOnce();
 
        document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
        document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));
        setCurrency(selectedCurrency); // выставить текущую валюту

        // Обработчики кнопок ставок
        const betBtns = document.querySelectorAll('#game-chicken .bet-box button');
        betBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                        const text = btn.innerText.toLowerCase();
                        if (text === 'min') setBet('min');
                        else if (text === 'max') setBet('max');
                        else if (text === '+') changeBet(1);
                        else if (text === '-') changeBet(-1);
                });
        });
        updateBalanceUI(); // чтобы сразу отображалось
    updateBetUI();

        // Кнопка "Играть"
        const startBtn = document.getElementById('chickenStart');
        if (startBtn) {
                const newStart = startBtn.cloneNode(true);
                startBtn.replaceWith(newStart);
                newStart.addEventListener('click', () => playChickenGame());
        }
         
        // Кнопка "Назад"
        document.querySelector('#game-chicken .back-btn')?.addEventListener('click', backToMain);
}




    if (gameId === 'game-safe') {
          if (typeof updateBalanceOnce === 'function') updateBalanceOnce();
        document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
        document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));
        setCurrency(selectedCurrency);

        const betBtns = document.querySelectorAll('#game-safe .bet-box button');
        betBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                        const text = btn.innerText.toLowerCase();
                        if (text === 'min') setSafeBet('min');
                        else if (text === 'max') setSafeBet('max');
                        else if (text === '+') changeSafeBet(1);
                        else if (text === '-') changeSafeBet(-1);
                });
        });

        document.getElementById('hint-btn')?.addEventListener('click', () => showHint());

       
// Кнопка Играть
       const startBtn = document.getElementById('safeStart');
if (startBtn) {
    const newBtn = startBtn.cloneNode(true); // удалить обработчики
    startBtn.replaceWith(newBtn); // заменить
    newBtn.addEventListener('click', playSafeGame); // навесить заново
}










        // Кнопка Назад
        document.querySelector('#game-safe .back-btn')?.addEventListener('click', backToMain);


                updateBetUI();
                setupDigitClicks();
                updateSafeDigits();
                updateBalanceUI();
           

}


                   if (gameId === 'game-bombs') {
                       window.inGame = true;
                            clearInterval(window.balanceUpdater);
                       showEmptyBombGrid();
    document.querySelector('#game-bombs .back-btn')?.addEventListener('click', backToMain);
    document.getElementById('bomb-cashout')?.addEventListener('click', collectBombsPrize);
    document.getElementById('btn-bomb-start')?.addEventListener('click', startBombsGame);

    document.querySelectorAll('#game-bombs .bet-box button').forEach(btn => {
        const text = btn.innerText.toLowerCase();
        btn.addEventListener('click', () => {
            if (text === '+') changeBet(1);
            else if (text === '-') changeBet(-1);
            else if (text === 'min') setBet('min');
            else if (text === 'max') setBet('max');
        });
    });

    document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
    document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));
    setCurrency(selectedCurrency);
        updateBalanceUI(); // чтобы сразу отображалось
    updateBetUI();
    window.inGame = false;
                                window.balanceUpdater();
}




      if (gameId === 'game-wheel') {
          window.inGame = true;
                            clearInterval(window.balanceUpdater);
    document.querySelector('#game-wheel .back-btn')?.addEventListener('click', backToMain);
    document.getElementById('btn-wheel-spin')?.addEventListener('click', spinWheel);

    document.querySelectorAll('#game-wheel .bet-box button').forEach(btn => {
        const text = btn.innerText.toLowerCase();
        btn.addEventListener('click', () => {
            if (text === '+') changeBet(1);
            else if (text === '-') changeBet(-1);
            else if (text === 'min') setBet('min');
            else if (text === 'max') setBet('max');
        });
    });

    document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
    document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));
    setCurrency(selectedCurrency);
    updateBalanceUI(); // чтобы сразу отображалось
    updateBetUI();
    window.inGame = false;
                                window.balanceUpdater();
}

   if (gameId === 'game-arrow') {
       window.inGame = true;
                            clearInterval(window.balanceUpdater);
    initArrowScene();

    document.querySelector('#game-arrow .back-btn')?.addEventListener('click', () => {
        resetTarget();                 // 💥 Полный сброс сцены
        arrowResult = null;
        cashoutPressed = false;
        arrowInProgress = false;
        document.getElementById('arrow-result').innerText = '';
        document.getElementById('arrow-prize').innerText = '';
        document.getElementById('arrow-cashout')?.classList.add('hidden');
        document.getElementById('btn-arrow-start')?.classList.remove('hidden');
        showMain();                    // ← Возврат в главное меню
    });

    document.getElementById('btn-arrow-start')?.addEventListener('click', () => {
        console.log('[DEBUG] Старт стрелы');  // отладка
        startArrowGame();
    });

    document.getElementById('arrow-cashout')?.addEventListener('click', collectArrowPrize);

    document.querySelectorAll('#game-arrow .bet-box button').forEach(btn => {
        const text = btn.innerText.toLowerCase();
        btn.addEventListener('click', () => {
            if (text === '+') changeBet(1);
            else if (text === '-') changeBet(-1);
            else if (text === 'min') setBet('min');
            else if (text === 'max') setBet('max');
        });
    });

    document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
    document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));
    setCurrency(selectedCurrency);
    updateBalanceUI(); // чтобы сразу отображалось
    updateBetUI();
    window.inGame = false;
                                window.balanceUpdater();
}








if (gameId === 'game-21') {
     window.inGame = true;
                            clearInterval(window.balanceUpdater);
    initBlackjackScene();




    // Назад
    document.querySelector('#game-21 .back-btn')?.addEventListener('click', () => {
        reset21Screen();                     // 💥 сброс карт
        destroyBlackjackScene();            // 🧹 очистка PixiJS сцены

        document.getElementById('blackjack-result').innerText = '';
        document.getElementById('blackjack-prize').innerText = '';

        document.getElementById('btn-blackjack-start')?.classList.remove('hidden');
        document.getElementById('btn-blackjack-hit')?.classList.add('hidden');
        document.getElementById('btn-blackjack-stand')?.classList.add('hidden');

        showMain();
    });

    // Начать игру
    document.getElementById('btn-blackjack-start')?.addEventListener('click', () => {
        console.log('[DEBUG] Blackjack старт');
        startBlackjackGame(); // 👈 запускает раздачу
    });

    // Взять карту
    document.getElementById('btn-blackjack-hit')?.addEventListener('click', () => {
        console.log('[DEBUG] Взять карту');
        hitCard(); // 👈 выдаёт карту игроку
    });

    // Открыть (стоп)
    document.getElementById('btn-blackjack-stand')?.addEventListener('click', () => {
        console.log('[DEBUG] Стоп');
        revealDealerAndFinish(); // 👈 дилер добирает карты, финал
    });

    // Управление ставкой
    document.querySelectorAll('#game-21 .bet-box button').forEach(btn => {
        const text = btn.innerText.toLowerCase();
        btn.addEventListener('click', () => {
            if (text === '+') changeBet(1);
            else if (text === '-') changeBet(-1);
            else if (text === 'min') setBet('min');
            else if (text === 'max') setBet('max');
        });
    });

    // Валюта
    document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
    document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));

   setCurrency(window.selectedCurrency);


    updateBalanceUI(); // чтобы сразу отображалось
    updateBetUI();
    window.inGame = false;
                                window.balanceUpdater();
}



   if (gameId === 'rules') {
    const container = document.getElementById('rules');
    container.querySelector('.back-btn')?.addEventListener('click', backToMain);

    const tabs = ['tab-rules', 'tab-responsibility', 'tab-terms'];

    function showTab(id) {
        tabs.forEach(tabId => {
            const tab = document.getElementById(tabId);
            const btn = document.getElementById('btn-' + tabId.split('-')[1]);

            if (tab) {
                tab.classList.remove('active');
                tab.style.display = 'none';
            }
            if (btn) {
                btn.classList.remove('active');
            }
        });

        const targetTab = document.getElementById(id);
        const targetBtn = document.getElementById('btn-' + id.split('-')[1]);

        if (targetTab) {
            targetTab.style.display = 'block';
            requestAnimationFrame(() => targetTab.classList.add('active'));
        }

        if (targetBtn) {
            targetBtn.classList.add('active');
        }
    }

    document.getElementById('btn-rules')?.addEventListener('click', () => showTab('tab-rules'));
    document.getElementById('btn-responsibility')?.addEventListener('click', () => showTab('tab-responsibility'));
    document.getElementById('btn-terms')?.addEventListener('click', () => showTab('tab-terms'));

    showTab('tab-rules');
}


if (gameId === 'partners') {
    const container = document.getElementById('partners');
    container.querySelector('.back-btn')?.addEventListener('click', backToMain);

    // Тут можешь добавить свою отдельную логику для partners
}
















                        setTimeout(() => {
        hideLoader();

        if (gameId === 'game-coin') {
                const img = document.getElementById('coinImageMain');
                if (img) {
                        resetCoinScreen();
                        img.classList.remove('flip-head', 'flip-tail');
                        void img.offsetWidth;
                        img.classList.add('flip-head');
                        img.addEventListener('animationend', function handler() {
                                img.removeEventListener('animationend', handler);
                                img.classList.remove('flip-head');
                        }, { once: true });
                }
        }

        if (gameId === 'game-boxes') {
                const boxes = document.querySelectorAll('#game-boxes .boxes img');
                boxes.forEach((img, i) => {
                        img.style.animation = 'none';
                        void img.offsetWidth;
                        img.style.animation = `boxIn 0.5s ease-out forwards ${i * 100}ms`;
                });
        }

        if (gameId === 'game-dice') {
    const img = document.getElementById('diceImage');
    if (img) {
        img.classList.remove('dice-safe-throw'); // сброс
        void img.offsetWidth;                    // перезапуск
        img.classList.add('dice-safe-throw');    // повтор анимации
    }

    resetDiceScreen(); // сброс состояния
}




}, 700);

                })
                .catch(err => {
                        container.innerHTML = '<p style="color:red;">Ошибка загрузки игры</p>';
                        console.error(err);
                });
}














function formatAmount(amount) {
        const fixed = parseFloat(amount.toFixed(2));
        return Object.is(fixed, -0) ? "0.00" : fixed.toFixed(2);
}


function updateBalanceUI() {
        fakeBalance.ton = parseFloat(fakeBalance.ton.toFixed(2));
        fakeBalance.usdt = parseFloat(fakeBalance.usdt.toFixed(2));

        document.querySelectorAll(".balance span")[0].textContent = formatAmount(fakeBalance.ton);
        document.querySelectorAll(".balance span")[1].textContent = formatAmount(fakeBalance.usdt);

        const tonBtn  = document.getElementById('btn-currency-ton');
        const usdtBtn = document.getElementById('btn-currency-usdt');

        if (tonBtn)  tonBtn.textContent  = `TON (${formatAmount(fakeBalance.ton)})`;
        if (usdtBtn) usdtBtn.textContent = `USDT (${formatAmount(fakeBalance.usdt)})`;
}


updateBalanceUI();

window.backToMain = backToMain;
window.fakeBalance = fakeBalance;
window.bet = 1;
window.minBet = 1;
window.maxBet = 100;

if (document.querySelectorAll(".balance span").length >= 2) {
    updateBalanceUI();
}


window.backToMain = backToMain;
window.fakeBalance = fakeBalance;
window.bet = 1;
window.minBet = 1;
window.maxBet = 100;
window.loadGame = loadGame;
window.updateBalanceUI = updateBalanceUI;

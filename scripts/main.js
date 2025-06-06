 /* if (!window.Telegram || !window.Telegram.WebApp || !window.Telegram.WebApp.initData) {
    // Не в Telegram — показываем заглушку или редирект
    document.body.innerHTML = `
        <div style="display:flex;justify-content:center;align-items:center;height:100vh;text-align:center;font-family:sans-serif;">
            <div>
                <h2>⛔ Эта игра доступна только через Telegram</h2>
                <p>Пожалуйста, откройте её из Telegram Mini App</p>
            </div>
        </div>
    `;
} */






const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
tg.requestFullscreen(); // ← ВАЖНО: вызываем сразу
 window.Telegram.WebApp.disableVerticalSwipes()
const fakeBalance = {
        ton: 10,
        usdt: 100
};

const winsCount = 10;
const lossesCount = 10;
const totalCount = winsCount + lossesCount;

const user = tg.initDataUnsafe?.user;
const apiUrl = "https://miniapp-backend.onrender.com";

if (user) {
    fetch(`${apiUrl}/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, username: user.username || "unknown" })
    })
    .then(r => r.json())
    .then(d => {
        document.querySelectorAll(".balance span")[0].textContent = d.ton.toFixed(2);
        document.querySelectorAll(".balance span")[1].textContent = d.usdt.toFixed(2);
    });
}


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

function fetchBalance() {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    fetch(`${apiUrl}/balance/${user.id}`)
        .then(res => res.json())
        .then(data => {
            if (data && typeof data.ton === "number") {
                fakeBalance.ton = data.ton;
                fakeBalance.usdt = data.usdt;
                updateBalanceUI();
            }
        });
}







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
        resetCoinScreen();

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

        bet = minBet;

        hideAll();
        const container = document.getElementById('game-container');
        showLoader();
        container.innerHTML = '';
        container.style.display = 'block';

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
                                document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
                                document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));
                                setCurrency(selectedCurrency);

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

                                updateBetUI();
                                document.getElementById('btn-heads')?.addEventListener('click', () => setCoinChoice('heads'));
                                document.getElementById('btn-tails')?.addEventListener('click', () => setCoinChoice('tails'));
                                document.querySelector('.play-btn')?.addEventListener('click', function () { playCoin(this); });
                                document.getElementById('btn-back-coin')?.addEventListener('click', backToMain);


                        }

                        if (gameId === 'game-boxes') {
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
                                updateBetUI();
                                container.querySelector('.back-btn')?.addEventListener('click', backToMain);
                        }

        if (gameId === 'game-dice') {
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

        // Назад
        container.querySelector('.back-btn')?.addEventListener('click', backToMain);
}




if (gameId === 'game-crash') {
        document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));
setCurrency(selectedCurrency); // выставить текущую валюту


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
                const newStart = startBtn.cloneNode(true);
                startBtn.replaceWith(newStart);
                newStart.addEventListener('click', () => playSafeGame());
        }




        // Кнопка Назад
        document.querySelector('#game-safe .back-btn')?.addEventListener('click', backToMain);



                setupDigitClicks();
                updateSafeDigits();
                updateBalanceUI();


}


                   if (gameId === 'game-bombs') {
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
    updateBetUI();
}




      if (gameId === 'game-wheel') {
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
    updateBetUI();
}

   if (gameId === 'game-arrow') {
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
    updateBetUI();
}








if (gameId === 'game-21') {
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

   setCurrency(selectedCurrency);

    updateBalanceUI(); // чтобы сразу отображалось
    updateBetUI();
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

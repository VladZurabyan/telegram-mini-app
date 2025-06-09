(function () {
    let digits = [0, 0, 0];
    let isChecking = false;
    let sessionId = null;
    let hintUsed = false;
    

    const gameName = "Safe";

    function blockSafeUI() {
        document.querySelectorAll('#game-safe .bet-box button').forEach(btn => btn.disabled = true);
        document.getElementById('safeStart')?.setAttribute('disabled', 'true');
        document.querySelector('#game-safe .back-btn')?.setAttribute('disabled', 'true');
        document.querySelector('#game-safe .currency-selector')?.classList.add('disabled');
        document.querySelector('#game-safe .bet-box')?.classList.add('disabled');
    }

    function unblockSafeUI() {
        document.querySelectorAll('#game-safe .bet-box button').forEach(btn => btn.disabled = false);
        document.getElementById('safeStart')?.removeAttribute('disabled');
        document.querySelector('#game-safe .back-btn')?.removeAttribute('disabled');
        document.querySelector('#game-safe .currency-selector')?.classList.remove('disabled');
        document.querySelector('#game-safe .bet-box')?.classList.remove('disabled');
    }

    function updateSafeDigits() {
        document.querySelectorAll('#game-safe .digit').forEach((el, i) => el.textContent = digits[i]);
    }

    function resetSafeDigits() {
        digits = [0, 0, 0];
        updateSafeDigits();
    }

    function setupDigitClicks() {
        const container = document.querySelector('.safe-digits');
        if (!container) return;
        container.querySelectorAll('.digit').forEach((el, i) => {
            el.onclick = () => {
                digits[i] = (digits[i] + 1) % 10;
                updateSafeDigits();
            };
        });
    }

    function throwMoney(count = 15) {
        for (let i = 0; i < count; i++) {
            const money = document.createElement('img');
            money.src = 'assets/money.png';
            money.className = 'money';
            money.style.position = 'fixed';
            money.style.left = '50%';
            money.style.top = '50%';
            money.style.transform = 'translate(-50%, -50%)';
            money.style.zIndex = '9999';
            money.style.setProperty('--x', `${Math.random() * window.innerWidth - window.innerWidth / 2}px`);
            money.style.setProperty('--y', `${Math.random() * -window.innerHeight}px`);
            money.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
            money.style.setProperty('--s', `${Math.random() * 0.5 + 0.8}`);
            document.body.appendChild(money);
            setTimeout(() => money.remove(), 1600);
        }
    }

  async function showHint() {
    if (hintUsed) {
        showCustomAlert("Подсказка уже использована", "warning");
        return;
    }

    const hintBtn = document.getElementById('hint-btn');
    if (!hintBtn) return;

    hintBtn.setAttribute('disabled', 'true'); // 🔒 Блокируем кнопку при старте

    try {
        const res = await fetch(`${apiUrl}/safe/hint`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: sessionId,
                user_id: user.id
            })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || "Ошибка при получении подсказки");
        }

        const data = await res.json();

        if (typeof Player_action === 'function') {
            Player_action(gameName, "Подсказка", `Первая цифра: ${data.hint}`);
        }

        showCustomAlert(`Первая цифра: ${data.hint}`, 'info');

        hintUsed = true; // ✅ Отмечаем, что использована

    } catch (e) {
        console.error(e);
        showCustomAlert("❌ " + e.message, "error");
        hintBtn.removeAttribute('disabled'); // 🔓 Разблокируем, если ошибка
    }
}




    function changeSafeBet(delta) {
        const display = document.getElementById("safe-bet-display");
        if (!display) return;
        let bet = parseFloat(display.textContent);
        bet += delta;
        if (bet < minBet) bet = minBet;
        if (bet > maxBet) bet = maxBet;
        display.textContent = bet;
    }

    function setSafeBet(type) {
        const display = document.getElementById("safe-bet-display");
        if (!display) return;
        if (type === 'min') display.textContent = minBet.toString();
        if (type === 'max') display.textContent = maxBet.toString();
    }

    function resetSafeScreen() {
        const safeImg = document.getElementById('safeImage');
        safeImg.className = 'safe-image';
        safeImg.src = 'assets/safe.png';
        safeImg.style.opacity = '1';
        document.getElementById('safeDigitsContainer')?.classList.add('hidden');
        const checkBtn = document.getElementById('checkSafeBtn');
        checkBtn?.classList.add('hidden');
        checkBtn?.removeAttribute('disabled');
        resetSafeDigits();
    }

  let safeGameInProgress = false;

async function playSafeGame() {
    if (safeGameInProgress) return;
    safeGameInProgress = true;

    try {
        window.bet = parseFloat(document.getElementById("safe-bet-display")?.textContent || 1);

        if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
            showCustomAlert("Введите корректную ставку", "error");
            return;
        }

        const balanceAvailable = window.selectedCurrency === 'ton' ? window.fakeBalance.ton : window.fakeBalance.usdt;
        if (window.bet > balanceAvailable) {
            showCustomAlert(`Недостаточно средств (${window.selectedCurrency.toUpperCase()})`, "error");
            return;
        }

        if (window.bet < minBet) {
            showCustomAlert(`Минимум ${minBet} ${window.selectedCurrency.toUpperCase()}`, "error");
            return;
        }

        if (typeof Player_join === 'function') {
            Player_join(gameName, `TON: ${window.fakeBalance.ton} | USDT: ${window.fakeBalance.usdt}`);
        }

        blockSafeUI();

        const res = await fetch(`${apiUrl}/safe/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: user.id,
                currency: window.selectedCurrency,
                bet: window.bet
            })
        });

        const data = await res.json();
        sessionId = data.session_id;
        hintUsed = false;

        if (!data.session_id) {
            console.warn("Ответ сервера:", data);
            showCustomAlert("Ошибка при запуске игры", "error");
            unblockSafeUI();
            return;
        }

        if (typeof recordGame === 'function') {
            recordGame("safe", window.bet, "pending", false, window.selectedCurrency, 0, false);
        }

        window.safeSessionId = data.session_id;

        resetSafeDigits();
        document.getElementById('checkSafeBtn')?.setAttribute('disabled', 'true');

        const safeImg = document.getElementById('safeImage');
        safeImg.classList.add('safe-zoomed');
        setTimeout(() => safeImg.classList.add('safe-fade-out'), 1300);
        setTimeout(() => {
            safeImg.classList.add('hidden');
            document.getElementById('safeDigitsContainer')?.classList.remove('hidden');
            const checkBtn = document.getElementById('checkSafeBtn');
            checkBtn?.classList.remove('hidden');
            checkBtn?.removeAttribute('disabled');
            setupDigitClicks();
            const hintBtn = document.getElementById('hint-btn');
            hintBtn?.removeAttribute('disabled');
        }, 1900);

    } catch (e) {
        console.error(e);
        showCustomAlert("Ошибка соединения", "error");
        unblockSafeUI();
        hintUsed = false;
    } finally {
        safeGameInProgress = false; // ✅ ВСЕГДА сбрасываем
    }
}


    async function checkSafeGuess() {
    if (isChecking) return;
    isChecking = true;

    const safeImg = document.getElementById('safeImage');
    const digitsContainer = document.getElementById('safeDigitsContainer');
    const checkBtn = document.getElementById('checkSafeBtn');
    checkBtn?.setAttribute('disabled', 'true');

    try {
        const res = await fetch(`${apiUrl}/safe/guess`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: user.id,
                session_id: sessionId,
                guess: digits
            })
        });

        const data = await res.json();

        const result = data.result;
        const prize = data.prize;

        if (result === 'win') {
            safeImg.src = 'assets/safe-open.png';
            digitsContainer?.classList.add('hidden');

            setTimeout(() => {
                safeImg.classList.remove('hidden');
                safeImg.classList.add('safe-door-open');
                throwMoney(12);
            }, 400);

            setTimeout(() => {
                if (typeof recordGame === 'function') {
                    recordGame("safe", window.bet, "win", true, window.selectedCurrency, prize, true);
                }
                if (typeof Player_action === 'function') {
                    Player_action(gameName, "Результат", `Победа. Приз: ${formatAmount(prize)} ${window.selectedCurrency.toUpperCase()}`);
                }
                if (typeof Player_leave === 'function') {
                    Player_leave(gameName, `Победа | Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`);
                }
                showCustomAlert(`🎉 Вы выиграли ${formatAmount(prize)} ${window.selectedCurrency.toUpperCase()}!`, 'success');
            }, 2000);

            setTimeout(() => {
                resetSafeScreen();
                unblockSafeUI();
                
                isChecking = false;
            }, 4000);

        } else if (result === 'lose') {
    safeImg.src = 'assets/safe-closed.png';
    document.getElementById('game-safe')?.classList.add('safe-fail');
    digitsContainer?.classList.add('hidden');

    setTimeout(() => {
        safeImg.classList.remove('hidden');
        safeImg.classList.add('safe-door-closed');
    }, 400);

    setTimeout(() => {
        if (typeof recordGame === 'function') {
            recordGame("safe", window.bet, "lose", false, window.selectedCurrency, 0, true);
        }
        if (typeof Player_action === 'function') {
            Player_action(gameName, "Результат", "Проигрыш");
        }
        if (typeof Player_leave === 'function') {
            Player_leave(gameName, `Проигрыш | Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`);
        }
        showCustomAlert(`❌ Вы не угадали.`, 'error');
    }, 2000);

    setTimeout(() => {
        document.getElementById('game-safe')?.classList.remove('safe-fail');
        resetSafeScreen();
        unblockSafeUI();
        isChecking = false;
    }, 4000);
}
 else {
            const attemptsLeft = data.attempts_left !== undefined ? data.attempts_left : '?';
            showCustomAlert(`Неверно. Осталось попыток: ${attemptsLeft}`, 'error');

            setTimeout(() => {
                checkBtn?.removeAttribute('disabled');
                isChecking = false;
            }, 800);
        }

    } catch (e) {
        console.error(e);
        showCustomAlert("Ошибка проверки кода", "error");
        unblockSafeUI();
        isChecking = false;
    }
}


    window.updateSafeDigits = updateSafeDigits;
    window.showHint = showHint;
    window.playSafeGame = playSafeGame;
    window.checkSafeGuess = checkSafeGuess;
    window.resetSafeScreen = resetSafeScreen;
    window.setSafeBet = setSafeBet;
    window.changeSafeBet = changeSafeBet;
    window.setupDigitClicks = setupDigitClicks;
})();

(function () {
    let digits = [0, 0, 0];
    let isChecking = false;

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

    const SafeGame = (() => {
        let code = [];
        let attempts = 3;
        let inProgress = false;

        function generateCode() {
            code = [randDigit(), randDigit(), randDigit()];
            attempts = 3;
            inProgress = true;
        }

        function getAttempts() { return attempts; }
        function isInProgress() { return inProgress; }
        function getFirstDigit() { return code.length ? code[0] : null; }

        function checkGuess(guess) {
            if (!inProgress) return null;
            if (guess.join('') === code.join('')) {
                inProgress = false;
                return 'win';
            } else {
                attempts--;
                if (attempts <= 0) {
                    inProgress = false;
                    return 'lose';
                }
                return 'try';
            }
        }

        return { generateCode, getAttempts, isInProgress, getFirstDigit, checkGuess };
    })();

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

    function showHint() {
        const hintCost = 1;
        if (!SafeGame.isInProgress()) return alert("Сначала начните игру.");
        if (window.fakeBalance[window.selectedCurrency] < hintCost) return alert("Недостаточно средств для подсказки.");
        window.fakeBalance[window.selectedCurrency] -= hintCost;
        updateBalanceUI();

        if (typeof Player_action === 'function') {
            Player_action("Safe", "Подсказка", `Игрок использовал подсказку. Стоимость: ${hintCost} ${window.selectedCurrency.toUpperCase()}`);
        }

        alert(`Первая цифра: ${SafeGame.getFirstDigit()}`);
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

    function playSafeGame() {
        const gameName = "Safe";
        window.bet = parseFloat(document.getElementById("safe-bet-display")?.textContent || 1);

        if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
            if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Некорректная ставка: ${window.bet}`);
            alert("Введите корректную ставку.");
            unblockSafeUI();
            return;
        }

        const balanceAvailable = window.selectedCurrency === 'ton' ? window.fakeBalance.ton : window.fakeBalance.usdt;
        if (window.bet > balanceAvailable) {
            if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} > Баланс: ${balanceAvailable} ${window.selectedCurrency.toUpperCase()}`);
            showCustomAlert(`Недостаточно средств (${window.selectedCurrency.toUpperCase()})`, "error");
            unblockSafeUI();
            return;
        }

        if (window.bet < minBet) {
            if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Ставка ниже минимума: ${window.bet}`);
            alert(`Минимум ${minBet} ${window.selectedCurrency.toUpperCase()}`);
            unblockSafeUI();
            return;
        }

        if (typeof Player_join === 'function') {
            Player_join(gameName, `TON: ${window.fakeBalance.ton} | USDT: ${window.fakeBalance.usdt}`);
        }

        SafeGame.generateCode();
        resetSafeDigits();
        document.getElementById('checkSafeBtn')?.setAttribute('disabled', 'true');
        blockSafeUI();

        window.fakeBalance[window.selectedCurrency] = +(window.fakeBalance[window.selectedCurrency] - window.bet).toFixed(2);
        updateBalanceUI();

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
        }, 1900);
    }

    function checkSafeGuess() {
        const gameName = "Safe";
        if (!SafeGame.isInProgress() || isChecking) return;
        isChecking = true;

        const result = SafeGame.checkGuess(digits);
        const safeImg = document.getElementById('safeImage');
        const digitsContainer = document.getElementById('safeDigitsContainer');
        const checkBtn = document.getElementById('checkSafeBtn');
        checkBtn?.setAttribute('disabled', 'true');

        if (result === 'win') {
            const prize = +(window.bet * 10).toFixed(2);
            window.fakeBalance[window.selectedCurrency] = +(window.fakeBalance[window.selectedCurrency] + prize).toFixed(2);
            updateBalanceUI();

            safeImg.src = 'assets/safe-open.png';
            digitsContainer?.classList.add('hidden');
            setTimeout(() => {
                safeImg.classList.remove('hidden');
                safeImg.classList.add('safe-door-open');
                throwMoney(12);
            }, 400);

            setTimeout(() => {
                if (typeof recordGame === 'function') {
                    recordGame("safe", window.bet, "win", 10, window.selectedCurrency);
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
                if (typeof recordGame === 'function') {
                    recordGame("safe", window.bet, "lose", 0, window.selectedCurrency);
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

        } else {
            if (typeof Player_action === 'function') {
                Player_action(gameName, "Результат", `Неверно. Осталось попыток: ${SafeGame.getAttempts()}`);
            }
            showCustomAlert(`Неверно. Осталось попыток: ${SafeGame.getAttempts()}`, 'error');
            setTimeout(() => {
                checkBtn?.removeAttribute('disabled');
                isChecking = false;
            }, 800);
        }
    }

    function randDigit() {
        return Math.floor(Math.random() * 10);
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

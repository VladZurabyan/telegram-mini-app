let digits = [0, 0, 0];
 let isChecking = false;



function blockSafeUI() {
    // Отключить кнопки ставки
    document.querySelectorAll('#game-safe .bet-box button').forEach(btn => btn.disabled = true);

    // Отключить кнопку "Играть"
    document.getElementById('safeStart')?.setAttribute('disabled', 'true');

    // Отключить кнопку "Назад"
    document.querySelector('#game-safe .back-btn')?.setAttribute('disabled', 'true');

    // Заблокировать селектор валют и bet-box полностью
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
    let code = []; // 🔒 приватно
    let attempts = 3;
    let inProgress = false;

    function generateCode() {
        code = [randDigit(), randDigit(), randDigit()];
        attempts = 3;
        inProgress = true;
    }

    function getAttempts() {
        return attempts;
    }

    function isInProgress() {
        return inProgress;
    }

    function getFirstDigit() {
        return code.length ? code[0] : null;
    }




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
            } else {
                return 'try';
            }
        }
    }

    return {

        generateCode,
        getAttempts,
        isInProgress,
        getFirstDigit,
        checkGuess
    };
})();



function updateSafeDigits() {
    const digitEls = document.querySelectorAll('#game-safe .digit');
    digitEls.forEach((el, i) => {
        el.textContent = digits[i];
    });
}

function resetSafeDigits() {
    digits = [0, 0, 0];
    updateSafeDigits();
}

function setupDigitClicks() {
    const container = document.querySelector('.safe-digits');
    if (!container) return;

    const digitEls = container.querySelectorAll('.digit');
    digitEls.forEach((el, i) => {
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

        // Стартовая позиция: от центра экрана
        money.style.position = 'fixed';
        money.style.left = '50%';
        money.style.top = '50%';
        money.style.transform = 'translate(-50%, -50%)';
        money.style.zIndex = '9999';

        // Случайная траектория, поворот, масштаб
        money.style.setProperty('--x', `${Math.random() * window.innerWidth - window.innerWidth / 2}px`);
        money.style.setProperty('--y', `${Math.random() * -window.innerHeight}px`);
        money.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
        money.style.setProperty('--s', `${Math.random() * 0.5 + 0.8}`);

        document.body.appendChild(money);

        // Удалить после анимации
        setTimeout(() => money.remove(), 1600);
    }
}
















function showHint() {
    const hintCost = 1;

    if (!SafeGame.isInProgress()) {
        alert("Сначала начните игру.");
        return;
    }

    if (fakeBalance[selectedCurrency] < hintCost) {
        alert("Недостаточно средств для подсказки.");
        return;
    }

    fakeBalance[selectedCurrency] -= hintCost;
    updateBalanceUI();
    alert(`Первая цифра: ${SafeGame.getFirstDigit()}`);
}




function changeSafeBet(delta) {
    const display = document.getElementById("safe-bet-display");
    let bet = parseFloat(display.textContent);
    bet += delta;
    if (bet < 1) bet = 1;
    display.textContent = bet;
}

function setSafeBet(type) {
    const display = document.getElementById("safe-bet-display");
    if (type === 'min') display.textContent = '1';
    if (type === 'max') display.textContent = '100';
}

function resetSafeScreen() {
    const safeImg = document.getElementById('safeImage');
    safeImg.className = 'safe-image';
    safeImg.src = 'assets/safe.png';
    safeImg.style.opacity = '1';

    document.getElementById('safeDigitsContainer')?.classList.add('hidden');

    const checkBtn = document.getElementById('checkSafeBtn');
    checkBtn?.classList.add('hidden');
    checkBtn?.removeAttribute('disabled'); // ✅ вернуть в исходное

    resetSafeDigits();
}




function playSafeGame() {


    window.bet = parseFloat(document.getElementById("safe-bet-display")?.textContent || 1);

    if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
        alert("Введите корректную ставку.");
        unblockSafeUI();
        return;
    }

    const balanceAvailable = selectedCurrency === 'ton'
        ? parseFloat(fakeBalance.ton.toFixed(2))
        : parseFloat(fakeBalance.usdt.toFixed(2));

    if (window.bet > balanceAvailable) {
        alert(`Недостаточно средств (${selectedCurrency.toUpperCase()})`);
        unblockSafeUI();
        return;
    }

    if (window.bet < minBet) {
        alert(`Минимум ${minBet} ${selectedCurrency.toUpperCase()}`);
        unblockSafeUI();
        return;
    }

    SafeGame.generateCode(); // 👈 генерируем код приватно
    resetSafeDigits();

    document.getElementById('checkSafeBtn')?.setAttribute('disabled', 'true');
    blockSafeUI();

    fakeBalance[selectedCurrency] = parseFloat((fakeBalance[selectedCurrency] - window.bet).toFixed(2));
    updateBalanceUI();

    const safeImg = document.getElementById('safeImage');
    safeImg.classList.add('safe-zoomed');

    setTimeout(() => {
        safeImg.classList.add('safe-fade-out');
    }, 1300);

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
    if (!SafeGame.isInProgress() || isChecking) return; // ❗ блок повторного клика
    isChecking = true; // 🔐 временная блокировка

    const result = SafeGame.checkGuess(digits);


    const safeImg = document.getElementById('safeImage');
    const digitsContainer = document.getElementById('safeDigitsContainer');
    const checkBtn = document.getElementById('checkSafeBtn');
    checkBtn?.setAttribute('disabled', 'true');

    if (result === 'win') {
        const prize = window.bet * 10;
        fakeBalance[selectedCurrency] = parseFloat((fakeBalance[selectedCurrency] + prize).toFixed(2));
        updateBalanceUI();

        safeImg.src = 'assets/safe-open.png';
        digitsContainer?.classList.add('hidden');

        setTimeout(() => {
            safeImg.classList.remove('hidden');
            safeImg.classList.add('safe-door-open');
            throwMoney(12);
        }, 400);

        setTimeout(() => {
            safeImg.classList.remove('safe-door-open');
            safeImg.src = 'assets/safe.png';
        }, 3000);

        setTimeout(() => {
            showCustomAlert(`🎉 Вы выиграли ${prize.toFixed(2)} ${selectedCurrency.toUpperCase()}!`, 'success');
        }, 5900);

        setTimeout(() => {
              resetSafeScreen();
            }, 4000);

        setTimeout(() => {

            isChecking = false; // ✅ снимаем блокировку
            unblockSafeUI();
        }, 7000);

    } else if (result === 'lose') {
        safeImg.src = 'assets/safe-closed.png';
        document.getElementById('game-safe')?.classList.add('safe-fail');
        digitsContainer?.classList.add('hidden');

        setTimeout(() => {
            safeImg.classList.remove('hidden');
            safeImg.classList.add('safe-door-closed');
        }, 400);

        setTimeout(() => {
            showCustomAlert(`❌ Вы не угадали.`, 'error');
        }, 2000);

        setTimeout(() => {
            safeImg.classList.remove('safe-door-closed');
            document.getElementById('game-safe')?.classList.remove('safe-fail');
            resetSafeScreen();
            unblockSafeUI();
            isChecking = false; // ✅ снимаем блокировку
        }, 4000);
    } else {
        showCustomAlert(`Неверно. Осталось попыток: ${SafeGame.getAttempts()}`, 'error');

        // 🕓 Даем нажать снова через 800 мс
        setTimeout(() => {
            checkBtn?.removeAttribute('disabled');
            isChecking = false; // ✅ снимаем блокировку
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
window.setBet = setBet;
window.changeBet = changeBet;

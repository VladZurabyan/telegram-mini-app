let safeCode = [];
let digits = [0, 0, 0];
let safeAttempts = 3;
let safeInProgress = false;

function blockSafeUI() {
    document.querySelectorAll('#game-safe .bet-box button').forEach(btn => btn.disabled = true);
    document.getElementById('safeStart')?.setAttribute('disabled', 'true');
}

function unblockSafeUI() {
    document.querySelectorAll('#game-safe .bet-box button').forEach(btn => btn.disabled = false);
    document.getElementById('safeStart')?.removeAttribute('disabled');
}

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

function setupDigitSwipes() {
    const digitEls = document.querySelectorAll('#game-safe .digit');

    digitEls.forEach((el, i) => {
        let startY = 0;

        el.addEventListener('touchstart', e => {
            startY = e.touches[0].clientY;
        });

        el.addEventListener('touchend', e => {
            const deltaY = e.changedTouches[0].clientY - startY;

            if (deltaY < -20) {
                // Свайп вверх — увеличить строго на 1
                digits[i] = (digits[i] + 1) % 10;
                updateSafeDigits();
            }
        });
    });
}



function showHint() {
    const hintCost = 0.5;
    if (fakeBalance[selectedCurrency] < hintCost) {
        alert("Недостаточно средств для подсказки.");
        return;
    }
    fakeBalance[selectedCurrency] -= hintCost;
    updateBalanceUI();
    alert(`Первая цифра: ${safeCode[0]}`);
}

function changeBet(delta) {
    const display = document.getElementById("safe-bet-display");
    let bet = parseFloat(display.textContent);
    bet += delta;
    if (bet < 1) bet = 1;
    display.textContent = bet;
}

function setBet(type) {
    const display = document.getElementById("safe-bet-display");
    if (type === 'min') display.textContent = '1';
    if (type === 'max') display.textContent = '100';
}

function resetSafeScreen() {
    const safeImg = document.getElementById('safeImage');
    safeImg.className = "safe-image";
    safeImg.src = "assets/safe.png";
    safeImg.classList.remove('hidden');
    document.getElementById('safeDigitsContainer')?.classList.add('hidden');
    document.getElementById('checkSafeBtn')?.classList.add('hidden');
    resetSafeDigits();
}

function playSafeGame() {
    const bet = parseFloat(document.getElementById("safe-bet-display")?.textContent || 1);
    safeCode = [randDigit(), randDigit(), randDigit()];
    safeAttempts = 3;
    safeInProgress = true;
    blockSafeUI();

    const safeImg = document.getElementById('safeImage');
    safeImg.classList.add('safe-zoom');

    setTimeout(() => {
        safeImg.classList.add('hidden');
        document.getElementById('safeDigitsContainer')?.classList.remove('hidden');
        document.getElementById('checkSafeBtn')?.classList.remove('hidden');
        setupDigitSwipes();
        unblockSafeUI();
    }, 1500);
}

function checkSafeGuess() {
    if (!safeInProgress) return;

    const safeImg = document.getElementById('safeImage');
    const digitsContainer = document.getElementById('safeDigitsContainer');

    if (digits.join('') === safeCode.join('')) {
        // Победа
        safeImg.src = 'assets/safe-open.png';
        digitsContainer?.classList.add('hidden');

        setTimeout(() => {
            safeImg.classList.remove('hidden');
            safeImg.classList.add('safe-door-open');
        }, 400);

        safeInProgress = false;

        // После анимации открытия, вернуть в закрытое состояние
        setTimeout(() => {
            safeImg.classList.remove('safe-door-open');
            safeImg.src = 'assets/safe.png'; // картинка снова закрытого сейфа
        }, 3000);

        // Полный сброс через 4.5 сек
        setTimeout(resetSafeScreen, 4500);

    } else {
        // Ошибка
        safeAttempts--;

        if (safeAttempts <= 0) {
            safeImg.src = 'assets/safe-closed.png';
            setTimeout(() => {
                safeImg.classList.remove('hidden');
                safeImg.classList.add('safe-door-closed');
            }, 400);
            digitsContainer?.classList.add('hidden');
            safeInProgress = false;
            setTimeout(resetSafeScreen, 3000);
        } else {
            alert(`Неверно. Осталось попыток: ${safeAttempts}`);
        }
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

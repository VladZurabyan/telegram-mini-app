let safeCode = [];
let digits = [0, 0, 0];
let safeAttempts = 3;
let safeInProgress = false;

// UI
function blockSafeUI() {
    document.querySelectorAll('#game-safe .currency-selector button').forEach(btn => btn.disabled = true);
    document.querySelectorAll('#game-safe .bet-box button').forEach(btn => btn.disabled = true);
    document.querySelector('#safeStart')?.setAttribute('disabled', 'true');
    document.querySelector('#game-safe .back-btn')?.setAttribute('disabled', 'true');
}

function unblockSafeUI() {
    document.querySelectorAll('#game-safe .currency-selector button').forEach(btn => btn.disabled = false);
    document.querySelectorAll('#game-safe .bet-box button').forEach(btn => btn.disabled = false);
    document.querySelector('#safeStart')?.removeAttribute('disabled');
    document.querySelector('#game-safe .back-btn')?.removeAttribute('disabled');
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
        el.addEventListener('touchstart', e => el.startY = e.touches[0].clientY);
        el.addEventListener('touchend', e => {
            const deltaY = e.changedTouches[0].clientY - el.startY;
            if (deltaY < -10) {
                digits[i] = (digits[i] + 1) % 10;
            } else if (deltaY > 10) {
                digits[i] = (digits[i] + 9) % 10;
            }
            updateSafeDigits();
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
    if (type === 'max') display.textContent = Math.floor(fakeBalance[selectedCurrency]);
}

function resetSafeScreen() {
    const screen = document.getElementById('game-safe');
    if (screen) screen.style.display = 'none';

    digits = [0, 0, 0];
    safeCode = [];
    safeAttempts = 3;
    safeInProgress = false;

    if (typeof updateSafeDigits === 'function') {
        updateSafeDigits();
    }

    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) hintBtn.textContent = '🔍 Подсказка (-0.5)';

    const image = document.getElementById('safeImage');
    if (image) image.className = 'safe-image';

    document.getElementById('safeImageContainer')?.classList.remove('zoomed-in');
    document.getElementById('safeImageContainer')?.classList.remove('hidden');
    document.getElementById('safeDigitsContainer')?.classList.add('hidden');
}

function playSafeGame() {
    const bet = parseFloat(document.getElementById("safe-bet-display")?.textContent || 1);
    const balanceAvailable = fakeBalance[selectedCurrency];
    if (safeInProgress || bet > balanceAvailable || bet <= 0) return;

    fakeBalance[selectedCurrency] -= bet;
    updateBalanceUI();
    blockSafeUI();

    safeCode = [randDigit(), randDigit(), randDigit()];
    safeAttempts = 3;
    resetSafeDigits();

    const img = document.getElementById('safeImage');
    const digitsBox = document.getElementById('safeDigitsContainer');
    if (img && digitsBox) {
        img.classList.add('zoomed-in');
        setTimeout(() => {
            document.getElementById('safeImageContainer').style.display = 'none';
            digitsBox.classList.remove('hidden');
        }, 600);
    }

    document.querySelectorAll('#game-safe .digit').forEach(d => d.classList.add('active'));
    safeInProgress = true;

    setTimeout(() => {
        document.querySelectorAll('#game-safe .digit').forEach(d => d.classList.remove('active'));
    }, 600);
}

function checkSafeGuess() {
    if (!safeInProgress) return;

    const img = document.getElementById('safeImage');
    const imgContainer = document.getElementById('safeImageContainer');
    const digitsBox = document.getElementById('safeDigitsContainer');

    if (digits.join('') === safeCode.join('')) {
    const img = document.getElementById('safeImage');
    if (img) {
        img.className = 'safe-image safe-door-open';
    }
    safeInProgress = false;
    unblockSafeUI();


    } else {
        safeAttempts--;
        if (safeAttempts <= 0) {
            digitsBox.classList.add('hidden');
            imgContainer.style.display = 'block';
            img.className = 'safe-image safe-door-closed';
            safeInProgress = false;
            unblockSafeUI();
        } else {
            alert(`Неверно. Осталось попыток: ${safeAttempts}`);
        }
    }
}

function randDigit() {
    return Math.floor(Math.random() * 10);
}

window.setupDigitSwipes = setupDigitSwipes;
window.updateSafeDigits = updateSafeDigits;
window.showHint = showHint;
window.playSafeGame = playSafeGame;
window.resetSafeScreen = resetSafeScreen;
window.setBet = setBet;
window.changeBet = changeBet;
window.checkSafeGuess = checkSafeGuess;
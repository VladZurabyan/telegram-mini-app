let safeCode = [];
let digits = [0, 0, 0];
let safeAttempts = 3;
let safeInProgress = false;

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
    safeImg.className = 'safe-image';
    safeImg.src = 'assets/safe.png';
    safeImg.style.opacity = '1';
    document.getElementById('safeDigitsContainer')?.classList.add('hidden');
    document.getElementById('checkSafeBtn')?.classList.add('hidden');
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

    // Списание ставки
    fakeBalance[selectedCurrency] = parseFloat((fakeBalance[selectedCurrency] - window.bet).toFixed(2));
    updateBalanceUI();

    safeCode = [randDigit(), randDigit(), randDigit()];
    safeAttempts = 3;
    safeInProgress = true;
    blockSafeUI();

    const safeImg = document.getElementById('safeImage');

    // Анимация
    safeImg.classList.add('safe-zoomed');

    setTimeout(() => {
        safeImg.classList.add('safe-fade-out');
    }, 1300);

    setTimeout(() => {
        safeImg.classList.add('hidden');
        document.getElementById('safeDigitsContainer')?.classList.remove('hidden');
        document.getElementById('checkSafeBtn')?.classList.remove('hidden');
        setupDigitClicks();
    }, 1900);
}




function checkSafeGuess() {
    if (!safeInProgress) return;

    const safeImg = document.getElementById('safeImage');
    const digitsContainer = document.getElementById('safeDigitsContainer');

    if (digits.join('') === safeCode.join('')) {
        // Победа
    const prize = window.bet * 10;
    fakeBalance[selectedCurrency] = parseFloat((fakeBalance[selectedCurrency] + prize).toFixed(2));
    updateBalanceUI();



        safeImg.src = 'assets/safe-open.png';
        digitsContainer?.classList.add('hidden');

        setTimeout(() => {
            safeImg.classList.remove('hidden');
            safeImg.classList.add('safe-door-open');
            throwMoney(12); // или 8–16, сколько хочешь
        }, 400);

        safeInProgress = false;




        // После анимации открытия, вернуть в закрытое состояние
        setTimeout(() => {
            safeImg.classList.remove('safe-door-open');
            safeImg.src = 'assets/safe.png'; // картинка снова закрытого сейфа
        }, 3000);


     // ⏳ Добавим паузу 500мс после закрытия
    setTimeout(() => {
        showCustomAlert(`🎉 Вы выиграли ${prize.toFixed(2)} ${selectedCurrency.toUpperCase()}!`, 'success');
    }, 5900);

    // 🧼 Сбросим интерфейс позже
    setTimeout(() => {
        resetSafeScreen();
        unblockSafeUI();
    }, 4800);

    } else {
        // Ошибка
        safeAttempts--;

if (safeAttempts <= 0) {
    // Проигрыш — анимация закрытия сейфа
    safeImg.src = 'assets/safe-closed.png';




    // 🔴 Эффект красного фона
    document.getElementById('game-safe')?.classList.add('safe-fail');



    setTimeout(() => {
        safeImg.classList.remove('hidden');
        safeImg.classList.add('safe-door-closed');
    }, 400);

    digitsContainer?.classList.add('hidden');
    safeInProgress = false;

    // ❌ Убираем этот лишний сброс src
    // setTimeout(() => {
    //     safeImg.classList.remove('safe-door-closed');
    //     safeImg.src = 'assets/safe.png';
    // }, 3000);

    // ✅ Показываем алерт после анимации
    setTimeout(() => {

        showCustomAlert(`❌ Вы не угадали. Код был: ${safeCode.join('')}`, 'error');
    }, 2000); // Пауза чуть меньше







    // ✅ Финальный сброс
    setTimeout(() => {
        safeImg.classList.remove('safe-door-closed');
        document.getElementById('game-safe')?.classList.remove('safe-fail');

        resetSafeScreen();
        unblockSafeUI();
    }, 4000);
} else {
    showCustomAlert(`Неверно. Осталось попыток: ${safeAttempts}`, 'error');
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

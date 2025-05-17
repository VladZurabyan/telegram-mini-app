let diceChoice = null;

function setDiceChoice(num) {
    diceChoice = num;
    const buttons = document.querySelectorAll('#game-dice .dice-choices button');
    buttons.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.innerText) === num);
    });
}

function playDice(btn) {
    if (!diceChoice) return alert("Выберите число от 1 до 6");
    if (bet < minBet) return alert(`Минимум ${minBet} TON`);
    const balanceAvailable = selectedCurrency === 'ton' ? fakeBalance.ton : fakeBalance.usdt;
    if (bet > balanceAvailable) {
        alert(`Недостаточно средств (${selectedCurrency.toUpperCase()})`);
        return;
    }

    btn.disabled = true;

    // Отключаем кнопку Назад и выбор чисел
    const backBtn = document.querySelector('#game-dice .back-btn');
    if (backBtn) backBtn.disabled = true;

    const diceChoices = document.getElementById('diceChoices');
    if (diceChoices) diceChoices.classList.add('disabled');

    const currencySelector = document.querySelector('#game-dice .currency-selector');
    const betBox = document.getElementById('diceBetBox');
    currencySelector.classList.add('disabled');
    betBox.classList.add('disabled');

    const img = document.getElementById('diceImage');
    const resultText = document.getElementById('diceResult');
    const prizeBox = document.getElementById('dicePrize');

    resultText.innerText = '';
    prizeBox.innerText = '';

    // Анимация броска кубика
    img.classList.remove('dice-roll-3d'); // сброс, если повторно
void img.offsetWidth; // форс перерисовки
img.classList.add('dice-roll-3d');




    const diceResult = Math.floor(Math.random() * 6) + 1;
    const win = diceResult === diceChoice;

    setTimeout(() => {
        img.classList.remove('dice-shake');
       img.classList.remove('dice-roll-3d');
        img.src = `assets/dice${diceResult}.png`;

        resultText.innerText = `Выпало: ${diceResult}`;
        prizeBox.innerText = win
            ? `🎉 Победа! Вы выиграли ${bet * 5} ${selectedCurrency.toUpperCase()}`
            : `😞 Не угадали. Вы потеряли ${bet} ${selectedCurrency.toUpperCase()}`;

        if (selectedCurrency === 'ton') {
            fakeBalance.ton += win ? bet * 5 : -bet;
        } else {
            fakeBalance.usdt += win ? bet * 5 : -bet;
        }

        updateBalanceUI();
        recordGame('dice', bet, diceResult, win);

        btn.disabled = false;
        if (backBtn) backBtn.disabled = false;
        if (diceChoices) diceChoices.classList.remove('disabled');

        currencySelector.classList.remove('disabled');
        betBox.classList.remove('disabled');
    }, 1000);
}

// Экспорт
window.setDiceChoice = setDiceChoice;
window.playDice = playDice;
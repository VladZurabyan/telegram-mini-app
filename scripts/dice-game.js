let diceChoice = null;
let diceInProgress = false;




function setDiceChoice(num) {
    diceChoice = num;
    const buttons = document.querySelectorAll('#game-dice .dice-choices button');
    buttons.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.innerText) === num);
    });
}




function resetDiceScreen() {
    // Сброс выбора числа
    diceChoice = null;
    const buttons = document.querySelectorAll('#game-dice .dice-choices button');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Сброс текста
    const resultText = document.getElementById('diceResult');
    const prizeBox = document.getElementById('dicePrize');
    if (resultText) resultText.innerText = '';
    if (prizeBox) prizeBox.innerText = '';

    // Сброс изображения кубика + Анимация
    const img = document.getElementById('diceImage');
    if (img) {
        img.src = `assets/dice${Math.floor(Math.random() * 6) + 1}.png`; // случайное число
        img.classList.remove('dice-safe-throw'); // сброс анимации
        void img.offsetWidth; // форс перерисовку
        img.classList.add('dice-safe-throw'); // запуск анимации
    }

    // Сброс ставки
    bet = minBet;
    const betDisplay = document.querySelector('#game-dice .current-bet');
    if (betDisplay) betDisplay.innerText = bet;

    // Включить интерфейс (на всякий случай)
    document.querySelector('#game-dice .currency-selector')?.classList.remove('disabled');
    document.getElementById('diceBetBox')?.classList.remove('disabled');
    const backBtn = document.querySelector('#game-dice .back-btn');
    if (backBtn) backBtn.disabled = false;
}













function playDice(btn) {
    if (diceInProgress) return;
    diceInProgress = true;

    if (!diceChoice) {
        alert("Выберите число от 1 до 6");
        diceInProgress = false;
        return;
    }

    if (bet < minBet) {
        alert(`Минимум ${minBet} TON`);
        diceInProgress = false;
        return;
    }

    const balanceAvailable = selectedCurrency === 'ton' ? fakeBalance.ton : fakeBalance.usdt;
    if (bet > balanceAvailable) {
        alert(`Недостаточно средств (${selectedCurrency.toUpperCase()})`);
        diceInProgress = false;
        return;
    }

    // 💳 Списываем ставку сразу
    if (selectedCurrency === 'ton') {
        fakeBalance.ton -= bet;
    } else {
        fakeBalance.usdt -= bet;
    }
    updateBalanceUI(); // Сразу показываем изменение

    btn.disabled = true;

    // Отключаем интерфейс
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

    // Анимация
    img.classList.remove('dice-safe-throw');
    void img.offsetWidth;
    img.classList.add('dice-safe-throw');

    const diceResult = Math.floor(Math.random() * 6) + 1;
    const win = diceResult === diceChoice;
    const multiplier = 5;






    // ⏳ Меняем картинку кубика на середине анимации
setTimeout(() => {
    img.src = `assets/dice${diceResult}.png`;
}, 500); // ← Плавная замена, пока кубик "крутится"

setTimeout(() => {
    img.classList.remove('dice-safe-throw');

    resultText.innerText = `Выпало: ${diceResult}`;
    prizeBox.innerText = win
        ? `🎉 Победа! Вы выиграли ${formatAmount(bet * multiplier)} ${selectedCurrency.toUpperCase()}`
        : `😞 Не угадали. Попробуйте еще раз.`;

    if (win) {
        if (selectedCurrency === 'ton') {
            fakeBalance.ton += bet * multiplier;
        } else {
            fakeBalance.usdt += bet * multiplier;
        }
        updateBalanceUI();
    }

    recordGame('dice', bet, diceResult, win);
    btn.disabled = false;
    if (backBtn) backBtn.disabled = false;
    if (diceChoices) diceChoices.classList.remove('disabled');

    currencySelector.classList.remove('disabled');
    betBox.classList.remove('disabled');
    diceInProgress = false;
}, 1000); // ← Завершение анимации

}


// Экспорт

window.setDiceChoice = setDiceChoice;
window.playDice = playDice;
window.resetDiceScreen = resetDiceScreen;

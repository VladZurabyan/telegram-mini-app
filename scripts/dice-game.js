(function () {
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
        diceChoice = null;
        const buttons = document.querySelectorAll('#game-dice .dice-choices button');
        buttons.forEach(btn => btn.classList.remove('active'));

        const resultText = document.getElementById('diceResult');
        const prizeBox = document.getElementById('dicePrize');
        if (resultText) resultText.innerText = '';
        if (prizeBox) prizeBox.innerText = '';

        const img = document.getElementById('diceImage');
        if (img) {
            img.src = `assets/dice${Math.floor(Math.random() * 6) + 1}.png`;
            img.classList.remove('dice-safe-throw');
            void img.offsetWidth;
            img.classList.add('dice-safe-throw');
        }

        window.bet = window.minBet;
        const betDisplay = document.querySelector('#game-dice .current-bet');
        if (betDisplay) betDisplay.innerText = window.bet;

        document.querySelector('#game-dice .currency-selector')?.classList.remove('disabled');
        document.getElementById('diceBetBox')?.classList.remove('disabled');
        document.querySelector('#game-dice .back-btn')?.removeAttribute('disabled');
    }

    function playDice(btn) {
        if (diceInProgress) return;
        diceInProgress = true;

        const gameName = "Dice";

        if (!diceChoice) {
    if (typeof Player_action === 'function') {
        Player_action("Dice", "Ошибка", "Игрок не выбрал число от 1 до 6");
    }
    showCustomAlert("Выберите число от 1 до 6", "error");
    diceInProgress = false;
    return;
}


        if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
            if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Некорректная ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()}`);
            alert("Введите корректную ставку.");
            diceInProgress = false;
            return;
        }

        if (window.bet < window.minBet) {
            if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} < Минимум: ${window.minBet} ${window.selectedCurrency.toUpperCase()}`);
            showCustomAlert(`Минимум ${window.minBet} ${window.selectedCurrency.toUpperCase()}`, "error");
            diceInProgress = false;
            return;
        }

        const balanceAvailable = window.selectedCurrency === 'ton'
            ? window.fakeBalance.ton
            : window.fakeBalance.usdt;

        if (window.bet > balanceAvailable) {
            if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} > Баланс: ${balanceAvailable} ${window.selectedCurrency.toUpperCase()}`);
            showCustomAlert(`Недостаточно средств (${window.selectedCurrency.toUpperCase()})`, "error");
            diceInProgress = false;
            return;
        }

        if (typeof Player_join === 'function') {
            Player_join(gameName, `TON: ${window.fakeBalance.ton} | USDT: ${window.fakeBalance.usdt}`);
        }

         if (typeof Player_action === 'function') {
    Player_action(gameName, "Ставка", `Выбрано число: ${diceChoice}, ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()}`);
}


        window.fakeBalance[window.selectedCurrency] = +(window.fakeBalance[window.selectedCurrency] - window.bet).toFixed(2);
        updateBalanceUI();

        btn.disabled = true;
        document.querySelector('#game-dice .back-btn')?.setAttribute('disabled', 'true');
        document.getElementById('diceChoices')?.classList.add('disabled');
        document.querySelector('#game-dice .currency-selector')?.classList.add('disabled');
        document.getElementById('diceBetBox')?.classList.add('disabled');

        const img = document.getElementById('diceImage');
        const resultText = document.getElementById('diceResult');
        const prizeBox = document.getElementById('dicePrize');
        resultText.innerText = '';
        prizeBox.innerText = '';

        img.classList.remove('dice-safe-throw');
        void img.offsetWidth;
        img.classList.add('dice-safe-throw');

        const diceResult = Math.floor(Math.random() * 6) + 1;
        const win = diceResult === diceChoice;
        const multiplier = 5;

        setTimeout(() => {
            img.src = `assets/dice${diceResult}.png`;
        }, 500);

        setTimeout(() => {
            img.classList.remove('dice-safe-throw');
            resultText.innerText = `Выпало: ${diceResult}`;

            let winAmount = 0;
            if (win) {
                winAmount = +(window.bet * multiplier).toFixed(2);
                window.fakeBalance[window.selectedCurrency] = +(window.fakeBalance[window.selectedCurrency] + winAmount).toFixed(2);
                prizeBox.innerText = `🎉 Победа! Вы выиграли ${formatAmount(winAmount)} ${window.selectedCurrency.toUpperCase()}`;
                updateBalanceUI();
            } else {
                prizeBox.innerText = `😞 Не угадали. Попробуйте еще раз.`;
            }

            if (typeof recordGame === 'function') {
                recordGame("dice", window.bet, diceResult, win ? winAmount : 0, window.selectedCurrency);
            }

            if (typeof Player_action === 'function') {
                Player_action(gameName, "Результат", win
                    ? `Победа, выигрыш: ${formatAmount(winAmount)} ${window.selectedCurrency.toUpperCase()}`
                    : `Проигрыш. Выпало ${diceResult}`);
            }

            if (typeof Player_leave === 'function') {
                const resultString = win
                    ? `Победа, выиграл ${formatAmount(winAmount)} ${window.selectedCurrency.toUpperCase()}`
                    : "Проигрыш";
                Player_leave(gameName, `${resultString} | Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`);
            }

            btn.disabled = false;
            document.querySelector('#game-dice .back-btn')?.removeAttribute('disabled');
            document.getElementById('diceChoices')?.classList.remove('disabled');
            document.querySelector('#game-dice .currency-selector')?.classList.remove('disabled');
            document.getElementById('diceBetBox')?.classList.remove('disabled');

            diceInProgress = false;
        }, 1000);
    }

    window.setDiceChoice = setDiceChoice;
    window.playDice = playDice;
    window.resetDiceScreen = resetDiceScreen;
})();

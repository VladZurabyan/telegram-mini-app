(function () {
    let coinInProgress = false;
    let playerChoice = '';

    function setCoinChoice(choice) {
        playerChoice = choice;
        document.getElementById('btn-heads')?.classList.toggle('active', choice === 'heads');
        document.getElementById('btn-tails')?.classList.toggle('active', choice === 'tails');
    }

    function resetCoinScreen() {
        const img = document.getElementById('coinImageMain');
        const resultBox = document.getElementById('coinResult');
        const prizeBox = document.getElementById('coinPrize');

        if (!img || !resultBox || !prizeBox) return;

        img.classList.remove('flip-head', 'flip-tail');
        img.src = 'assets/coin-heads.png';
        img.style.opacity = '1';

        resultBox.innerText = '';
        prizeBox.innerText = '';

        playerChoice = '';
        document.getElementById('btn-heads')?.classList.remove('active');
        document.getElementById('btn-tails')?.classList.remove('active');
    }

    function playCoin(btn) {
        const gameName = "Coin";
        const resultBox = document.getElementById('coinResult');
    const prizeBox = document.getElementById('coinPrize');

    if (resultBox) resultBox.innerText = '';
    if (prizeBox) prizeBox.innerText = '';
        if (coinInProgress) return;
        coinInProgress = true;
        

        if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
            if (typeof Player_action === 'function') {
                Player_action(gameName, "Ошибка", `Некорректная ставка: ${window.bet}`);
            }
            alert("Введите корректную ставку.");
            coinInProgress = false;
            return;
        }

        const balanceAvailable = window.selectedCurrency === 'ton'
            ? parseFloat(window.fakeBalance.ton.toFixed(2))
            : parseFloat(window.fakeBalance.usdt.toFixed(2));

        if (window.bet > balanceAvailable) {
            if (typeof Player_action === 'function') {
                Player_action(
                    gameName,
                    "Ошибка",
                    `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} > Баланс: ${balanceAvailable} ${window.selectedCurrency.toUpperCase()}`
                );
            }
            showCustomAlert(`Недостаточно средств (${window.selectedCurrency.toUpperCase()})`, "error" );
            coinInProgress = false;
            return;
        }

        if (window.bet < window.minBet) {
            if (typeof Player_action === 'function') {
                Player_action(
                    gameName,
                    "Ошибка",
                    `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} < Минимум: ${window.minBet} ${window.selectedCurrency.toUpperCase()}`
                );
            }
            showCustomAlert(`Минимум ${window.minBet} ${window.selectedCurrency.toUpperCase()}`, "error");
            coinInProgress = false;
            return;
        }

        if (!playerChoice) {
            if (typeof Player_action === 'function') {
                Player_action(gameName, "Ошибка", "Сторона не выбрана");
            }
            showCustomAlert("Выберите сторону", "error");
            coinInProgress = false;
            return;
        }

        if (typeof Player_join === 'function') {
            Player_join(gameName, `TON: ${window.fakeBalance.ton} | USDT: ${window.fakeBalance.usdt}`);
        }

              

        // ✅ Отправляем на сервер, чтобы зафиксировать списание
if (typeof recordGame === 'function') {
    recordGame(
        "coin",
        window.bet,
        "pending",
        false,
        window.selectedCurrency,
        0,
        false
    );
}


        const allBtns = [
            btn,
            document.getElementById('btn-back-coin'),
            document.getElementById('btn-heads'),
            document.getElementById('btn-tails'),
            document.getElementById('btn-currency-ton'),
            document.getElementById('btn-currency-usdt'),
            ...document.querySelectorAll('#game-coin .bet-box button')
        ];
        allBtns.forEach(el => el.disabled = true);
        document.querySelector('#game-coin .currency-selector')?.classList.add('disabled');
        document.querySelector('#game-coin .bet-box')?.classList.add('disabled');

        const isWin = Math.random() * totalCount < winsCount;
        const result = isWin ? playerChoice : (playerChoice === 'heads' ? 'tails' : 'heads');
        const img = document.getElementById('coinImageMain');
        const animClass = result === 'heads' ? 'flip-head' : 'flip-tail';

        img.classList.remove('flip-head', 'flip-tail');
        void img.offsetWidth;
        img.classList.add(animClass);

        setTimeout(() => {
            img.src = `assets/coin-${result}.png`;
        }, 600);

        img.addEventListener('animationend', function onFlipEnd() {
    img.removeEventListener('animationend', onFlipEnd);

    const resultBox = document.getElementById('coinResult');
    const prizeBox = document.getElementById('coinPrize');
    const currencyLabel = window.selectedCurrency.toUpperCase();

    // ⏱ СРАЗУ показываем результат
    resultBox.innerText = `Выпало: ${result === 'heads' ? 'ОРЁЛ' : 'РЕШКА'}\n${isWin ? 'Победа!' : 'Проигрыш'}`;
    let winAmount = 0;
    if (isWin) {
        winAmount = parseFloat((window.bet * 2).toFixed(2));
        prizeBox.innerText = `Вы выиграли: ${formatAmount(winAmount)} ${currencyLabel}`;
    } else {
        prizeBox.innerText = "Желаем дальнейших успехов";
    }

    const detail = `Выбрал ${playerChoice === 'heads' ? 'ОРЁЛ' : 'РЕШКА'}, выпало ${result === 'heads' ? 'ОРЁЛ' : 'РЕШКА'} — ${isWin ? 'Победа' : 'Проигрыш'}`;
    if (typeof Player_action === 'function') {
        Player_action(gameName, "Результат", detail);
    }

    const resultString = isWin
        ? `Победа, выиграл ${formatAmount(winAmount)} ${currencyLabel}`
        : "Проигрыш";
    const betString = `Ставка: ${window.bet} ${currencyLabel}`;

    if (typeof Player_leave === 'function') {
        Player_leave(
            gameName,
            `${resultString} | ${betString} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`
        );
    }

    const unlockUI = () => {
        allBtns.forEach(el => el.disabled = false);
        document.querySelector('#game-coin .currency-selector')?.classList.remove('disabled');
        document.querySelector('#game-coin .bet-box')?.classList.remove('disabled');
        coinInProgress = false;
    };

    // ⏳ Сначала запись, потом баланс, потом UI
    if (typeof recordGame === 'function') {
        const result = recordGame(
            "coin",
            window.bet,
            isWin ? "win" : "lose",
            isWin,
            window.selectedCurrency,
            winAmount,
            true
        );

        if (result instanceof Promise) {
            result.then(() => {
                if (typeof forceBalance === "function") {
                    forceBalance(0).then(unlockUI);
                } else {
                    unlockUI();
                }
            });
        } else {
            if (typeof forceBalance === "function") {
                forceBalance(0).then(unlockUI);
            } else {
                unlockUI();
            }
        }
    } else {
        unlockUI();
    }
}, { once: true });


}

    window.setCoinChoice = setCoinChoice;
    window.resetCoinScreen = resetCoinScreen;
    window.playCoin = playCoin;
})();

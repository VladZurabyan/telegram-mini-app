(function () {
    let wheelInProgress = false;
    const wheelSectors = [2, 3, 10, 0, 0.5, 0.5, 1, 1];
    const sectorAngle = 360 / wheelSectors.length;
    const sectorWeights = [0.15, 0.15, 0.0001, 0.25, 0.2, 0.2, 0.0249, 0.025];

    function weightedRandomIndex(weights) {
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        const rand = Math.random() * totalWeight;
        let acc = 0;
        for (let i = 0; i < weights.length; i++) {
            acc += weights[i];
            if (rand < acc) return i;
        }
        return weights.length - 1;
    }

    function blockWheelUI() {
        document.querySelectorAll('#game-wheel .currency-selector button').forEach(btn => btn.disabled = true);
        document.querySelectorAll('#game-wheel .bet-box button').forEach(btn => btn.disabled = true);
        document.getElementById('btn-wheel-spin')?.setAttribute('disabled', 'true');
        document.querySelector('#game-wheel .back-btn')?.setAttribute('disabled', 'true');
        document.querySelector('#game-wheel .bet-box')?.classList.add('disabled');
    }

    function unblockWheelUI() {
        document.querySelectorAll('#game-wheel .currency-selector button').forEach(btn => btn.disabled = false);
        document.querySelectorAll('#game-wheel .bet-box button').forEach(btn => btn.disabled = false);
        document.getElementById('btn-wheel-spin')?.removeAttribute('disabled');
        document.querySelector('#game-wheel .back-btn')?.removeAttribute('disabled');
        document.querySelector('#game-wheel .bet-box')?.classList.remove('disabled');
    }

    function resetWheelScreen() {
        wheelInProgress = false;
        const resultBox = document.getElementById('wheelResult');
        const prizeBox = document.getElementById('wheelPrize');
        if (resultBox) resultBox.innerText = '';
        if (prizeBox) prizeBox.innerText = '';
        const wheelWrapper = document.getElementById('wheelWrapper');
        if (wheelWrapper) {
            wheelWrapper.style.transition = 'none';
            wheelWrapper.style.transform = 'rotate(0deg)';
        }
        unblockWheelUI();
        document.getElementById('btn-wheel-spin')?.removeAttribute('disabled');
    }

    function spinWheel() {
        const gameName = "Wheel";
        const spinButton = document.getElementById('btn-wheel-spin');
        const wheelWrapper = document.getElementById('wheelWrapper');
        const resultBox = document.getElementById('wheelResult');
        const prizeBox = document.getElementById('wheelPrize');
        if (!wheelWrapper || !spinButton || wheelInProgress) return;

        if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
            if (typeof Player_action === 'function') {
                Player_action(gameName, "Ошибка", `Некорректная ставка: ${window.bet}`);
            }
            alert("Введите корректную ставку.");
            return;
        }

        const balanceAvailable = window.selectedCurrency === 'ton' ? window.fakeBalance.ton : window.fakeBalance.usdt;

        if (window.bet > balanceAvailable) {
            if (typeof Player_action === 'function') {
                Player_action(gameName, "Ошибка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} > Баланс: ${balanceAvailable} ${window.selectedCurrency.toUpperCase()}`);
            }
            alert(`Недостаточно средств (${window.selectedCurrency.toUpperCase()})`);
            return;
        }

        if (window.bet < minBet) {
            if (typeof Player_action === 'function') {
                Player_action(gameName, "Ошибка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} < Минимум: ${minBet}`);
            }
            alert(`Минимум ${minBet} ${window.selectedCurrency.toUpperCase()}`);
            return;
        }

        if (typeof Player_join === 'function') {
            Player_join(gameName, `TON: ${window.fakeBalance.ton} | USDT: ${window.fakeBalance.usdt}`);
        }

        blockWheelUI();
        wheelInProgress = true;
        spinButton.disabled = true;

        window.fakeBalance[window.selectedCurrency] = +(window.fakeBalance[window.selectedCurrency] - window.bet).toFixed(2);
        updateBalanceUI();

        const selectedIndex = weightedRandomIndex(sectorWeights);
        const selectedMultiplier = wheelSectors[selectedIndex];
        const isWin = selectedMultiplier !== 0;
        const totalRotation = 5 * 360 + (selectedIndex * sectorAngle + sectorAngle / 2);

        resultBox.innerText = '';
        prizeBox.innerText = '';
        wheelWrapper.style.transition = 'none';
        wheelWrapper.style.transform = 'rotate(0deg)';
        void wheelWrapper.offsetWidth;
        wheelWrapper.style.transition = 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)';
        wheelWrapper.style.transform = `rotate(${totalRotation}deg)`;

        setTimeout(() => {
            const winAmount = +(window.bet * selectedMultiplier).toFixed(2);

            if (isWin) {
                resultBox.innerText = `🎉 Победа! x${selectedMultiplier}`;
                prizeBox.innerText = `💰 ${window.bet} × ${selectedMultiplier} = ${formatAmount(winAmount)} ${window.selectedCurrency.toUpperCase()}`;
                window.fakeBalance[window.selectedCurrency] = +(window.fakeBalance[window.selectedCurrency] + winAmount).toFixed(2);
            } else {
                resultBox.innerText = "😢 Вы проиграли!";
                prizeBox.innerText = "";
            }

            updateBalanceUI();

            if (typeof recordGame === 'function') {
                recordGame(
                    "wheel",
                    window.bet,
                    isWin ? "win" : "lose",
                    isWin ? selectedMultiplier : 0,
                    window.selectedCurrency
                );
            }

            if (typeof Player_action === 'function') {
                Player_action(
                    gameName,
                    "Результат",
                    isWin
                        ? `Выпало x${selectedMultiplier}, выигрыш: ${formatAmount(winAmount)} ${window.selectedCurrency.toUpperCase()}`
                        : `Выпало x0 — проигрыш`
                );
            }

            if (typeof Player_leave === 'function') {
                Player_leave(
                    gameName,
                    `${isWin ? `Победа, выиграл ${formatAmount(winAmount)} ${window.selectedCurrency.toUpperCase()}` : `Проигрыш`} | Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`
                );
            }

            if ("vibrate" in navigator) {
                    navigator.vibrate([100, 50, 100]);
                } else if (Telegram.WebApp.HapticFeedback?.impactOccurred) {
                    Telegram.WebApp.HapticFeedback.impactOccurred("heavy");
                }

            wheelInProgress = false;
            spinButton.disabled = false;
            unblockWheelUI();
        }, 4300);
    }

    window.spinWheel = spinWheel;
    window.resetWheelScreen = resetWheelScreen;
})();

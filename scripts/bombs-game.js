(function () {
    let bombsGrid = [];
    let bombsInProgress = false;
    let bombsLives = 1;
    let bombsMultiplier = 1.0;
    let revealedCells = 0;
    let cashoutPressed = false;
    let bombClickLock = false;

    function startBombsGame() {
          const gameName = "Bombs";
        if (bombsInProgress) return;

        cashoutPressed = false;

        const resultBox = document.getElementById('bombResult');
        const prizeBox = document.getElementById('bombPrize');
        if (resultBox) resultBox.innerText = '';
        if (prizeBox) prizeBox.innerText = '';

        document.getElementById('bomb-cashout')?.setAttribute('disabled', 'true');
        document.getElementById('bomb-cashout')?.classList.add('hidden');




if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
            if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Некорректная ставка: ${window.bet}`);
            showCustomAlert("Введите корректную ставку.", "error");
            return;
        }

        const balanceAvailable = window.selectedCurrency === 'ton'
            ? parseFloat(window.fakeBalance.ton.toFixed(2))
            : parseFloat(window.fakeBalance.usdt.toFixed(2));

        if (window.bet > balanceAvailable) {
            if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} > Баланс: ${balanceAvailable} ${window.selectedCurrency.toUpperCase()}`);
            showCustomAlert(`Недостаточно средств (${window.selectedCurrency.toUpperCase()})`, "error");
            return;
        }

        if (window.bet < window.minBet) {
            if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} < Минимум: ${window.minBet} ${window.selectedCurrency.toUpperCase()}`);
            showCustomAlert(`Минимум ${window.minBet} ${window.selectedCurrency.toUpperCase()}`, "error");
            return;
        }

        if (typeof Player_join === 'function') {
            Player_join(gameName, `TON: ${window.fakeBalance.ton} | USDT: ${window.fakeBalance.usdt}`);
        }

        showEmptyBombGrid();
        blockBombUI();

        bombsInProgress = true;
        bombsLives = 1;
        bombsMultiplier = 1.0;
        revealedCells = 0;
        bombsGrid = [];

        window.fakeBalance[window.selectedCurrency] = parseFloat((window.fakeBalance[window.selectedCurrency] - window.bet).toFixed(2));
        updateBalanceUI();
        updateBombMultiplierUI();

        const grid = document.querySelector('.bombs-grid');
        grid.innerHTML = '';

        for (let i = 0; i < 25; i++) {
            const isBomb = Math.random() < 0.2;
            bombsGrid.push(isBomb ? 'bomb' : 'coin');

            const cell = document.createElement('div');
            cell.className = 'bomb-cell';
            cell.dataset.index = i;
            cell.innerHTML = `
                <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back"></div>
                </div>
            `;
            cell.onclick = () => revealBombCell(cell, i);
            grid.appendChild(cell);
        }

        document.getElementById('btn-bomb-start')?.classList.add('hidden');
    }

    function revealBombCell(cell, index) {
        if (!bombsInProgress || cell.classList.contains('revealed') || bombClickLock) return;
        if (!bombsGrid[index]) return;

        bombClickLock = true;
        document.getElementById('bomb-cashout')?.setAttribute('disabled', 'true');

        const dynamicBombChance = [0.1, 0.15, 0.25, 0.4, 0.6, 0.8, 1.0];
        const chance = dynamicBombChance[revealedCells] ?? 1.0;
        if (bombsGrid[index] === 'coin' && Math.random() < chance) {
            bombsGrid[index] = 'bomb';
        }

        const type = bombsGrid[index];
        const backSide = cell.querySelector('.card-back');
        if (!backSide) return;

        requestAnimationFrame(() => {
            cell.classList.add('revealed');

            if (type === 'bomb') {
                backSide.innerHTML = '💣';
                backSide.classList.remove('bomb-hit');
                void backSide.offsetWidth;
                backSide.classList.add('bomb-hit');

                if ("vibrate" in navigator) {
                    navigator.vibrate([100, 50, 100]);
                } else if (Telegram.WebApp.HapticFeedback?.impactOccurred) {
                    Telegram.WebApp.HapticFeedback.impactOccurred("heavy");
                }

                cell.classList.remove('shake');
                void cell.offsetWidth;
                cell.classList.add('shake');

                document.querySelectorAll('#game-bombs .bomb-cell').forEach(c => (c.onclick = null));

                if (typeof Player_action === 'function') {
                    Player_action("Bombs", "Взрыв", `Проигрыш на ячейке ${index + 1}`);
                }


                setTimeout(() => {
                    bombsLives = 0;
                    endBombsGame(false);
                }, 600);
            } else {
                backSide.innerHTML = '💎';
                backSide.classList.add('diamond-glow');
                bombsMultiplier += 0.3;
                revealedCells++;
                updateBombMultiplierUI();

                if (typeof Player_action === 'function') {
                    Player_action("Bombs", "Удачный клик", `Ячейка ${index + 1}, множитель: ${bombsMultiplier.toFixed(2)}x`);
                }


                if (revealedCells > 0 && !cashoutPressed) {
                    const btn = document.getElementById('bomb-cashout');
                    btn?.removeAttribute('disabled');
                    btn?.classList.remove('hidden');
                }
            }

            setTimeout(() => {
                bombClickLock = false;
            }, 300);
        });
    }

    function collectBombsPrize() {
        if (!bombsInProgress || cashoutPressed || revealedCells === 0) return;

        cashoutPressed = true;
        document.getElementById('bomb-cashout')?.setAttribute('disabled', 'true');

        const winAmount = parseFloat((window.bet * bombsMultiplier).toFixed(2));
        window.fakeBalance[window.selectedCurrency] = parseFloat((window.fakeBalance[window.selectedCurrency] + winAmount).toFixed(2));

        if (typeof Player_action === 'function') {
            Player_action("Bombs", "Кэш-аут", `Вывел ${formatAmount(winAmount)} ${window.selectedCurrency.toUpperCase()} после ${revealedCells} ячеек`);
        }


        updateBalanceUI();
        endBombsGame(true, winAmount);
    }

    function endBombsGame(won, winAmount = 0) {
        bombsInProgress = false;

        const resultBox = document.getElementById('bombResult');
        const prizeBox = document.getElementById('bombPrize');
        const currencyLabel = window.selectedCurrency.toUpperCase();

        if (won) {
            if (resultBox) resultBox.innerText = "Победа!";
            if (prizeBox) prizeBox.innerText = `Вы выиграли: ${formatAmount(winAmount)} ${currencyLabel}`;
        } else {
            if (resultBox) resultBox.innerText = "Бомба 💥";
            if (prizeBox) prizeBox.innerText = "Желаем дальнейших успехов!";


        }

        bombsMultiplier = 1.0;
        updateBombMultiplierUI();
        unblockBombUI();

        document.getElementById('bomb-cashout')?.classList.add('hidden');
        document.getElementById('btn-bomb-start')?.classList.remove('hidden');

        document.querySelectorAll('#game-bombs .bomb-cell').forEach(c => (c.onclick = null));

        document.querySelectorAll('#game-bombs .bomb-cell').forEach((cell, index) => {
            if (!cell.classList.contains('revealed')) {
                const back = cell.querySelector('.card-back');
                const inner = cell.querySelector('.card-inner');
                cell.classList.add('revealed');

                if (bombsGrid[index] === 'bomb') {
                    back.innerHTML = '💣';
                    back.classList.add('bomb-hit');
                } else {
                    back.innerHTML = '💎';
                    back.classList.add('diamond-glow');
                }

                void inner.offsetWidth;
                inner.classList.add('pop-flip');
            }
        });

  if (typeof recordGame === 'function') {
            recordGame("bombs", window.bet, won ? "win" : "lose", won ? bombsMultiplier : 0, window.selectedCurrency);
        }


        if (typeof Player_leave === 'function') {
            const resultString = won ? `Победа, выиграл ${formatAmount(winAmount)} ${window.selectedCurrency.toUpperCase()}` : "Проигрыш";
            const betString = `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()}`;
            Player_leave("Bombs", `${resultString} | ${betString} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`);
        }




        bombsGrid = [];
    }

    function updateBombMultiplierUI() {
        const el = document.getElementById('bomb-multiplier');
        if (el) el.innerText = bombsMultiplier.toFixed(2) + 'x';
    }

    function blockBombUI() {
        document.querySelectorAll('#game-bombs .currency-selector button').forEach(btn => btn.disabled = true);
        document.querySelectorAll('#game-bombs .bet-box button').forEach(btn => btn.disabled = true);
        document.getElementById('btn-bomb-start')?.setAttribute('disabled', 'true');
        document.querySelector('#game-bombs .back-btn')?.setAttribute('disabled', 'true');
        document.querySelector('#game-bombs .bet-box')?.classList.add('disabled');
    }

    function unblockBombUI() {
        document.querySelectorAll('#game-bombs .currency-selector button').forEach(btn => btn.disabled = false);
        document.querySelectorAll('#game-bombs .bet-box button').forEach(btn => btn.disabled = false);
        document.getElementById('btn-bomb-start')?.removeAttribute('disabled');
        document.querySelector('#game-bombs .back-btn')?.removeAttribute('disabled');
        document.querySelector('#game-bombs .bet-box')?.classList.remove('disabled');
    }

    function showEmptyBombGrid() {
        const grid = document.querySelector('.bombs-grid');
        grid.innerHTML = '';
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.className = 'bomb-cell placeholder';
            grid.appendChild(cell);
        }
    }

    function resetBombsGame() {
    bombsInProgress = false;
    bombsLives = 1;
    bombsMultiplier = 1.0;
    revealedCells = 0;
    cashoutPressed = false;
    bombClickLock = false;
    bombsGrid = [];

    const grid = document.querySelector('.bombs-grid');
    if (grid) grid.innerHTML = '';

    const resultBox = document.getElementById('bombResult');
    const prizeBox = document.getElementById('bombPrize');
    if (resultBox) resultBox.innerText = '';
    if (prizeBox) prizeBox.innerText = '';

    document.getElementById('bomb-cashout')?.classList.add('hidden');
    document.getElementById('btn-bomb-start')?.classList.remove('hidden');

    unblockBombUI();
    updateBombMultiplierUI();
}


    // Экспорт наружу
    window.resetBombsScreen = resetBombsGame;
    window.startBombsGame = startBombsGame;
    window.collectBombsPrize = collectBombsPrize;
    window.showEmptyBombGrid = showEmptyBombGrid;
})();

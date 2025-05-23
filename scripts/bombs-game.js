let bombsGrid = []; // массив с 'bomb' или 'coin'
let bombsInProgress = false;
let bombsLives = 1;
let bombsMultiplier = 1.0;
let revealedCells = 0;
let cashoutPressed = false;

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

function startBombsGame() {
    cashoutPressed = false;
    document.getElementById('bomb-cashout')?.removeAttribute('disabled');
    blockBombUI();

    if (bombsInProgress) return;

    if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
        alert("Введите корректную ставку.");
        unblockBombUI();
        return;
    }

    const balanceAvailable = selectedCurrency === 'ton'
        ? parseFloat(fakeBalance.ton.toFixed(2))
        : parseFloat(fakeBalance.usdt.toFixed(2));

    if (window.bet > balanceAvailable) {
        alert(`Недостаточно средств (${selectedCurrency.toUpperCase()})`);
        unblockBombUI();
        return;
    }

    if (window.bet < minBet) {
        alert(`Минимум ${minBet} TON`);
        unblockBombUI();
        return;
    }

    bombsInProgress = true;
    bombsLives = 1;
    bombsMultiplier = 1.0;
    revealedCells = 0;
    bombsGrid = [];

    fakeBalance[selectedCurrency] = parseFloat((fakeBalance[selectedCurrency] - window.bet).toFixed(2));
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

    document.getElementById('bomb-cashout')?.classList.remove('hidden');
    document.getElementById('btn-bomb-start')?.classList.add('hidden');
}

function revealBombCell(cell, index) {
    if (!bombsInProgress || cell.classList.contains('revealed')) return;

    const type = bombsGrid[index];
    cell.classList.add('revealed');

    const backSide = cell.querySelector('.card-back');
    if (type === 'bomb') {
        backSide.innerHTML = '💣';
        backSide.classList.add('bomb-hit');
        bombsLives = 0;
        endBombsGame(false);
    } else {
        backSide.innerHTML = '💎';
        backSide.classList.add('diamond-glow');
        bombsMultiplier += 0.3;
        revealedCells++;
        updateBombMultiplierUI();
    }
}

function updateBombMultiplierUI() {
    const el = document.getElementById('bomb-multiplier');
    if (el) el.innerText = bombsMultiplier.toFixed(2) + 'x';
}

function collectBombsPrize() {
    if (!bombsInProgress || cashoutPressed) return;

    cashoutPressed = true;
    document.getElementById('bomb-cashout')?.setAttribute('disabled', 'true');

    const winAmount = bet * bombsMultiplier;

    if (selectedCurrency === 'ton') {
        fakeBalance.ton += winAmount;
    } else {
        fakeBalance.usdt += winAmount;
    }

    updateBalanceUI();
    endBombsGame(true);
}

function endBombsGame(won) {
    bombsMultiplier = 1.0;
updateBombMultiplierUI(); // чтобы обновить UI


    unblockBombUI();
    bombsInProgress = false;
    document.getElementById('bomb-cashout')?.classList.add('hidden');
    document.getElementById('btn-bomb-start')?.classList.remove('hidden');

    const msg = won
        ? `🏆 Победа! Вы выиграли ${formatAmount(bet * bombsMultiplier)}`
        : `💥 Бомба! Вы потеряли ${formatAmount(bet)}`;
    alert(msg);

    showEmptyBombGrid();

    document.querySelectorAll('#game-bombs .bomb-cell').forEach(c => (c.onclick = null));
}
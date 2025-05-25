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
    if (bombsInProgress) return;

    cashoutPressed = false;

    const resultBox = document.getElementById('bombResult');
    const prizeBox = document.getElementById('bombPrize');
    if (resultBox) resultBox.innerText = '';
    if (prizeBox) prizeBox.innerText = '';

    document.getElementById('bomb-cashout')?.removeAttribute('disabled');

    if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
        alert("Введите корректную ставку.");
        return;
    }

    const balanceAvailable = selectedCurrency === 'ton'
        ? parseFloat(fakeBalance.ton.toFixed(2))
        : parseFloat(fakeBalance.usdt.toFixed(2));

    if (window.bet > balanceAvailable) {
        alert(`Недостаточно средств (${selectedCurrency.toUpperCase()})`);
        return;
    }

    if (window.bet < minBet) {
        alert(`Минимум ${minBet} TON`);
        return;
    }

    showEmptyBombGrid();
    blockBombUI();

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

    document.getElementById('bomb-cashout')?.classList.add('hidden'); // скрыта до первой монеты
    document.getElementById('btn-bomb-start')?.classList.add('hidden');
}

function revealBombCell(cell, index) {

    if (!bombsInProgress || cell.classList.contains('revealed')) return;

            if (!bombsGrid[index]) return;

    // 🎯 Динамический шанс, что следующая монета — бомба
const dynamicBombChance = [0.1, 0.15, 0.25, 0.4, 0.6, 0.8, 1.0]; // по количеству открытых алмазов
const chance = dynamicBombChance[revealedCells] ?? 1.0; // если больше 6 открытых — 100%
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
    }

           cell.classList.remove('shake');
void cell.offsetWidth;
cell.classList.add('shake');



            document.querySelectorAll('#game-bombs .bomb-cell').forEach(c => (c.onclick = null));

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
            document.getElementById('bomb-cashout')?.classList.remove('hidden');
        }
    });
}

function updateBombMultiplierUI() {
    const el = document.getElementById('bomb-multiplier');
    if (el) el.innerText = bombsMultiplier.toFixed(2) + 'x';
}

function collectBombsPrize() {
    if (!bombsInProgress || cashoutPressed) return;

    cashoutPressed = true;
    document.getElementById('bomb-cashout')?.setAttribute('disabled', 'true');

    const winAmount = parseFloat((window.bet * bombsMultiplier).toFixed(2));
    fakeBalance[selectedCurrency] = parseFloat((fakeBalance[selectedCurrency] + winAmount).toFixed(2));

    updateBalanceUI();
    endBombsGame(true, winAmount);
}

function endBombsGame(won, winAmount = 0) {
    bombsInProgress = false;

    const resultBox = document.getElementById('bombResult');
    const prizeBox = document.getElementById('bombPrize');

    const currencyLabel = selectedCurrency.toUpperCase();

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

    // Отключить клики
    document.querySelectorAll('#game-bombs .bomb-cell').forEach(c => (c.onclick = null));

    // 🔁 Автоматически открыть все оставшиеся клетки
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
            inner.classList.add('pop-flip'); // чтобы анимация сработала

        }
    });
    bombsGrid = []; // Очистить массив после игры 
}


let crashInProgress = false;
let cashedOut = false;
let multiplier = 1.0;
let interval;

const crashStartBtn = document.getElementById('crash-start');
const crashCashoutBtn = document.getElementById('crash-cashout');

if (crashStartBtn) crashStartBtn.onclick = startCrash;
if (crashCashoutBtn) crashCashoutBtn.onclick = cashOut;

function startCrash() {
    if (crashInProgress) return;
    crashInProgress = true;
    cashedOut = false;
    multiplier = 1.0;

    const balanceAvailable = selectedCurrency === 'ton' ? fakeBalance.ton : fakeBalance.usdt;
    if (bet > balanceAvailable) {
        alert(`Недостаточно средств (${selectedCurrency.toUpperCase()})`);
        crashInProgress = false;
        return;
    }

    document.getElementById('crash-multiplier').innerText = 'x1.00';
    document.getElementById('crash-status').innerText = '✈️ Взлёт...';
    document.getElementById('crash-result').innerText = '';
    crashStartBtn.disabled = true;
    crashCashoutBtn.disabled = false;

    const crashPoint = (Math.random() * 4 + 1.5).toFixed(2);

    interval = setInterval(() => {
        multiplier += 0.01;
        document.getElementById('crash-multiplier').innerText = 'x' + multiplier.toFixed(2);

        if (multiplier >= crashPoint) {
            clearInterval(interval);
            document.getElementById('crash-status').innerText = `💥 CRASHED на x${multiplier.toFixed(2)}`;
            if (!cashedOut) {
                updateBalance(false);
            }
            crashInProgress = false;
            crashStartBtn.disabled = false;
            crashCashoutBtn.disabled = true;
        }
    }, 50);
}

function cashOut() {
    if (!crashInProgress || cashedOut) return;
    cashedOut = true;
    clearInterval(interval);
    document.getElementById('crash-status').innerText = `✅ Забрано на x${multiplier.toFixed(2)}`;
    updateBalance(true);
    crashInProgress = false;
    crashStartBtn.disabled = false;
    crashCashoutBtn.disabled = true;
}

function updateBalance(isWin) {
    const delta = isWin ? bet * multiplier : -bet;
    if (selectedCurrency === 'ton') fakeBalance.ton += delta;
    else fakeBalance.usdt += delta;

    updateBalanceUI();
    document.getElementById('crash-result').innerText = isWin
        ? `🎉 Вы выиграли ${delta.toFixed(2)} ${selectedCurrency.toUpperCase()}`
        : `❌ Вы проиграли ${bet.toFixed(2)} ${selectedCurrency.toUpperCase()}`;

    recordGame('crash', bet, isWin ? 'win' : 'lose', isWin);
}

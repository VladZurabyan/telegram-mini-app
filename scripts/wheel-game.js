let wheelInProgress = false;
const wheelSectors = [2, 3, 10, 0, 0.5, 0.5, 1, 1];
const sectorAngle = 360 / wheelSectors.length;

// Шансы на каждый сектор (в порядке индексов wheelSectors)
const sectorWeights = [
    0.15,   // x2
    0.15,   // x3
    0.0001, // x10 (редкий)
    0.25,   // 0 (проигрыш)
    0.2,    // x0.5
    0.2,    // x0.5
    0.0249, // x1
    0.025   // x1
];

// Функция взвешенного выбора индекса
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

window.spinWheel = function () {
    const spinButton = document.getElementById('btn-wheel-spin');
    const wheelWrapper = document.getElementById('wheelWrapper');
    const resultBox = document.getElementById('wheelResult');
    const prizeBox = document.getElementById('wheelPrize');

    if (!wheelWrapper || !spinButton) {
        console.error('⛔ Элементы не найдены');
        return;
    }

    if (wheelInProgress) return;

    resultBox.innerText = '';
    prizeBox.innerText = '';

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
    alert(`Минимум ${minBet} ${selectedCurrency.toUpperCase()}`);
    return;
}

    blockWheelUI();
    wheelInProgress = true;
    spinButton.disabled = true;


    // Списание ставки
    fakeBalance[selectedCurrency] = parseFloat((fakeBalance[selectedCurrency] - window.bet).toFixed(2));
    updateBalanceUI();

    // Выбор сектора по шансам
    const selectedIndex = weightedRandomIndex(sectorWeights);
    const selectedMultiplier = wheelSectors[selectedIndex];

    // Расчет угла
    const centerOffset = sectorAngle / 2;
    const totalRotation = 5 * 360 + (selectedIndex * sectorAngle + centerOffset);

    // Анимация вращения
    wheelWrapper.style.transition = 'none';
    wheelWrapper.style.transform = `rotate(0deg)`;
    void wheelWrapper.offsetWidth; // форсируем пересчет

    wheelWrapper.style.transition = 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)';
    wheelWrapper.style.transform = `rotate(${totalRotation}deg)`;

    setTimeout(() => {
        const winAmount = +(window.bet * selectedMultiplier).toFixed(2);

        if (selectedMultiplier === 0) {
            resultBox.innerText = "😢 Вы проиграли!";
            prizeBox.innerText = "";
        } else {
            resultBox.innerText = `🎉 Победа! x${selectedMultiplier}`;
            prizeBox.innerText = `💰 ${window.bet} × ${selectedMultiplier} = ${winAmount} ${selectedCurrency.toUpperCase()}`;
            fakeBalance[selectedCurrency] = parseFloat((fakeBalance[selectedCurrency] + winAmount).toFixed(2));
        }

        updateBalanceUI();
        wheelInProgress = false;
        spinButton.disabled = false;

        unblockWheelUI();

        if ("vibrate" in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    }, 4300);
};

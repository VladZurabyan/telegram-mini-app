(function () {
let crashInProgress = false;
let cashedOut = false;
let multiplier = 1.0;
let interval;
let flightPoints = [];
let animationMultiplier = 1.0;
let crashResultText = '';
let crashWinAmount = 0;

function playCrash() {
    const gameName = "Crash";

    const prankChance = 0.1;
    const prank = Math.random() < prankChance;
    if (prank) {
        document.getElementById('game-crash').style.display = 'none';
        document.getElementById('crash-joke').style.display = 'block';
        setTimeout(() => {
            document.getElementById('crash-joke').style.display = 'none';
            document.getElementById('game-crash').style.display = 'block';
        }, 4000);
        return;
    }

    if (crashInProgress) return;

    if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
        if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Некорректная ставка: ${window.bet}`);
        showCustomAlert("Введите корректную ставку.", "error");
        return;
    }

    const balanceAvailable = window.selectedCurrency === 'ton'
        ? parseFloat(window.fakeBalance.ton.toFixed(2))
        : parseFloat(window.fakeBalance.usdt.toFixed(2));

    if (window.bet > balanceAvailable) {
        if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Ставка: ${window.bet} > Баланс: ${balanceAvailable} (${window.selectedCurrency.toUpperCase()})`);
        showCustomAlert(`Недостаточно средств (${window.selectedCurrency.toUpperCase()})`, "error");
        return;
    }

    if (window.bet < window.minBet) {
        if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Ставка: ${window.bet} < Минимум: ${window.minBet}`);
        showCustomAlert(`Минимум ${window.minBet} ${window.selectedCurrency.toUpperCase()}`, "error");
        return;
    }

    if (typeof Player_join === 'function') {
        Player_join(gameName, `TON: ${window.fakeBalance.ton} | USDT: ${window.fakeBalance.usdt}`);
    }

    if (typeof Player_action === 'function') {
        Player_action(gameName, "Ставка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()}`);
    }

    crashInProgress = true;
    cashedOut = false;
    multiplier = 1.0;
    flightPoints = [];
    animationMultiplier = 0.0;

    document.querySelector('#game-crash .currency-selector')?.classList.add('disabled');
    document.querySelector('#game-crash .bet-box')?.classList.add('disabled');
    const backBtn = document.querySelector('#game-crash .back-btn');
    if (backBtn) {
        backBtn.style.pointerEvents = 'none';
        backBtn.style.opacity = '0.5';
    }

    const plane = document.getElementById('crashPlane');
    plane.classList.remove('crash', 'cashout');
    plane.style.transition = 'transform 0.1s linear';
    plane.style.transform = 'translate(0px, 0px)';
    const path = document.getElementById('flightPath');
    if (path) path.setAttribute('d', '');

    if (typeof recordGame === 'function') {
    const result = recordGame(
        "crash",
        window.bet,
        "pending",       // ожидание
        false,           // win
        window.selectedCurrency,
        0,               // prize
        false            // не финал
    );

    if (result instanceof Promise) {
        result
            .then(() => {
                startCrashAnimation(); // 🎯 запуск игры и анимации
            })
            .catch(() => {
                crashInProgress = false;
                showCustomAlert("❌ Ошибка сервера. Попробуйте ещё раз.", "error");
            });
        return; // ⛔ не запускать игру до получения ответа
    }
}

// если recordGame не возвращает Promise — запускаем сразу
startCrashAnimation();



    const crashStatus = document.getElementById('crash-status');
    crashStatus.classList.remove('crash-win', 'crash-lose');
    document.getElementById('crash-multiplier').innerText = 'x1.00';
    document.getElementById('crash-status').innerText = '✈️ Взлёт...';
    document.getElementById('crash-result').innerText = '';
    document.getElementById('crash-start').disabled = true;
    document.getElementById('crash-cashout').disabled = false;

    const crashPoint = parseFloat((Math.pow(Math.random(), 2.5) * 1.5 + 1.01).toFixed(2));


    interval = setInterval(() => {
        multiplier += 0.005;
        animationMultiplier += 0.015;

        document.getElementById('crash-multiplier').innerText = 'x' + multiplier.toFixed(2);

        const x = animationMultiplier * 40;
        const baseY = animationMultiplier * 10;
        const wave = Math.sin(animationMultiplier * 5) * 5;
        const y = baseY + wave;

        plane.style.transform = `translate(${x}px, ${-y}px)`;
        const drawX = x + 10;
        const svg = document.querySelector('.flight-line');
        const svgHeight = svg?.clientHeight || 200;
        const drawY = svgHeight - y - 35;
        flightPoints.push({ x: drawX, y: drawY });
        const path = document.getElementById('flightPath');
        if (path && flightPoints.length > 1) {
            const d = flightPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`).join(' ');
            path.setAttribute('d', d);
        }

        const frame = document.querySelector('.crash-flight-frame');
        if (frame) {
            frame.style.backgroundPosition = `-${x}px 0`;
        }

        if (multiplier >= crashPoint) {
            clearInterval(interval);
            crashStatus.classList.remove('crash-win', 'crash-lose');
            crashStatus.innerText = `💥 Самолёт упал на x${multiplier.toFixed(2)}`;
            crashStatus.classList.add('crash-lose');

            if (!cashedOut) {
                updateCrashBalance(false);
                plane.classList.add('crash');
            }
            endCrashRound();
        }
    }, 50);
}

function crashCashOut() {
    const gameName = "Crash";
    if (!crashInProgress || cashedOut) return;
    cashedOut = true;
    clearInterval(interval);

    const crashStatus = document.getElementById('crash-status');
    crashStatus.classList.remove('crash-win', 'crash-lose');
    crashStatus.innerText = `✅ Забрано на x${multiplier.toFixed(2)}`;
    crashStatus.classList.add('crash-win');

    if (typeof Player_action === 'function') Player_action(gameName, "Кэш-аут", `Вывел на x${multiplier.toFixed(2)}`);

    updateCrashBalance(true);
    const plane = document.getElementById('crashPlane');
    plane.classList.remove('crash');
    plane.classList.add('cashout');
    endCrashRound();
}

function endCrashRound() {
    multiplier = 1.0;
    animationMultiplier = 0.0;
    cashedOut = false;

    clearInterval(interval);
    crashInProgress = false;
    document.getElementById('crash-start').disabled = false;
    document.getElementById('crash-cashout').disabled = true;

    document.querySelector('#game-crash .currency-selector')?.classList.remove('disabled');
    document.querySelector('#game-crash .bet-box')?.classList.remove('disabled');

    const backBtn = document.querySelector('#game-crash .back-btn');
    if (backBtn) {
        backBtn.style.pointerEvents = 'auto';
        backBtn.style.opacity = '1';
    }

    const plane = document.getElementById('crashPlane');
    flightPoints = [];
    document.getElementById('flightPath')?.setAttribute('d', '');

    setTimeout(() => {
        plane.classList.remove('crash', 'cashout');
        plane.style.transform = 'translate(0, 0)';
    }, 1000);

    if (typeof Player_leave === 'function') {
        Player_leave("Crash", `${crashResultText} | Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()}`);
    }
}


function updateCrashBalance(isWin) {
    const prize = isWin ? +(window.bet * multiplier).toFixed(2) : 0;

    document.getElementById('crash-result').innerText = isWin
        ? `🎉 Вы выиграли ${formatAmount(prize)} ${window.selectedCurrency.toUpperCase()}`
        : `😞 Вы проиграли. Попробуйте еще раз.`;

    crashResultText = isWin
        ? `Победа на x${multiplier.toFixed(2)}`
        : `Проигрыш на x${multiplier.toFixed(2)}`;
    crashWinAmount = prize;

    if (typeof recordGame === 'function') {
        const result = recordGame(
            "crash",                  // game
            window.bet,              // bet
            isWin ? "win" : "lose",  // result
            isWin,                   // win
            window.selectedCurrency, // currency
            prize,                   // prize
            true                     // final
        );

        if (result instanceof Promise) {
            result
                .then(() => forceBalance?.(0))
                .then(() => updateBalanceUI?.());
        } else {
            forceBalance?.(0)?.then(() => updateBalanceUI?.());
        }
    } else {
        forceBalance?.(0)?.then(() => updateBalanceUI?.());
    }
}


function resetCrashScreen() {
    clearInterval(interval);
    crashInProgress = false;
    cashedOut = false;
    multiplier = 1.0;
    animationMultiplier = 0.0;
    flightPoints = [];

    document.getElementById('crash-multiplier').innerText = 'x1.00';
    document.getElementById('crash-status').innerText = '';
    document.getElementById('crash-status').className = '';
    document.getElementById('crash-result').innerText = '';
    document.getElementById('crash-start').disabled = false;
    document.getElementById('crash-cashout').disabled = true;

    const plane = document.getElementById('crashPlane');
    plane.classList.remove('crash', 'cashout');
    plane.style.transform = 'translate(0, 0)';
    plane.style.transition = 'transform 0.1s linear';
    document.getElementById('flightPath')?.setAttribute('d', '');

    document.querySelector('#game-crash .currency-selector')?.classList.remove('disabled');
    document.querySelector('#game-crash .bet-box')?.classList.remove('disabled');
    const backBtn = document.querySelector('#game-crash .back-btn');
    if (backBtn) {
        backBtn.style.pointerEvents = 'auto';
        backBtn.style.opacity = '1';
    }

    document.getElementById('crash-joke')?.style.setProperty('display', 'none');
    document.getElementById('game-crash')?.style.setProperty('display', 'block');

    if (typeof updateBalanceUI === 'function') updateBalanceUI();
}

window.resetCrashScreen = resetCrashScreen;
window.playCrash = playCrash;
window.crashCashOut = crashCashOut;
})();

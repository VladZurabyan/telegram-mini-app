let crashInProgress = false;
let cashedOut = false;
let multiplier = 1.0;
let interval;
let flightPoints = []; // ← добавили
 let animationMultiplier = 1.0;











function playCrash() {



const prankChance = 0.1; // 10% шанс шутки
const prank = Math.random() < prankChance;

if (prank) {
    document.getElementById('game-crash').style.display = 'none';
    document.getElementById('crash-joke').style.display = 'block';

    setTimeout(() => {
        document.getElementById('crash-joke').style.display = 'none';
        document.getElementById('game-crash').style.display = 'block';
    }, 4000); // Показ шутки 4 секунды

    return;
}

   if (crashInProgress) return;

   if (!bet || isNaN(bet) || bet <= 0) {
        alert("Введите корректную ставку.");
        return;
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

    const balanceAvailable = selectedCurrency === 'ton'
    ? parseFloat(fakeBalance.ton.toFixed(2))
    : parseFloat(fakeBalance.usdt.toFixed(2));
    if (bet > balanceAvailable) {
        alert(`Недостаточно средств (${selectedCurrency.toUpperCase()})`);
        crashInProgress = false;
        // 🔓 Разблокировать интерфейс
    document.querySelector('#game-crash .currency-selector')?.classList.remove('disabled');
    document.querySelector('#game-crash .bet-box')?.classList.remove('disabled');
    const backBtn = document.querySelector('#game-crash .back-btn');
    if (backBtn) {
        backBtn.style.pointerEvents = 'auto';
        backBtn.style.opacity = '1';
    }

    return;
    }




    if (bet < minBet) {
    alert(`Минимум ${minBet} TON`);
    crashInProgress = false;

    // 🔓 Разблокировка интерфейса после alert
    document.querySelector('#game-crash .currency-selector')?.classList.remove('disabled');
document.querySelector('#game-crash .bet-box')?.classList.remove('disabled');
const backBtn = document.querySelector('#game-crash .back-btn');
if (backBtn) {
    backBtn.style.pointerEvents = 'auto';
    backBtn.style.opacity = '1';
}


    return;
}

         // 💳 Списываем ставку из баланса
    if (selectedCurrency === 'ton') {
        fakeBalance.ton -= bet;
    } else {
        fakeBalance.usdt -= bet;
    }

    updateBalanceUI(); // ✅ ОБНОВЛЯЕМ интерфейс сразу после вычета

    const crashStatus = document.getElementById('crash-status');
crashStatus.classList.remove('crash-win', 'crash-lose');
    document.getElementById('crash-multiplier').innerText = 'x1.00';
    document.getElementById('crash-status').innerText = '✈️ Взлёт...';
    document.getElementById('crash-result').innerText = '';
    document.getElementById('crash-start').disabled = true;
    document.getElementById('crash-cashout').disabled = false;

    const crashPoint = parseFloat((Math.pow(Math.random(), 2) * 3 + 1.01).toFixed(2));





interval = setInterval(() => {
    multiplier += 0.005;              // игра идёт медленно
    animationMultiplier += 0.015;      // самолёт летит быстрее

    document.getElementById('crash-multiplier').innerText =
        'x' + multiplier.toFixed(2);

    const x = animationMultiplier * 40;
    const baseY = animationMultiplier * 10;
    const wave = Math.sin(animationMultiplier * 5) * 5;
    const y = baseY + wave;

    const plane = document.getElementById('crashPlane');
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


    // Двигаем фон влево, создавая эффект полёта
const frame = document.querySelector('.crash-flight-frame');
if (frame) {
    frame.style.backgroundPosition = `-${x}px 0`;
}



    if (multiplier >= crashPoint) {
        clearInterval(interval);
        const crashStatus = document.getElementById('crash-status');
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
   // const crashStatus = document.getElementById("crash-status");
    if (!crashInProgress || cashedOut) return;
    cashedOut = true;
    clearInterval(interval);
    const crashStatus = document.getElementById('crash-status');
crashStatus.classList.remove('crash-win', 'crash-lose');
crashStatus.innerText = `✅ Забрано на x${multiplier.toFixed(2)}`;
crashStatus.classList.add('crash-win');

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

    // Очистка линии
    flightPoints = [];
document.getElementById('flightPath')?.setAttribute('d', '');



    setTimeout(() => {
        plane.classList.remove('crash', 'cashout');
        plane.style.transform = 'translate(0, 0)';
    }, 1000);
}

function updateCrashBalance(isWin) {
    if (isWin) {
        const payout = bet * multiplier;
        if (selectedCurrency === 'ton') fakeBalance.ton += payout;
        else fakeBalance.usdt += payout;

        document.getElementById('crash-result').innerText =
            `🎉 Вы выиграли ${formatAmount(payout)} ${selectedCurrency.toUpperCase()}`;
    } else {
        document.getElementById('crash-result').innerText =
            `😞 Вы проиграли. Попробуйте еще раз.`;
    }

    updateBalanceUI();

    recordGame('crash', bet, isWin ? 'win' : 'lose', isWin);
}


window.playCrash = playCrash;
window.crashCashOut = crashCashOut;

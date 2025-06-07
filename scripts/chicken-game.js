(function () {
let chickenStep = 0;
let carIntervals = [];
let collisionInterval = null;
let gameStarted = false;
let gameOver = false;

function blockChickenUI() {
    document.querySelectorAll('#game-chicken .currency-selector button').forEach(btn => btn.disabled = true);
    document.querySelectorAll('#game-chicken .bet-box button').forEach(btn => btn.disabled = true);
    document.querySelector('#game-chicken .play-btn')?.setAttribute('disabled', 'true');
    document.querySelector('#game-chicken .back-btn')?.setAttribute('disabled', 'true');

    document.querySelector('#game-chicken .bet-box')?.classList.add('disabled'); // ← вот оно!
}


function unblockChickenUI() {
    document.querySelectorAll('#game-chicken .currency-selector button').forEach(btn => btn.disabled = false);
   document.querySelectorAll('#game-chicken .bet-box button').forEach(btn => btn.disabled = false);
    document.querySelector('#game-chicken .play-btn')?.removeAttribute('disabled');
    document.querySelector('#game-chicken .back-btn')?.removeAttribute('disabled');

    document.querySelector('#game-chicken .bet-box')?.classList.remove('disabled'); // ← и тут
}


window.showCustomAlert = function(message, type = "") {
    const alert = document.getElementById("custom-alert");

    alert.classList.remove("success", "error");
    if (type) {
        alert.classList.add(type);
    }

    document.getElementById("custom-alert-message").innerText = message;
    alert.classList.remove("hidden");
};

window.closeCustomAlert = function() {
    const alert = document.getElementById("custom-alert");
    alert.classList.add("hidden");
    alert.classList.remove("success", "error");
};






function resetGame() {

    const chicken = document.getElementById("chicken");
    if (!chicken) return;

    gameStarted = false;
    gameOver = false;
    chickenStep = 0;
    chicken.style.bottom = "0px";

    document.querySelectorAll(".car").forEach(car => car.remove());
    carIntervals.forEach(clearInterval);
    carIntervals = [];

    if (collisionInterval) {
        clearInterval(collisionInterval);
        collisionInterval = null;
    }
      clearTimeout(window.gameTimeout);
    clearInterval(window.countdownInterval);
    document.getElementById("chickenTimer").style.display = "none";

}

function spawnCarSmart(laneSelector, retryDelay = 500) {
    const lane = document.querySelector(laneSelector);
    if (!lane) return;

    const cars = lane.querySelectorAll(".car");
    for (const car of cars) {
        const carLeft = car.getBoundingClientRect().left;
        const laneLeft = lane.getBoundingClientRect().left;
        if (carLeft - laneLeft < 100) {
            setTimeout(() => spawnCarSmart(laneSelector), retryDelay);
            return;
        }
    }

    const car = document.createElement("img");
    const carImages = ["assets/car1.png", "assets/car2.png", "assets/car3.png"];
    car.src = carImages[Math.floor(Math.random() * carImages.length)];
    car.classList.add("car");

    const duration = (Math.random() * 2 + 1).toFixed(2);
    car.style.animationDuration = `${duration}s`;

    lane.appendChild(car);
    car.addEventListener("animationend", () => car.remove());
}

function startCarStream(laneSelector, minDelay, maxDelay) {
    // Начальный спавн сразу 2 машин
    spawnCarSmart(laneSelector);
    setTimeout(() => spawnCarSmart(laneSelector), 300); // вторая машина

    function spawnAndRepeat() {
        if (!gameStarted || gameOver) return;
        spawnCarSmart(laneSelector);
        const nextDelay = Math.random() * (maxDelay - minDelay) + minDelay;
        const interval = setTimeout(spawnAndRepeat, nextDelay);
        carIntervals.push(interval);
    }

    spawnAndRepeat();
}

function playChickenGame() {
    const gameName = "Chicken";
    document.getElementById("boxPrize").innerText = "";
    blockChickenUI();

    if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
        if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Некорректная ставка: ${window.bet}`);
        alert("Введите корректную ставку.");
        unblockChickenUI();
        return;
    }

    const balanceAvailable = window.selectedCurrency === 'ton'
        ? parseFloat(window.fakeBalance.ton.toFixed(2))
        : parseFloat(window.fakeBalance.usdt.toFixed(2));

    if (window.bet > balanceAvailable) {
        if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Недостаточно средств: ${window.bet} ${window.selectedCurrency.toUpperCase()} > ${balanceAvailable} ${window.selectedCurrency.toUpperCase()}`);
        showCustomAlert(`Недостаточно средств (${window.selectedCurrency.toUpperCase()})`, "error");
        unblockChickenUI();
        return;
    }

     if (window.bet < window.minBet) {
        if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} < Минимум: ${window.minBet} ${window.selectedCurrency.toUpperCase()}`);
        showCustomAlert(`Минимум ${window.minBet} ${window.selectedCurrency.toUpperCase()}`, "error");
        unblockChickenUI();
        return;
    }

    if (typeof Player_join === 'function') Player_join(gameName, `TON: ${window.fakeBalance.ton} | USDT: ${window.fakeBalance.usdt}`);
    if (typeof Player_action === 'function') Player_action(gameName, "Ставка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()}`);

    window.fakeBalance[window.selectedCurrency] = parseFloat((window.fakeBalance[window.selectedCurrency] - window.bet).toFixed(2));
    updateBalanceUI();
    resetGame();
    gameStarted = true;

    const timerEl = document.getElementById("chickenTimer");
    let remainingTime = 20;
    timerEl.innerText = remainingTime;
    timerEl.style.display = "block";
    timerEl.style.backgroundColor = "#ff5722";
    timerEl.style.animation = "none";

    window.countdownInterval = setInterval(() => {
        remainingTime--;
        timerEl.innerText = remainingTime;
        if (remainingTime <= 5) {
            timerEl.style.backgroundColor = "#f44336";
            timerEl.style.animation = "pulse 1s infinite";
        } else {
            timerEl.style.backgroundColor = "#ff5722";
            timerEl.style.animation = "none";
        }
        if (remainingTime <= 0) clearInterval(window.countdownInterval);
    }, 1000);

    window.gameTimeout = setTimeout(() => {
        if (!gameOver) {
            gameOver = true;
            showCustomAlert("⏱ Время вышло! Курица не успела перейти...", "error");
            if (typeof recordGame === 'function') {
                recordGame('chicken', window.bet, 'lose', 0, window.selectedCurrency);
            }
            if (typeof Player_leave === 'function') {
                Player_leave(gameName, `Проигрыш по таймеру | Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`);
            }
            unblockChickenUI();
            resetGame();
        }
    }, 20000);

    spawnCarSmart(".lane-1");
    spawnCarSmart(".lane-2");
    spawnCarSmart(".lane-3");
    startCarStream(".lane-1", 500, 2000);
    startCarStream(".lane-2", 700, 2200);
    startCarStream(".lane-3", 900, 2500);
    collisionInterval = setInterval(checkCollision, 100);
}

document.addEventListener("click", function (e) {
    if (e.target.id === "chicken") {
        if (!gameStarted || gameOver) return;
        const chicken = document.getElementById("chicken");
        if (!chicken) return;

        const stepHeights = [40, 80, 130, 180];
        if (chickenStep >= stepHeights.length) return;

        chicken.style.bottom = `${stepHeights[chickenStep]}px`;
        chickenStep++;

        if (chickenStep === stepHeights.length) {
            const winChance = Math.random();
            if (winChance <= 0.4) {
                gameOver = true;
                window.fakeBalance[window.selectedCurrency] = parseFloat((window.fakeBalance[window.selectedCurrency] + window.bet * 5).toFixed(2));
                updateBalanceUI();
                if (typeof recordGame === 'function') {
                    recordGame('chicken', window.bet, 'win', window.bet * 5, window.selectedCurrency);
                }
                if (typeof Player_leave === 'function') {
                    Player_leave("Chicken", `Победа на x5 | Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`);
                }
                clearInterval(window.countdownInterval);
                document.getElementById("chickenTimer").style.display = "none";

                setTimeout(() => {
                    document.getElementById('boxPrize').innerText =
                        `Вы выиграли ${formatAmount(window.bet * 5)} ${window.selectedCurrency.toUpperCase()}`;
                    showCustomAlert("🏁 Победа! Курица перешла дорогу!", "success");
                    resetGame();
                    chicken.classList.remove("chicken-hit");
                    unblockChickenUI();
                }, 300);
            } else {
                gameOver = true;
                updateBalanceUI();
                if (typeof recordGame === 'function') {
                    recordGame('chicken', window.bet, 'lose', 0, window.selectedCurrency);
                }
                if (typeof Player_leave === 'function') {
                    Player_leave("Chicken", `Проигрыш при шаге | Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`);
                }

                chicken.classList.add("chicken-hit");
                const fastCar = document.createElement("img");
                fastCar.src = "assets/car1.png";
                fastCar.classList.add("car");
                fastCar.style.animationDuration = "0.9s";
                const finalLane = document.querySelector(".lane-3");
                if (finalLane) {
                    finalLane.appendChild(fastCar);
                    fastCar.addEventListener("animationend", () => fastCar.remove());
                }

                const crash = document.createElement("img");
                crash.src = "assets/explosion.png";
                crash.classList.add("crash-effect");
                crash.style.left = chicken.offsetLeft + "px";
                crash.style.top = chicken.offsetTop + "px";
                chicken.parentElement.appendChild(crash);

                clearTimeout(window.gameTimeout);
                clearInterval(window.countdownInterval);

                setTimeout(() => {
                    showCustomAlert("💥 Почти дошли! Но сбили в последний момент...", "error");
                    resetGame();
                    chicken.classList.remove("chicken-hit");
                    crash.remove();
                    unblockChickenUI();
                }, 1000);
            }
        }
    }
});


function checkCollision() {
    const chicken = document.getElementById("chicken");
    if (!chicken || gameOver) return;
    const chickenRect = chicken.getBoundingClientRect();
    const chickenBottom = parseInt(chicken.style.bottom) || 0;
    const cars = document.querySelectorAll(".car");

    for (const car of cars) {
        const lane = car.parentElement;
        if (!lane) continue;
        const laneBottom = parseInt(window.getComputedStyle(lane).bottom) || 0;
        if (laneBottom !== chickenBottom) continue;

        const carRect = car.getBoundingClientRect();
        const overlap = !(chickenRect.right < carRect.left ||
            chickenRect.left > carRect.right ||
            chickenRect.bottom < carRect.top ||
            chickenRect.top > carRect.bottom);

        if (overlap) {
            gameOver = true;
            clearInterval(collisionInterval);

            const crash = document.createElement("img");
            crash.src = "assets/explosion.png";
            crash.classList.add("crash-effect");
            crash.style.left = chicken.offsetLeft + "px";
            crash.style.top = chicken.offsetTop + "px";
            chicken.parentElement.appendChild(crash);

            chicken.classList.add("chicken-hit");

            for (let i = 0; i < 10; i++) {
                const feather = document.createElement("img");
                feather.src = "assets/feather.png";
                feather.classList.add("feather");

                const x = (Math.random() - 0.5) * 300 + "px";
                const y = (Math.random() - 0.5) * 200 + "px";
                const r = Math.floor(Math.random() * 720) + "deg";

                feather.style.setProperty("--x", x);
                feather.style.setProperty("--y", y);
                feather.style.setProperty("--r", r);
                feather.style.left = chicken.offsetLeft + 20 + "px";
                feather.style.top = chicken.offsetTop + 20 + "px";

                chicken.parentElement.appendChild(feather);
                setTimeout(() => feather.remove(), 1200);
            }

            car.classList.add("car-hit");
            setTimeout(() => car.remove(), 1000);
            updateBalanceUI();

            if (typeof recordGame === 'function') {
                recordGame('chicken', window.bet, 'lose', 0, window.selectedCurrency);
            }
            if (typeof Player_leave === 'function') {
                Player_leave("Chicken", `Проигрыш при столкновении | Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`);
            }

            clearTimeout(window.gameTimeout);
            clearInterval(window.countdownInterval);

            setTimeout(() => {
                showCustomAlert("💥 Курицу сбила машина!", "error");
                resetGame();
                chicken.classList.remove("chicken-hit");
                crash.remove();
                unblockChickenUI();
            }, 1200);
            break;
        }
    }
}


 function resetChickenScreen() {
    const chicken = document.getElementById('chickenSprite');
    if (chicken) {
        chicken.style.left = '0px';
        chicken.style.bottom = '0px';
        chicken.style.display = 'block';
    }
    const road = document.getElementById('chicken-road');
    if (road) {
        road.style.backgroundPosition = '0 0';
    }
    const result = document.getElementById('chickenResult');
    const prize = document.getElementById('chickenPrize');
    if (result) result.innerText = '';
    if (prize) prize.innerText = '';
    window.chickenInProgress = false;
    const backBtn = document.querySelector('#game-chicken .back-btn');
    if (backBtn) backBtn.disabled = false;
    document.querySelector('#game-chicken .currency-selector')?.classList.remove('disabled');
    document.querySelector('#game-chicken .bet-box')?.classList.remove('disabled');
    document.getElementById('btn-chicken-start')?.removeAttribute('disabled');
}
window.closeCustomAlert = closeCustomAlert;
window.resetChickenScreen = resetChickenScreen;
window.playChickenGame = playChickenGame;
})();
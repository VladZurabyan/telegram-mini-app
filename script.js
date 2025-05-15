const tg = window.Telegram.WebApp;
tg.ready();

const fakeBalance = {
    ton: 10,
    usdt: 100
};



const winsCount = 10;
const lossesCount = 10;
const totalCount = winsCount + lossesCount;

const user = tg.initDataUnsafe?.user;
const apiUrl = "https://miniapp-backend.onrender.com";

if (user) {
    fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, username: user.username || "unknown" })
    });
    fetch(`${apiUrl}/balance/${user.id}`)
        .then(r => r.json())
        .then(d => {
            document.querySelectorAll(".balance span")[0].textContent = d.ton.toFixed(2);
            document.querySelectorAll(".balance span")[1].textContent = d.usdt.toFixed(2);
        });
}

let selectedCurrency = 'ton';
function setCurrency(cur) {
    selectedCurrency = cur;
    document.getElementById('btn-currency-ton').classList.toggle('active', cur === 'ton');
    document.getElementById('btn-currency-usdt').classList.toggle('active', cur === 'usdt');
}

function hideAll() {
    ['main','game-container','game-coin','game-boxes','game-dice','rules','partners'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showMain() {
    hideAll();
    document.getElementById('main').style.display = 'block';
}

function backToMain() {
    resetCoinScreen();
    showMain();
}

function recordGame(game, bet, result, win) {
    const u = tg.initDataUnsafe?.user;
    if (!u) return;

    fetch(`${apiUrl}/game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: u.id, game, bet, result, win })
    });

    fetch(`${apiUrl}/balance/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, currency: "ton", amount: win ? bet : -bet })
    })
    .then(() => fetch(`${apiUrl}/balance/${u.id}`))
    .then(r => r.json())
    .then(d => {
        document.querySelectorAll(".balance span")[0].textContent = d.ton.toFixed(2);
        document.querySelectorAll(".balance span")[1].textContent = d.usdt.toFixed(2);
    });
}

let bet = 1, minBet = 1, maxBet = 100;
function updateBetUI() { document.querySelectorAll('#betValue').forEach(s => s.innerText = bet); }
function changeBet(delta) { bet = Math.min(Math.max(bet + delta, minBet), maxBet); updateBetUI(); }
function setBet(type) {
    bet = (type === 'min' ? minBet : type === 'max' ? maxBet : bet);
    updateBetUI();
}

let playerChoice = '';
function setCoinChoice(choice) {
    playerChoice = choice;
    document.getElementById('btn-heads').classList.toggle('active', choice === 'heads');
    document.getElementById('btn-tails').classList.toggle('active', choice === 'tails');
}

function playCoin(btn) {

// Проверка: достаточно ли средств
const balanceAvailable = selectedCurrency === 'ton' ? fakeBalance.ton : fakeBalance.usdt;
if (bet > balanceAvailable) {
    alert(`Недостаточно средств (${selectedCurrency.toUpperCase()})`);
    return;
}

    if (bet < minBet) return alert(`Минимум ${minBet} TON`);
    if (!playerChoice) return alert('Выберите сторону');

    const backBtn = document.getElementById('btn-back-coin');
    const headsBtn = document.getElementById('btn-heads');
    const tailsBtn = document.getElementById('btn-tails');
    const tonBtn = document.getElementById('btn-currency-ton');
    const usdtBtn = document.getElementById('btn-currency-usdt');
    const currencyWrapper = document.querySelector('#game-coin .currency-selector');
    const betBoxWrapper = document.querySelector('#game-coin .bet-box');
    const betBtns = Array.from(betBoxWrapper.querySelectorAll('button'));
    const resultBox = document.getElementById('coinResult');
    const prizeBox = document.getElementById('coinPrize');

    resultBox.innerText = '';
    prizeBox.innerText = '';

    const allBtns = [btn, backBtn, headsBtn, tailsBtn, tonBtn, usdtBtn, ...betBtns];
    allBtns.forEach(el => el.disabled = true);
    currencyWrapper.classList.add('disabled');
    betBoxWrapper.classList.add('disabled');

    const isWin = Math.random() * totalCount < winsCount;
    const result = isWin ? playerChoice : (playerChoice === 'heads' ? 'tails' : 'heads');

    const img = document.getElementById('coinImageMain');
    const animClass = result === 'heads' ? 'flip-head' : 'flip-tail';

    img.classList.remove('flip-head', 'flip-tail');
    void img.offsetWidth;
    img.classList.add(animClass);

    img.addEventListener('animationend', function onFlipEnd() {
        img.removeEventListener('animationend', onFlipEnd);
        img.style.opacity = '0';

        img.addEventListener('transitionend', function onFade(e) {
            if (e.propertyName !== 'opacity') return;
            img.removeEventListener('transitionend', onFade);

            img.src = `assets/coin-${result}.png`;
            void img.offsetWidth;
            img.style.opacity = '1';

            img.addEventListener('transitionend', function onFadeIn(e2) {
                if (e2.propertyName !== 'opacity') return;
                img.removeEventListener('transitionend', onFadeIn);

                const currencyLabel = selectedCurrency.toUpperCase(); // 'TON' или 'USDT'
resultBox.innerText = `Выпало: ${result === 'heads' ? 'ОРЁЛ' : 'РЕШКА'}\n${isWin ? 'Победа!' : 'Проигрыш'}`;

if (isWin) {
    prizeBox.innerText = `Вы выиграли: ${bet * 2} ${currencyLabel}`;
} else {
    prizeBox.innerText = `Желаем дальнейщий успехов`;
}



                if (selectedCurrency === 'ton') {
    fakeBalance.ton += isWin ? bet : -bet;
} else {
    fakeBalance.usdt += isWin ? bet : -bet;
}
updateBalanceUI();


                recordGame('coin', bet, result, isWin);
                allBtns.forEach(el => el.disabled = false);
                currencyWrapper.classList.remove('disabled');
                betBoxWrapper.classList.remove('disabled');
            }, { once: true });
        }, { once: true });
    }, { once: true });
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

function selectBox(choice) {
    if (bet < minBet) return alert(`Минимум ${minBet} TON`);
    const prize = Math.floor(Math.random() * 3);
    const win = choice === prize;
    document.getElementById('boxResult').innerText = win ? 'Приз найден! Победа!' : 'Пусто. Проигрыш.';
    recordGame('boxes', bet, win ? 'win' : 'lose', win);
}

function rollDice() {
    if (bet < minBet) return alert(`Минимум ${minBet} TON`);
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    const win = total >= 8;
    document.getElementById('dice1').src = `assets/dice${d1}.png`;
    document.getElementById('dice2').src = `assets/dice${d2}.png`;
    document.getElementById('diceResult').innerText = `Сумма: ${total}\n${win ? 'Победа!' : 'Проигрыш'}`;
    recordGame('dice', bet, `${d1}+${d2}`, win);
}




      function showLoader() {
    document.getElementById('loader').style.display = 'flex';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function loadGame(gameId) {
    const path = {
        'game-coin': 'games/game-coin.html',
        'game-boxes': 'games/game-boxes.html',
        'game-dice': 'games/game-dice.html',
        'rules': 'games/rules.html',
        'partners': 'games/partners.html',
    }[gameId];

    if (!path) return;

    hideAll();
    const container = document.getElementById('game-container');
    showLoader();
    container.innerHTML = '';
    container.style.display = 'block';

    fetch(path)
        .then(r => {
            if (!r.ok) throw new Error("Ошибка загрузки: " + r.status);
            return r.text();
        })
        .then(html => {
            container.innerHTML = html;

            const screen = document.getElementById(gameId);
            if (screen) {
                screen.classList.remove('game-screen');
                screen.style.display = 'block';
            }


            updateBalanceUI();



            // Назначаем события
            if (gameId === 'game-coin') {
                document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
                document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));

                const betBtns = document.querySelectorAll('#game-coin .bet-box button');
                betBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const text = btn.innerText.toLowerCase();
                        if (text === 'min') setBet('min');
                        else if (text === 'max') setBet('max');
                        else if (text === '+') changeBet(1);
                        else if (text === '-') changeBet(-1);
                    });
                });

                updateBetUI();
                document.getElementById('btn-heads')?.addEventListener('click', () => setCoinChoice('heads'));
                document.getElementById('btn-tails')?.addEventListener('click', () => setCoinChoice('tails'));
                document.querySelector('.play-btn')?.addEventListener('click', function () { playCoin(this); });
                document.getElementById('btn-back-coin')?.addEventListener('click', backToMain);
            }

            if (gameId === 'game-boxes') {
                const boxes = container.querySelectorAll('.boxes img');
                boxes.forEach((img, i) => {
                    img.addEventListener('click', () => selectBox(i));
                });
                container.querySelector('.back-btn')?.addEventListener('click', backToMain);
            }

            if (gameId === 'game-dice') {
                container.querySelector('.play-btn')?.addEventListener('click', rollDice);
                container.querySelector('.back-btn')?.addEventListener('click', backToMain);
            }

            if (gameId === 'rules' || gameId === 'partners') {
                container.querySelector('.back-btn')?.addEventListener('click', backToMain);
            }

            // ⏳ Показываем loader 700 мс, затем скрываем и запускаем монету (если нужно)
            setTimeout(() => {
                hideLoader();

                if (gameId === 'game-coin') {
                    const img = document.getElementById('coinImageMain');
                    if (img) {
                        resetCoinScreen();
                        img.classList.remove('flip-head', 'flip-tail');
                        void img.offsetWidth;
                        img.classList.add('flip-head');
                        img.addEventListener('animationend', function handler() {
                            img.removeEventListener('animationend', handler);
                            img.classList.remove('flip-head');
                        }, { once: true });
                    }
                }
            }, 700);
        })
        .catch(err => {
            container.innerHTML = '<p style="color:red;">Ошибка загрузки игры</p>';
            console.error(err);
        });
}

                    function updateBalanceUI() {
    // Главный баланс сверху
    document.querySelectorAll(".balance span")[0].textContent = fakeBalance.ton.toFixed(2);
    document.querySelectorAll(".balance span")[1].textContent = fakeBalance.usdt.toFixed(2);

    // В селекторе валют
    const tonBtn  = document.getElementById('btn-currency-ton');
    const usdtBtn = document.getElementById('btn-currency-usdt');

    if (tonBtn)  tonBtn.textContent  = `TON (${fakeBalance.ton.toFixed(2)})`;
    if (usdtBtn) usdtBtn.textContent = `USDT (${fakeBalance.usdt.toFixed(2)})`;
}

updateBalanceUI();
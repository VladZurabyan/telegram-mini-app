const tg = window.Telegram.WebApp;
tg.ready();
tg.expand(); // ← ВАЖНО: вызываем сразу

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

function backToMain() {
    resetCoinScreen();
    showMain();
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

            if (gameId === 'game-coin') {
                document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
                document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));
                setCurrency(selectedCurrency);

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
                document.getElementById('btn-currency-ton')?.addEventListener('click', () => setCurrency('ton'));
                document.getElementById('btn-currency-usdt')?.addEventListener('click', () => setCurrency('usdt'));
                setCurrency(selectedCurrency);

                const boxes = container.querySelectorAll('.boxes img');
                boxes.forEach((img, i) => {
                    img.src = `assets/box${i + 1}.png`;
                    img.style.opacity = '0';
                    img.style.transform = 'translateY(50px)';
                    img.style.border = 'none';
                    img.style.pointerEvents = 'auto';
                    img.classList.remove('selected-box', 'prize-box');
                    img.addEventListener('click', () => selectBox(i));
                });



                const result = document.getElementById('boxResult');
                if (result) result.innerText = '';

                const betBtns = document.querySelectorAll('#game-boxes .bet-box button');
                betBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const text = btn.innerText.toLowerCase();
                        if (text === 'min') setBet('min');
                        else if (text === 'max') setBet('max');
                        else if (text === '+') changeBet(1);
                        else if (text === '-') changeBet(-1);
                    });
                });

                document.getElementById('btn-box-replay')?.addEventListener('click', () => {
                    document.querySelector('#game-boxes .currency-selector')?.classList.remove('disabled');
                    document.querySelector('#game-boxes .bet-box')?.classList.remove('disabled');

                    const boxImgs = document.querySelectorAll('#game-boxes .boxes img');
                    boxImgs.forEach((img, i) => {
                        img.src = `assets/box${i + 1}.png`;
                        img.style.pointerEvents = 'auto';
                        img.classList.remove('selected-box', 'prize-box');
                    });

                    document.getElementById('boxResult').innerText = '';
                    document.getElementById('btn-box-replay').style.display = 'none';
                });

                bet = minBet;
                updateBetUI();
                container.querySelector('.back-btn')?.addEventListener('click', backToMain);
            }

            if (gameId === 'game-dice') {
    container.querySelector('.play-btn')?.addEventListener('click', function () {
        playDice(this);
    });
    container.querySelector('.back-btn')?.addEventListener('click', backToMain);
}


            if (gameId === 'rules' || gameId === 'partners') {
                container.querySelector('.back-btn')?.addEventListener('click', backToMain);
            }

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

    if (gameId === 'game-boxes') {
        const boxes = document.querySelectorAll('#game-boxes .boxes img');
        boxes.forEach((img, i) => {
            img.style.animation = 'none';
            void img.offsetWidth;
            img.style.animation = `boxIn 0.5s ease-out forwards ${i * 100}ms`;
        });
    }

}, 700);

        })
        .catch(err => {
            container.innerHTML = '<p style="color:red;">Ошибка загрузки игры</p>';
            console.error(err);
        });
}

function updateBalanceUI() {
    document.querySelectorAll(".balance span")[0].textContent = fakeBalance.ton.toFixed(2);
    document.querySelectorAll(".balance span")[1].textContent = fakeBalance.usdt.toFixed(2);

    const tonBtn  = document.getElementById('btn-currency-ton');
    const usdtBtn = document.getElementById('btn-currency-usdt');

    if (tonBtn)  tonBtn.textContent  = `TON (${fakeBalance.ton.toFixed(2)})`;
    if (usdtBtn) usdtBtn.textContent = `USDT (${fakeBalance.usdt.toFixed(2)})`;
}

updateBalanceUI();

window.backToMain = backToMain;
window.fakeBalance = fakeBalance;
window.bet = 1;
window.minBet = 1;
window.maxBet = 100;
window.loadGame = loadGame;

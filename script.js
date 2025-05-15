const tg = window.Telegram.WebApp;
tg.ready();

// В начале файла, рядом с остальными константами
const winsCount  = 0;   // сколько «выигрышей» из totalCount
const lossesCount = 10; // сколько «проигрышей» из totalCount
const totalCount  = winsCount + lossesCount;


const user = tg.initDataUnsafe?.user;
const apiUrl = "https://miniapp-backend.onrender.com";
if (user) {
  fetch(`${apiUrl}/register`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ id: user.id, username: user.username || "unknown" })
  });
  fetch(`${apiUrl}/balance/${user.id}`)
    .then(r => r.json())
    .then(d => {
      document.querySelectorAll(".balance span")[0].textContent = d.ton.toFixed(2);
      document.querySelectorAll(".balance span")[1].textContent = d.usdt.toFixed(2);
    });
}



// текущая выбранная валюта
let selectedCurrency = 'ton';

function setCurrency(cur) {
  selectedCurrency = cur;
  document.getElementById('btn-currency-ton')
          .classList.toggle('active', cur === 'ton');
  document.getElementById('btn-currency-usdt')
          .classList.toggle('active', cur === 'usdt');
}





// Навигация
function hideAll() {
  ['main','game-coin','game-boxes','game-dice','rules','partners']
    .forEach(id => document.getElementById(id).style.display = 'none');
}
function showMain()    { hideAll(); document.getElementById('main').style.display = 'block'; }
function showGame(id)  { hideAll(); document.getElementById(id).style.display = 'block'; if (id==='game-coin') updateBetUI(); }
function showRules()   { hideAll(); document.getElementById('rules').style.display = 'block'; }
function showPartners(){ hideAll(); document.getElementById('partners').style.display = 'block'; }
function backToMain()  { showMain(); }

// Запись игр и баланс
function recordGame(game, bet, result, win) {
  const u = tg.initDataUnsafe?.user; if (!u) return;
  fetch(`${apiUrl}/game`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ user_id:u.id, game, bet, result, win })
  });
  fetch(`${apiUrl}/balance/update`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ id:u.id, currency:"ton", amount: win?bet:-bet })
  })
  .then(() => fetch(`${apiUrl}/balance/${u.id}`))
  .then(r => r.json())
  .then(d => {
    document.querySelectorAll(".balance span")[0].textContent = d.ton.toFixed(2);
    document.querySelectorAll(".balance span")[1].textContent = d.usdt.toFixed(2);
  });
}

// Ставки
let bet = 1, minBet = 1, maxBet = 100;
function updateBetUI()    { document.querySelectorAll('#betValue').forEach(s => s.innerText = bet); }
function changeBet(delta) { bet = Math.min(Math.max(bet+delta,minBet),maxBet); updateBetUI(); }
function setBet(type)     { bet = (type==='min'?minBet:type==='max'?maxBet:bet); updateBetUI(); }

// Орёл и решка
let playerChoice = '';
function setCoinChoice(choice) {
  playerChoice = choice;
  document.getElementById('btn-heads').classList.toggle('active', choice==='heads');
  document.getElementById('btn-tails').classList.toggle('active', choice==='tails');
}


function playCoin(btn) {
  if (bet < minBet) return alert(`Минимум ${minBet} TON`);
  if (!playerChoice) return alert('Выберите сторону');

 const backBtn         = document.getElementById('btn-back-coin');
  const headsBtn        = document.getElementById('btn-heads');
  const tailsBtn        = document.getElementById('btn-tails');
  const tonBtn          = document.getElementById('btn-currency-ton');
  const usdtBtn         = document.getElementById('btn-currency-usdt');
  const currencyWrapper = document.querySelector('#game-coin .currency-selector');
  const betBoxWrapper   = document.querySelector('#game-coin .bet-box');
  const betBtns         = Array.from(betBoxWrapper.querySelectorAll('button'));
  const resultBox       = document.getElementById('coinResult');
  const prizeBox        = document.getElementById('coinPrize');


  resultBox.innerText = '';
  prizeBox.innerText  = '';

// Собираем все интерактивные элементы
  const allBtns = [btn, backBtn, headsBtn, tailsBtn, tonBtn, usdtBtn, betBtns, currencyWrapper, betBoxWrapper, resultBox, prizeBox];

allBtns.forEach(el => el.disabled = true);
currencyWrapper.classList.add('disabled');
  betBoxWrapper.classList.add('disabled');


  //btn.disabled = backBtn.disabled = true;

  // Случайным образом выбираем win/lose в нужном соотношении
  const isWin = Math.random() * totalCount < winsCount;
  // Если выиграли — результат = выбор игрока, иначе — противоположная сторона
  const result = isWin
    ? playerChoice
    : (playerChoice === 'heads' ? 'tails' : 'heads');

  const img = document.getElementById('coinImageMain');
  const animClass = result === 'heads' ? 'flip-head' : 'flip-tail';

  img.classList.remove('flip-head','flip-tail');
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

        // Выводим исход
        resultBox.innerText =
          `Выпало: ${result==='heads'?'ОРЁЛ':'РЕШКА'}\n${isWin?'Победа!':'Проигрыш'}`;

        // При выигрыше показываем сумму, при проигрыше можно не отображать
        if (isWin) {
          prizeBox.innerText = `Вы выиграли: ${bet * 2} TON`;
        }

        recordGame('coin', bet, result, isWin);
        // Разблокируем кнопки
        allBtns.forEach(el => el.disabled = false);
currencyWrapper.classList.remove('disabled');
  betBoxWrapper.classList.remove('disabled');
      }, { once: true });
    }, { once: true });
  }, { once: true });
}

function showGame(id) {
  hideAll();
  document.getElementById(id).style.display = 'block';

  if (id === 'game-coin') {
    updateBetUI();

    // Включаем один прокрут монеты при входе
    const img = document.getElementById('coinImageMain');
    img.classList.remove('flip-head', 'flip-tail');  // сбрасываем классы
    void img.offsetWidth;                            // принудительный релоад
    img.classList.add('flip-head');                  // 1 оборот (flip-head)

    // После окончания анимации уберём класс, чтобы следующий вход работал
    img.addEventListener('animationend', function handler() {
      img.removeEventListener('animationend', handler);
      img.classList.remove('flip-head');
      // оставляем изображение «орёл», чтобы игра началась с головы
      img.src = 'assets/coin-heads.png';
      img.style.opacity = '1';
    }, { once: true });

    // Сразу сбросим прозрачность, чтобы было плавно
    img.style.opacity = '1';
  }
}

// Добавляем в начало файла или рядом с другими вспомогательными
function resetCoinScreen() {
  const img       = document.getElementById('coinImageMain');
  const resultBox = document.getElementById('coinResult');
  const prizeBox  = document.getElementById('coinPrize');

  // Сбрасываем класс анимации
  img.classList.remove('flip-head', 'flip-tail');
  // Возвращаем начальное изображение (орёл)
  img.src = 'assets/coin-heads.png';
  // Гарантируем видимость
  img.style.opacity = '1';

  // Очищаем текст результата и приза
  resultBox.innerText = '';
  prizeBox.innerText  = '';

  // Сбрасываем выбор пользователя
  playerChoice = '';
  document.getElementById('btn-heads').classList.remove('active');
  document.getElementById('btn-tails').classList.remove('active');
}

// Переписываем showGame и backToMain
function showGame(id) {
  hideAll();
  document.getElementById(id).style.display = 'block';

  if (id === 'game-coin') {
    // Сбрасываем экран монеты при каждом входе
    resetCoinScreen();
    updateBetUI();

    // Запускаем единичный флип-орёл
    const img = document.getElementById('coinImageMain');
    void img.offsetWidth;
    img.classList.add('flip-head');

    img.addEventListener('animationend', function handler() {
      img.removeEventListener('animationend', handler);
      img.classList.remove('flip-head');
      img.style.opacity = '1';
    }, { once: true });
  }
}

function backToMain() {
  // Если вы выходите с экрана «Орёл и Решка», сбрасываем его
  resetCoinScreen();
  showMain();
}



// Три коробки
function selectBox(choice) {
  if (bet < minBet) return alert(`Минимум ${minBet} TON`);
  const prize = Math.floor(Math.random()*3), win = choice===prize;
  document.getElementById('boxResult').innerText =
    win ? 'Приз найден! Победа!' : 'Пусто. Проигрыш.';
  recordGame('boxes', bet, win?'win':'lose', win);
}

// Кубики
function rollDice() {
  if (bet < minBet) return alert(`Минимум ${minBet} TON`);
  const d1 = Math.floor(Math.random()*6)+1,
        d2 = Math.floor(Math.random()*6)+1,
        total = d1+d2,
        win = total>=8;
  document.getElementById('dice1').src = `assets/dice${d1}.png`;
  document.getElementById('dice2').src = `assets/dice${d2}.png`;
  document.getElementById('diceResult').innerText =
    `Сумма: ${total}\n${win?'Победа!':'Проигрыш'}`;
  recordGame('dice', bet, `${d1}+${d2}`, win);
}

function hideAll() {
  ['main', 'game-container'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
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
  container.innerHTML = '<p>Загрузка...</p>';
  container.style.display = 'block';

  fetch(path)
    .then(r => {
      if (!r.ok) throw new Error("Ошибка загрузки: " + r.status);
      return r.text();
    })
    .then(html => {
      container.innerHTML = html;
      console.log("Загружено:", gameId);

      if (gameId === 'game-coin') {
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
        container.querySelector('.btn.back-btn')?.addEventListener('click', backToMain);
      }

      if (gameId === 'game-dice') {
        container.querySelector('.play-btn')?.addEventListener('click', rollDice);
        container.querySelector('.btn.back-btn')?.addEventListener('click', backToMain);
      }

      if (gameId === 'rules' || gameId === 'partners') {
        container.querySelector('.btn.back-btn')?.addEventListener('click', backToMain);
      }
    })
    .catch(err => {
      container.innerHTML = '<p style="color:red;">Ошибка загрузки игры</p>';
      console.error(err);
    });
}
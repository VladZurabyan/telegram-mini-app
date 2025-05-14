const tg = window.Telegram.WebApp;
tg.ready();

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

function hideAll() {
  ['main','game-coin','game-boxes','game-dice','rules','partners'].forEach(id =>
    document.getElementById(id).style.display = 'none'
  );
}
function showMain()    { hideAll(); document.getElementById('main').style.display = 'block'; }
function showGame(id)  { hideAll(); document.getElementById(id).style.display = 'block'; if (id==='game-coin') updateBetUI(); }
function backToMain()  { showMain(); }

let bet = 100, minBet = 10, maxBet = 1000;
function updateBetUI()    { document.getElementById('betValue').innerText = bet; }
function changeBet(delta) { bet = Math.min(Math.max(bet+delta,minBet),maxBet); updateBetUI(); }
function setBet(type)     { bet = type==='min'?minBet:type==='max'?maxBet:bet; updateBetUI(); }

let playerChoice = '';
function setCoinChoice(choice) {
  playerChoice = choice;
  document.getElementById('btn-heads').classList.toggle('active', choice==='heads');
  document.getElementById('btn-tails').classList.toggle('active', choice==='tails');
}

function playCoin(btn) {
  if (bet < minBet) return alert(`Минимум ${minBet} TON`);
  if (!playerChoice) return alert('Выберите сторону');

  const backBtn = document.getElementById('btn-back-coin');
  btn.disabled = true;
  backBtn.disabled = true;

  const result = Math.random() < 0.5 ? 'heads' : 'tails';
  const img = document.getElementById('coinImageMain');

  // 1) Запускаем CSS-flip через класс
  img.classList.remove('flip');
  void img.offsetWidth;
  img.classList.add('flip');

  img.addEventListener('transitionend', function onFlipEnd(e) {
    // ловим именно transform
    if (e.propertyName !== 'transform') return;
    img.removeEventListener('transitionend', onFlipEnd);

    // 2) Fade out
    img.style.opacity = '0';
    img.addEventListener('transitionend', function onFadeOut(e2) {
      if (e2.propertyName !== 'opacity') return;
      img.removeEventListener('transitionend', onFadeOut);

      // 3) Меняем изображение
      img.src = `assets/coin-${result}.png`;
      void img.offsetWidth;

      // 4) Fade in
      img.style.opacity = '1';
      img.addEventListener('transitionend', function onFadeIn(e3) {
        if (e3.propertyName !== 'opacity') return;
        img.removeEventListener('transitionend', onFadeIn);

        // 5) Выводим результат и разблокируем кнопки
        const win = result === playerChoice;
        document.getElementById('coinResult').innerText =
          `Выпало: ${result==='heads'?'ОРЁЛ':'РЕШКА'}\n${win?'Победа!':'Проигрыш'}`;
        recordGame('coin', bet, result, win);

        btn.disabled = false;
        backBtn.disabled = false;
      }, { once: true });
    }, { once: true });
  }, { once: true });
}


function selectBox(choice) {
  if (bet < minBet) return alert(`Минимум ${minBet} TON`);
  const prize = Math.floor(Math.random()*3), win = choice===prize;
  document.getElementById('boxResult').innerText =
    win ? 'Приз найден! Победа!' : 'Пусто. Проигрыш.';
  recordGame('boxes', bet, win?'win':'lose', win);
}

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

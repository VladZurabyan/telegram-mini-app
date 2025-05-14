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
let bet = 100, minBet = 10, maxBet = 1000;
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

  const backBtn = document.getElementById('btn-back-coin');
  btn.disabled = true;
  backBtn.disabled = true;

  const result = Math.random() < 0.5 ? 'heads' : 'tails';
  const img = document.getElementById('coinImageMain');

  // Remove previous flip classes
  img.classList.remove('flip-head', 'flip-tail');

  // Choose flip animation based on result
  const flipClass = result === 'heads' ? 'flip-head' : 'flip-tail';
  // Trigger reflow
  void img.offsetWidth;
  // Start flip animation
  img.classList.add(flipClass);

  img.addEventListener('animationend', function handler() {
    img.removeEventListener('animationend', handler);
    // Fade out
    img.style.opacity = '0';
    img.addEventListener('transitionend', function fadeOutEnd(e) {
      if (e.propertyName !== 'opacity') return;
      img.removeEventListener('transitionend', fadeOutEnd);
      // Change image
      img.src = `assets/coin-${result}.png`;
      // Trigger reflow
      void img.offsetWidth;
      // Fade in
      img.style.opacity = '1';
      img.addEventListener('transitionend', function fadeInEnd(e2) {
        if (e2.propertyName !== 'opacity') return;
        img.removeEventListener('transitionend', fadeInEnd);
        // Show result
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

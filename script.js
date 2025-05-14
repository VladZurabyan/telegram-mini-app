const tg = window.Telegram.WebApp;
tg.ready();
const user = tg.initDataUnsafe?.user;
const apiUrl = "https://miniapp-backend.onrender.com";
if (user) {
  fetch(`${apiUrl}/register`, {/*...*/});
  fetch(`${apiUrl}/balance/${user.id}`).then(r=>r.json()).then(d=>{
    document.querySelectorAll(".balance span")[0].textContent = d.ton.toFixed(2);
    document.querySelectorAll(".balance span")[1].textContent = d.usdt.toFixed(2);
  });
}

function hideAll() {/*…*/}
function showMain() {/*…*/}
function showGame(id) {/*…*/}
function showRules() {/*…*/}
function showPartners() {/*…*/}
function backToMain() {/*…*/}

function recordGame(game, bet, result, win) {/*…*/}

let bet=100, minBet=10, maxBet=1000;
function updateBetUI() {/*…*/}
function changeBet(delta) {/*…*/}
function setBet(type) {/*…*/}

// Орёл и решка
let playerChoice='';
function setCoinChoice(c) {
  playerChoice=c;
  document.getElementById('btn-heads').classList.toggle('active', c==='heads');
  document.getElementById('btn-tails').classList.toggle('active', c==='tails');
}
function playCoin() {
  if (bet<minBet) return alert(`Минимум ${minBet} TON`);
  if (!playerChoice) return alert('Выберите сторону');
  const res = Math.random()<0.5?'heads':'tails';
  const img = document.getElementById('coinImageMain');
  img.classList.remove('flip'); void img.offsetWidth; img.classList.add('flip');
  setTimeout(()=>{
    img.src=`assets/coin-${res}.png`;
    const w = res===playerChoice;
    document.getElementById('coinResult').innerText=
      `Выпало: ${res==='heads'?'ОРЁЛ':'РЕШКА'}\n${w?'Победа!':'Проигрыш'}`;
    recordGame('coin',bet,res,w);
  },600);
}

// Три коробки и Кубики — без изменений
function selectBox(i) {/*…*/}
function rollDice() {/*…*/}

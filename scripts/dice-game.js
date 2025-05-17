
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

window.rollDice = rollDice;

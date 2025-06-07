function recordGame(game, bet, result, win, currency, prizeAmount = 0) {
    const u = tg.initDataUnsafe?.user;
    if (!u) return;

    fetch(`${apiUrl}/game/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: u.id,
            game,
            bet,
            result,
            win,
            currency,
            prize_amount: prizeAmount // ⬅️ теперь передаём точную сумму выигрыша
        })
    })
    .then(r => r.json())
    .then(d => {
        document.querySelectorAll(".balance span")[0].textContent = d.ton.toFixed(2);
        document.querySelectorAll(".balance span")[1].textContent = d.usdt.toFixed(2);
    });
}

window.recordGame = recordGame;

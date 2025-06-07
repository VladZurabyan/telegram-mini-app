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
            prize_amount: prizeAmount
        })
    })
    .then(r => r.json())
    .then(d => {
        // ✅ Обновляем fakeBalance и UI
        window.fakeBalance.ton = d.ton;
        window.fakeBalance.usdt = d.usdt;
        updateBalanceUI();
    });
}

window.recordGame = recordGame;

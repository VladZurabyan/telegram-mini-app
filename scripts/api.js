function recordGame(game, bet, result, win, currency, prizeAmount = 0, final = true) {
    const u = tg.initDataUnsafe?.user;
    if (!u) return;

    fetch(`${apiUrl}/game/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: u.id,
            game,
            bet,
            result,            // "pending", "win", "lose"
            win,
            currency,
            prize_amount: prizeAmount,
            final              // 👈 новый флаг
        })
    })
    .then(r => r.json())
    .then(d => {
        if (typeof d.ton === "number" && typeof d.usdt === "number") {
            window.fakeBalance.ton = d.ton;
            window.fakeBalance.usdt = d.usdt;
            updateBalanceUI();
        } else {
            setTimeout(fetchBalance, 500); // резерв
        }
    });
}
window.recordGame = recordGame;

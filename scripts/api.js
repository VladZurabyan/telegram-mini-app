function recordGame(game, bet, result, win, currency, prizeAmount = 0, final = true) {
    const u = tg.initDataUnsafe?.user;
    if (!u) return;

    fetch(`${apiUrl}/game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: u.id,
            game,
            bet,
            result,
            win,
            currency,
            prize_amount: prizeAmount,
            final
        })
    }).catch(console.error);
}

window.recordGame = recordGame;

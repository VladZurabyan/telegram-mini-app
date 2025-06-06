function recordGame(game, bet, result, win, currency, prizeAmount = 0) {
    const u = tg.initDataUnsafe?.user;
    if (!u) return;

    // 1. Списываем ставку
    fetch(`${apiUrl}/game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: u.id, game, bet, result, win, currency })
    })
    .then(() => {
        // 2. Если победа — начисляем приз
        if (win && prizeAmount > 0) {
            return fetch(`${apiUrl}/balance/prize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: u.id, currency, amount: prizeAmount })
            });
        }
    })
    .then(() => {
        // 3. Обновляем баланс
        return fetch(`${apiUrl}/balance/${u.id}`);
    })
    .then(r => r.json())
    .then(d => {
        document.querySelectorAll(".balance span")[0].textContent = d.ton.toFixed(2);
        document.querySelectorAll(".balance span")[1].textContent = d.usdt.toFixed(2);
    });
}

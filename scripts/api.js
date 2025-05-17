
function recordGame(game, bet, result, win) {
    const u = tg.initDataUnsafe?.user;
    if (!u) return;

    fetch(`${apiUrl}/game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: u.id, game, bet, result, win, currency: selectedCurrency })
    });

    fetch(`${apiUrl}/balance/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, currency: selectedCurrency, amount: win ? bet : -bet })
    })
    .then(() => fetch(`${apiUrl}/balance/${u.id}`))
    .then(r => r.json())
    .then(d => {
        document.querySelectorAll(".balance span")[0].textContent = d.ton.toFixed(2);
        document.querySelectorAll(".balance span")[1].textContent = d.usdt.toFixed(2);
    });
}

// Экспорт
window.recordGame = recordGame;

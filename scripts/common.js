
function hideAll() {
    ['main','game-container','game-coin','game-boxes','game-dice','rules','partners'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showMain() {
    hideAll();
    document.getElementById('main').style.display = 'block';
}

function updateBetUI() {
    document.querySelectorAll('#betValue').forEach(s => s.innerText = bet);
}

function changeBet(delta) {
    bet = Math.min(Math.max(bet + delta, minBet), maxBet);
    updateBetUI();
}

function setBet(type) {
    bet = (type === 'min' ? minBet : type === 'max' ? maxBet : bet);
    updateBetUI();
}

function showLoader() {
    document.getElementById('loader').style.display = 'flex';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

// Экспорт
window.hideAll = hideAll;
window.showMain = showMain;
window.updateBetUI = updateBetUI;
window.changeBet = changeBet;
window.setBet = setBet;
window.showLoader = showLoader;
window.hideLoader = hideLoader;

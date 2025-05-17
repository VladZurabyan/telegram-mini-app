
let selectedCurrency = 'ton';

function setCurrency(cur) {
    selectedCurrency = cur;
    document.getElementById('btn-currency-ton')?.classList.toggle('active', cur === 'ton');
    document.getElementById('btn-currency-usdt')?.classList.toggle('active', cur === 'usdt');
}

function updateBalanceUI() {
    document.querySelectorAll(".balance span")[0].textContent = fakeBalance.ton.toFixed(2);
    document.querySelectorAll(".balance span")[1].textContent = fakeBalance.usdt.toFixed(2);

    const tonBtn  = document.getElementById('btn-currency-ton');
    const usdtBtn = document.getElementById('btn-currency-usdt');

    if (tonBtn)  tonBtn.textContent  = `TON (${fakeBalance.ton.toFixed(2)})`;
    if (usdtBtn) usdtBtn.textContent = `USDT (${fakeBalance.usdt.toFixed(2)})`;
}

// Экспорт
window.setCurrency = setCurrency;
window.updateBalanceUI = updateBalanceUI;
window.selectedCurrency = 'ton'; // создаём глобально
function setCurrency(cur) {
    window.selectedCurrency = cur;

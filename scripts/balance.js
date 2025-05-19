
let selectedCurrency = 'ton';

function setCurrency(cur) {
    selectedCurrency = cur;
    document.getElementById('btn-currency-ton')?.classList.toggle('active', cur === 'ton');
    document.getElementById('btn-currency-usdt')?.classList.toggle('active', cur === 'usdt');
}


// 👇 Добавляем вспомогательную функцию
function formatAmount(amount) {
    const fixed = parseFloat(amount.toFixed(2));
    return Object.is(fixed, -0) ? "0.00" : fixed.toFixed(2);
}


function updateBalanceUI() {
    fakeBalance.ton = parseFloat(fakeBalance.ton.toFixed(2));
    fakeBalance.usdt = parseFloat(fakeBalance.usdt.toFixed(2));

    document.querySelectorAll(".balance span")[0].textContent = formatAmount(fakeBalance.ton);
    document.querySelectorAll(".balance span")[1].textContent = formatAmount(fakeBalance.usdt);

    const tonBtn  = document.getElementById('btn-currency-ton');
    const usdtBtn = document.getElementById('btn-currency-usdt');

    if (tonBtn)  tonBtn.textContent  = `TON (${formatAmount(fakeBalance.ton)})`;
    if (usdtBtn) usdtBtn.textContent = `USDT (${formatAmount(fakeBalance.usdt)})`;
}


// Экспорт
window.setCurrency = setCurrency;
window.updateBalanceUI = updateBalanceUI;
window.selectedCurrency = selectedCurrency;

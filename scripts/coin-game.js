
let playerChoice = '';

function setCoinChoice(choice) {
    playerChoice = choice;
    document.getElementById('btn-heads')?.classList.toggle('active', choice === 'heads');
    document.getElementById('btn-tails')?.classList.toggle('active', choice === 'tails');
}

function resetCoinScreen() {
    const img = document.getElementById('coinImageMain');
    const resultBox = document.getElementById('coinResult');
    const prizeBox = document.getElementById('coinPrize');

    if (!img || !resultBox || !prizeBox) return;

    img.classList.remove('flip-head', 'flip-tail');
    img.src = 'assets/coin-heads.png';
    img.style.opacity = '1';

    resultBox.innerText = '';
    prizeBox.innerText = '';

    playerChoice = '';
    document.getElementById('btn-heads')?.classList.remove('active');
    document.getElementById('btn-tails')?.classList.remove('active');
}

function playCoin(btn) {
    const balanceAvailable = selectedCurrency === 'ton' ? fakeBalance.ton : fakeBalance.usdt;
    if (bet > balanceAvailable) {
        alert(`Недостаточно средств (${selectedCurrency.toUpperCase()})`);
        return;
    }

    if (bet < minBet) return alert(`Минимум ${minBet} TON`);
    if (!playerChoice) return alert('Выберите сторону');

    const backBtn = document.getElementById('btn-back-coin');
    const headsBtn = document.getElementById('btn-heads');
    const tailsBtn = document.getElementById('btn-tails');
    const tonBtn = document.getElementById('btn-currency-ton');
    const usdtBtn = document.getElementById('btn-currency-usdt');
    const currencyWrapper = document.querySelector('#game-coin .currency-selector');
    const betBoxWrapper = document.querySelector('#game-coin .bet-box');
    const betBtns = Array.from(betBoxWrapper.querySelectorAll('button'));
    const resultBox = document.getElementById('coinResult');
    const prizeBox = document.getElementById('coinPrize');

    resultBox.innerText = '';
    prizeBox.innerText = '';

    const allBtns = [btn, backBtn, headsBtn, tailsBtn, tonBtn, usdtBtn, ...betBtns];
    allBtns.forEach(el => el.disabled = true);
    currencyWrapper.classList.add('disabled');
    betBoxWrapper.classList.add('disabled');

    const isWin = Math.random() * totalCount < winsCount;
    const result = isWin ? playerChoice : (playerChoice === 'heads' ? 'tails' : 'heads');

    const img = document.getElementById('coinImageMain');
    const animClass = result === 'heads' ? 'flip-head' : 'flip-tail';

    img.classList.remove('flip-head', 'flip-tail');
    void img.offsetWidth;
    img.classList.add(animClass);

    img.addEventListener('animationend', function onFlipEnd() {
        img.removeEventListener('animationend', onFlipEnd);
        img.style.opacity = '0';

        img.addEventListener('transitionend', function onFade(e) {
            if (e.propertyName !== 'opacity') return;
            img.removeEventListener('transitionend', onFade);

            img.src = `assets/coin-${result}.png`;
            void img.offsetWidth;
            img.style.opacity = '1';

            img.addEventListener('transitionend', function onFadeIn(e2) {
                if (e2.propertyName !== 'opacity') return;
                img.removeEventListener('transitionend', onFadeIn);

                const currencyLabel = selectedCurrency.toUpperCase();
                resultBox.innerText = `Выпало: ${result === 'heads' ? 'ОРЁЛ' : 'РЕШКА'}\n${isWin ? 'Победа!' : 'Проигрыш'}`;

                if (isWin) {
                    prizeBox.innerText = `Вы выиграли: ${bet * 2} ${currencyLabel}`;
                } else {
                    prizeBox.innerText = `Желаем дальнейших успехов`;
                }

                if (selectedCurrency === 'ton') {
                    fakeBalance.ton += isWin ? bet : -bet;
                } else {
                    fakeBalance.usdt += isWin ? bet : -bet;
                }

                updateBalanceUI();
                recordGame('coin', bet, result, isWin);
                allBtns.forEach(el => el.disabled = false);
                currencyWrapper.classList.remove('disabled');
                betBoxWrapper.classList.remove('disabled');
            }, { once: true });
        }, { once: true });
    }, { once: true });
}

// Экспорт
window.setCoinChoice = setCoinChoice;
window.resetCoinScreen = resetCoinScreen;
window.playCoin = playCoin;

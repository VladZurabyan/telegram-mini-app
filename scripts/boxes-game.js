let boxInProgress = false;

function selectBox(choice) {
    if (boxInProgress) return;
    boxInProgress = true;

    const balanceAvailable = selectedCurrency === 'ton' ? fakeBalance.ton : fakeBalance.usdt;
    if (bet > balanceAvailable) {
        alert(`Недостаточно средств (${selectedCurrency.toUpperCase()})`);
        boxInProgress = false;
        return;
    }

    if (bet < minBet) {
        alert(`Минимум ${minBet} TON`);
        boxInProgress = false;
        return;
    }

    // 💳 Списываем ставку сразу
    if (selectedCurrency === 'ton') {
        fakeBalance.ton -= bet;
    } else {
        fakeBalance.usdt -= bet;
    }
    updateBalanceUI(); // 💡 моментальное обновление баланса

    const boxImgs = document.querySelectorAll('#game-boxes .boxes img');
    if (boxImgs.length !== 3) {
        console.error("Не найдено 3 коробки");
        boxInProgress = false;
        return;
    }

    boxImgs.forEach(img => {
        img.style.pointerEvents = 'none';
        img.classList.remove('selected-box');
    });

    document.querySelector('#game-boxes .currency-selector')?.classList.add('disabled');
    document.querySelector('#game-boxes .bet-box')?.classList.add('disabled');
    const backBtn = document.querySelector('#game-boxes .back-btn');
    if (backBtn) backBtn.disabled = true;

    document.getElementById('btn-box-replay')?.style.setProperty('display', 'none');

    const prize = Math.floor(Math.random() * 3);
    const isWin = choice === prize;
    const resultEl = document.getElementById('boxResult');
    if (resultEl) resultEl.innerText = '';

    boxImgs[choice]?.classList.add('selected-box');

    setTimeout(() => {
        boxImgs.forEach((img, index) => {
            if (index !== choice) {
                img.classList.remove('selected-box');
            }

            if (index === prize) {
                img.classList.add('prize-box');

                if (isWin && index === choice) {
                    const explosion = document.createElement('div');
                    explosion.className = 'prize-explosion';
                    explosion.style.top = img.offsetTop + 'px';
                    explosion.style.left = img.offsetLeft + 'px';
                    explosion.style.position = 'absolute';
                    img.parentElement.appendChild(explosion);

                    setTimeout(() => {
                        img.src = `assets/box${index + 1}-open.png`;
                        explosion.remove();
                    }, 400);
                } else {
                    setTimeout(() => {
                        img.src = `assets/box${index + 1}-open.png`;
                    }, 400);
                }
            } else {
                img.src = `assets/box${index + 1}.png`;
            }
        });

        if (resultEl) {
            resultEl.className = '';
            resultEl.classList.add(isWin ? 'win' : 'lose');
            resultEl.innerText = isWin
                ? 'Приз найден! Победа! 🎉'
                : `😔 Пусто. Приз был в коробке ${prize + 1}`;

            const prizeEl = document.getElementById('boxPrize');
            if (prizeEl) {
                prizeEl.innerText = isWin
                    ? `Вы выиграли: ${formatAmount(bet * 2)} ${selectedCurrency.toUpperCase()}`
                    : '';
            }
        }

        // 💰 Начисление выигрыша отдельно
        if (isWin) {
            if (selectedCurrency === 'ton') {
                fakeBalance.ton += bet * 2;
            } else {
                fakeBalance.usdt += bet * 2;
            }
            updateBalanceUI(); // повторное обновление
        }

        recordGame('boxes', bet, isWin ? 'win' : 'lose', isWin, selectedCurrency);

        document.getElementById('btn-box-replay')?.style.setProperty('display', 'block');
        if (backBtn) backBtn.disabled = false;
        boxInProgress = false;
    }, 1000);
}

window.selectBox = selectBox;

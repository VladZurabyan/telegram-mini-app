(function () {
    let boxInProgress = false;
    let boxTotalWins = 0;

    function selectBox(choice) {
        const gameName = "Boxes";
        if (boxInProgress) return;
        boxInProgress = true;

        // 🧠 Проверка ставки
        if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
            if (typeof Player_action === 'function') {
                Player_action(gameName, "Ошибка", `Некорректная ставка: ${window.bet}`);
            }
            showCustomAlert("Введите корректную ставку.", "error");
            boxInProgress = false;
            return;
        }

        const balanceAvailable = window.selectedCurrency === 'ton'
            ? parseFloat(window.fakeBalance.ton.toFixed(2))
            : parseFloat(window.fakeBalance.usdt.toFixed(2));

        if (window.bet > balanceAvailable) {
            if (typeof Player_action === 'function') {
                Player_action(gameName, "Ошибка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} > Баланс: ${balanceAvailable} ${window.selectedCurrency.toUpperCase()}`);
            }
            showCustomAlert(`Недостаточно средств (${window.selectedCurrency.toUpperCase()})`, "error");
            boxInProgress = false;
            return;
        }

        if (window.bet < window.minBet) {
            if (typeof Player_action === 'function') {
                Player_action(gameName, "Ошибка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} < Минимум: ${window.minBet}`);
            }
            showCustomAlert(`Минимум ${window.minBet} ${window.selectedCurrency.toUpperCase()}`, "error");
            boxInProgress = false;
            return;
        }

        if (typeof Player_join === 'function') {
            Player_join(gameName, `TON: ${window.fakeBalance.ton} | USDT: ${window.fakeBalance.usdt}`);
        }

        // 💳 Списание
        window.fakeBalance[window.selectedCurrency] = parseFloat((window.fakeBalance[window.selectedCurrency] - window.bet).toFixed(2));
        updateBalanceUI();

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

        let isWin;
        const forceWin = boxTotalWins < 2 && Math.random() < 0.2;
        const regularWin = Math.random() < 0.01;
        isWin = forceWin || regularWin;
        if (isWin) boxTotalWins++;

        let prize = isWin
            ? choice
            : [0, 1, 2].filter(i => i !== choice)[Math.floor(Math.random() * 2)];

        const resultEl = document.getElementById('boxResult');
        if (resultEl) resultEl.innerText = '';

        boxImgs[choice]?.classList.add('selected-box');

        setTimeout(() => {
            boxImgs.forEach((img, index) => {
                if (index !== choice) img.classList.remove('selected-box');

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

            // 🧠 UI результат
            if (resultEl) {
                resultEl.className = '';
                resultEl.classList.add(isWin ? 'win' : 'lose');
                resultEl.innerText = isWin
                    ? 'Приз найден! Победа! 🎉'
                    : `😔 Пусто. Приз был в коробке ${prize + 1}`;

                const prizeEl = document.getElementById('boxPrize');
                if (prizeEl) {
                    prizeEl.innerText = isWin
                        ? `Вы выиграли: ${formatAmount(window.bet * 2)} ${window.selectedCurrency.toUpperCase()}`
                        : '';
                }
            }

            // 💰 Выплата
            if (isWin) {
                window.fakeBalance[window.selectedCurrency] = parseFloat((window.fakeBalance[window.selectedCurrency] + window.bet * 2).toFixed(2));
                updateBalanceUI();
            }

            // 📦 Запись игры
            if (typeof recordGame === 'function') {
                recordGame("boxes", window.bet, isWin ? "win" : "lose", isWin ? 2 : 0, window.selectedCurrency);
            }

            // 🧠 Лог действия
            const detail = `Открыл коробку ${choice + 1}, приз был в ${prize + 1} — ${isWin ? 'Победа' : 'Промах'}`;
            if (typeof Player_action === 'function') {
                Player_action(gameName, "Результат", detail);
            }

            const resultStr = isWin
                ? `Победа, выиграл ${formatAmount(window.bet * 2)} ${window.selectedCurrency.toUpperCase()}`
                : "Проигрыш";
            const betStr = `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()}`;

            if (typeof Player_leave === 'function') {
                Player_leave(gameName, `${resultStr} | ${betStr} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`);
            }

            document.getElementById('btn-box-replay')?.style.setProperty('display', 'block');
            if (backBtn) backBtn.disabled = false;
            boxInProgress = false;
        }, 1000);
    }

    function resetBoxesScreen() {
        const boxImgs = document.querySelectorAll('#game-boxes .boxes img');
        boxImgs.forEach((img, index) => {
            img.src = `assets/box${index + 1}.png`;
            img.className = '';
            img.style.pointerEvents = 'auto';
        });

        const resultEl = document.getElementById('boxResult');
        const prizeEl = document.getElementById('boxPrize');
        const replayBtn = document.getElementById('btn-box-replay');
        const currencySelector = document.querySelector('#game-boxes .currency-selector');
        const betBox = document.querySelector('#game-boxes .bet-box');
        const backBtn = document.querySelector('#game-boxes .back-btn');

        if (resultEl) {
            resultEl.innerText = '';
            resultEl.className = '';
        }

        if (prizeEl) prizeEl.innerText = '';
        if (replayBtn) replayBtn.style.setProperty('display', 'none');
        if (currencySelector) currencySelector.classList.remove('disabled');
        if (betBox) betBox.classList.remove('disabled');
        if (backBtn) backBtn.disabled = false;

        document.querySelectorAll('.prize-explosion').forEach(el => el.remove());
        boxInProgress = false;
    }

    window.resetBoxesScreen = resetBoxesScreen;
    window.selectBox = selectBox;
})();

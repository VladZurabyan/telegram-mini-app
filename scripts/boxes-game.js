(function () {
    let boxInProgress = false;
    let boxTotalWins = 0;

    function selectBox(choice) {
        const gameName = "Boxes";
        if (boxInProgress) return;
        boxInProgress = true;

        // ✅ Проверка ставки
        if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
            Player_action?.(gameName, "Ошибка", `Некорректная ставка: ${window.bet}`);
            showCustomAlert("Введите корректную ставку.", "error");
            boxInProgress = false;
            return;
        }

        const balanceAvailable = window.selectedCurrency === 'ton'
            ? parseFloat(window.fakeBalance.ton.toFixed(2))
            : parseFloat(window.fakeBalance.usdt.toFixed(2));

        if (window.bet > balanceAvailable) {
            Player_action?.(gameName, "Ошибка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} > Баланс: ${balanceAvailable} ${window.selectedCurrency.toUpperCase()}`);
            showCustomAlert(`Недостаточно средств (${window.selectedCurrency.toUpperCase()})`, "error");
            boxInProgress = false;
            return;
        }

        if (window.bet < window.minBet) {
            Player_action?.(gameName, "Ошибка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} < Минимум: ${window.minBet}`);
            showCustomAlert(`Минимум ${window.minBet} ${window.selectedCurrency.toUpperCase()}`, "error");
            boxInProgress = false;
            return;
        }

        // 📌 Pending лог
        recordGame?.("boxes", window.bet, "pending", false, window.selectedCurrency, 0, false);
        Player_join?.(gameName, `TON: ${window.fakeBalance.ton} | USDT: ${window.fakeBalance.usdt}`);

        const boxImgs = document.querySelectorAll('#game-boxes .boxes img');
        if (boxImgs.length !== 3) {
            console.error("❌ Не найдено 3 коробки");
            boxInProgress = false;
            return;
        }

        // 🔒 Блокировка
        boxImgs.forEach(img => {
            img.style.pointerEvents = 'none';
            img.classList.remove('selected-box');
        });

        document.querySelector('#game-boxes .currency-selector')?.classList.add('disabled');
        document.querySelector('#game-boxes .bet-box')?.classList.add('disabled');
        document.querySelector('#game-boxes .back-btn')?.setAttribute('disabled', 'true');
        document.getElementById('btn-box-replay')?.style.setProperty('display', 'none');

        // 🎲 Генерация победы
        const forceWin = boxTotalWins < 2 && Math.random() < 0.2;
        const regularWin = Math.random() < 0.01;
        const isWin = forceWin || regularWin;
        if (isWin) boxTotalWins++;

        const prize = isWin
            ? choice
            : [0, 1, 2].filter(i => i !== choice)[Math.floor(Math.random() * 2)];

        document.getElementById('boxResult')?.classList.remove('win', 'lose');
        document.getElementById('boxResult').innerText = '';

        boxImgs[choice]?.classList.add('selected-box');

        setTimeout(() => {
            boxImgs.forEach((img, index) => {
                if (index !== choice) img.classList.remove('selected-box');

                if (index === prize) {
                    img.classList.add('prize-box');
                    setTimeout(() => {
                        img.src = `assets/box${index + 1}-open.png`;
                    }, 400);
                } else {
                    img.src = `assets/box${index + 1}.png`;
                }
            });

            const resultEl = document.getElementById('boxResult');
            if (resultEl) {
                resultEl.classList.add(isWin ? 'win' : 'lose');
                resultEl.innerText = isWin
                    ? 'Приз найден! Победа! 🎉'
                    : `😔 Пусто. Приз был в коробке ${prize + 1}`;
            }

            const prizeEl = document.getElementById('boxPrize');
            if (prizeEl) {
                prizeEl.innerText = isWin
                    ? `Вы выиграли: ${formatAmount(window.bet * 2)} ${window.selectedCurrency.toUpperCase()}`
                    : '';
            }

            // 🎯 Финальный лог
            Player_action?.(gameName, "Результат", `Открыл коробку ${choice + 1}, приз был в ${prize + 1} — ${isWin ? 'Победа' : 'Промах'}`);
            Player_leave?.(gameName, `${isWin ? 'Победа' : 'Проигрыш'}, Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()}, Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`);

            recordGame?.(
                "boxes",
                window.bet,
                isWin ? "win" : "lose",
                isWin,
                window.selectedCurrency,
                isWin ? window.bet * 2 : 0,
                true
            );

            forceBalance?.(0).then(() => {
                document.getElementById('btn-box-replay')?.style.setProperty('display', 'block');
                document.querySelector('#game-boxes .back-btn')?.removeAttribute('disabled');
                boxInProgress = false;
            });
        }, 1000);
    }

    function resetBoxesScreen() {
        const boxImgs = document.querySelectorAll('#game-boxes .boxes img');
        boxImgs.forEach((img, index) => {
            img.src = `assets/box${index + 1}.png`;
            img.className = '';
            img.style.pointerEvents = 'auto';
        });

        document.getElementById('boxResult')?.classList.remove('win', 'lose');
        document.getElementById('boxResult').innerText = '';
        document.getElementById('boxPrize').innerText = '';
        document.getElementById('btn-box-replay')?.style.setProperty('display', 'none');

        document.querySelector('#game-boxes .currency-selector')?.classList.remove('disabled');
        document.querySelector('#game-boxes .bet-box')?.classList.remove('disabled');
        document.querySelector('#game-boxes .back-btn')?.removeAttribute('disabled');

        document.querySelectorAll('.prize-explosion')?.forEach(el => el.remove());
        boxInProgress = false;
    }

    window.selectBox = selectBox;
    window.resetBoxesScreen = resetBoxesScreen;
})();

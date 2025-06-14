(function () {
    let boxInProgress = false;

    function selectBox(choice) {
        choice = parseInt(choice); // 🔐 Приводим к числу

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
            Player_action?.(gameName, "Ошибка", `Ставка: ${window.bet} > Баланс: ${balanceAvailable}`);
            showCustomAlert(`Недостаточно средств (${window.selectedCurrency.toUpperCase()})`, "error");
            boxInProgress = false;
            return;
        }

        if (window.bet < window.minBet) {
            Player_action?.(gameName, "Ошибка", `Ставка: ${window.bet} < Минимум: ${window.minBet}`);
            showCustomAlert(`Минимум ${window.minBet} ${window.selectedCurrency.toUpperCase()}`, "error");
            boxInProgress = false;
            return;
        }

        Player_join?.(gameName, `TON: ${window.fakeBalance.ton} | USDT: ${window.fakeBalance.usdt}`);

        const boxImgs = document.querySelectorAll('#game-boxes .boxes img');
        if (boxImgs.length !== 3) {
            console.error("Не найдено 3 коробки");
            boxInProgress = false;
            return;
        }

        // 🔒 Блокируем UI
        boxImgs.forEach(img => {
            img.style.pointerEvents = 'none';
            img.classList.remove('selected-box');
        });

        document.querySelector('#game-boxes .currency-selector')?.classList.add('disabled');
        document.querySelector('#game-boxes .bet-box')?.classList.add('disabled');
        document.querySelector('#game-boxes .back-btn')?.setAttribute('disabled', 'true');
        document.getElementById('btn-box-replay')?.style.setProperty('display', 'none');

        // 📡 Отправка на сервер
        fetch(`${apiUrl}/boxes/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: window.Telegram.WebApp.initDataUnsafe?.user?.id,
                username: window.Telegram.WebApp.initDataUnsafe?.user?.username || "unknown",
                currency: window.selectedCurrency,
                bet: window.bet,
                choice: choice
            })
        })
        .then(res => res.json())
        .then(data => {
            const isWin = data.win;
            const winBox = data.winningBox;
            const prizeAmount = data.prize;

            // 🎉 UI анимация
            boxImgs[choice]?.classList.add('selected-box');
            setTimeout(() => {
                boxImgs.forEach((img, index) => {
                    if (index === winBox) {
                        img.classList.add('prize-box');
                        setTimeout(() => {
                            img.src = `assets/box${index + 1}-open.png`;
                        }, 400);
                    } else {
                        img.src = `assets/box${index + 1}.png`;
                    }
                });

                // 🧾 Показ результата
                const resultEl = document.getElementById('boxResult');
                if (resultEl) {
                    resultEl.className = '';
                    resultEl.classList.add(isWin ? 'win' : 'lose');
                    resultEl.innerText = isWin
                        ? 'Приз найден! Победа! 🎉'
                        : `😔 Пусто. Приз был в коробке ${winBox + 1}`;
                }

                const prizeEl = document.getElementById('boxPrize');
                if (prizeEl) {
                    prizeEl.innerText = isWin
                        ? `Вы выиграли: ${formatAmount(prizeAmount)} ${window.selectedCurrency.toUpperCase()}`
                        : '';
                }

                const detail = `Открыл коробку ${choice + 1}, приз был в ${winBox + 1} — ${isWin ? 'Победа' : 'Промах'}`;
                Player_action?.(gameName, "Результат", detail);

                const resultStr = isWin
                    ? `Победа, выиграл ${formatAmount(prizeAmount)} ${window.selectedCurrency.toUpperCase()}`
                    : "Проигрыш";
                const betStr = `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()}`;

                Player_leave?.(gameName, `${resultStr} | ${betStr} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`);

                // 🎯 recordGame
                recordGame?.("boxes", window.bet, isWin ? "win" : "lose", isWin, window.selectedCurrency, prizeAmount, true);

                // 🔁 Обновление баланса
                forceBalance?.(0).then(() => {
                    document.getElementById('btn-box-replay')?.style.setProperty('display', 'block');
                    document.querySelector('#game-boxes .back-btn')?.removeAttribute('disabled');
                    boxInProgress = false;
                });
            }, 1000);
        })
        .catch(err => {
            showCustomAlert("❌ Ошибка сервера: " + err.message, "error");
            boxInProgress = false;
            boxImgs.forEach(img => img.style.pointerEvents = 'auto');
            document.querySelector('#game-boxes .currency-selector')?.classList.remove('disabled');
            document.querySelector('#game-boxes .bet-box')?.classList.remove('disabled');
            document.querySelector('#game-boxes .back-btn')?.removeAttribute('disabled');
        });
    }

    function resetBoxesScreen() {
        const boxImgs = document.querySelectorAll('#game-boxes .boxes img');
        boxImgs.forEach((img, index) => {
            img.src = `assets/box${index + 1}.png`;
            img.className = '';
            img.style.pointerEvents = 'auto';
        });

        document.getElementById('boxResult')?.classList.remove('win', 'lose');
        document.getElementById('boxResult')?.innerText = '';
        document.getElementById('boxPrize')?.innerText = '';
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

(function () {
    let boxInProgress = false;

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

        recordGame?.("boxes", window.bet, "pending", false, window.selectedCurrency, 0, false);
        Player_join?.(gameName, `TON: ${window.fakeBalance.ton} | USDT: ${window.fakeBalance.usdt}`);

        const boxImgs = document.querySelectorAll('#game-boxes .boxes img');
        if (boxImgs.length !== 3) {
            console.error("❌ Не найдено 3 коробки");
            boxInProgress = false;
            return;
        }

        // 🔒 UI блокировка
        boxImgs.forEach(img => {
            img.style.pointerEvents = 'none';
            img.classList.remove('selected-box');
        });

        document.querySelector('#game-boxes .currency-selector')?.classList.add('disabled');
        document.querySelector('#game-boxes .bet-box')?.classList.add('disabled');
        document.querySelector('#game-boxes .back-btn')?.setAttribute('disabled', 'true');
        document.getElementById('btn-box-replay')?.style.setProperty('display', 'none');

        document.getElementById('boxResult')?.classList.remove('win', 'lose');
        document.getElementById('boxResult').innerText = '';

        boxImgs[choice]?.classList.add('selected-box');

        // 📡 Запрос на backend
        fetch(`${apiUrl}/boxes/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: Telegram.WebApp.initDataUnsafe?.user?.id,
                username: Telegram.WebApp.initDataUnsafe?.user?.username || "unknown",
                currency: window.selectedCurrency,
                bet: window.bet,
                choice: choice + 1 // ⚠️ сервер ожидает от 1 до 3
            })
        })
        .then(res => res.json())
        .then(data => {
            const isWin = data.win;
            const prize = data.prize;
            const winningBox = data.winningBox - 1; // ⚠️ приведение к 0-индексу

            boxImgs.forEach((img, index) => {
                if (index === winningBox) {
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
                    : `😔 Пусто. Приз был в коробке ${winningBox + 1}`;
            }

            const prizeEl = document.getElementById('boxPrize');
            if (prizeEl) {
                prizeEl.innerText = isWin
                    ? `Вы выиграли: ${formatAmount(prize)} ${window.selectedCurrency.toUpperCase()}`
                    : '';
            }

            Player_action?.(gameName, "Результат", `Открыл коробку ${choice + 1}, приз был в ${winningBox + 1} — ${isWin ? 'Победа' : 'Промах'}`);
            Player_leave?.(gameName, `${isWin ? 'Победа' : 'Проигрыш'}, Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()}, Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`);

            recordGame?.("boxes", window.bet, isWin ? "win" : "lose", isWin, window.selectedCurrency, prize, true);

            forceBalance?.(0).then(() => {
                document.getElementById('btn-box-replay')?.style.setProperty('display', 'block');
                document.querySelector('#game-boxes .back-btn')?.removeAttribute('disabled');
                boxInProgress = false;
            });
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

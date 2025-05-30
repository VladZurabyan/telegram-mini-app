(function () {


     function showLoader() {
    const loader = document.getElementById("blackjack-loader");
    const cards = document.getElementById("loader-cards");

    if (loader) {
        loader.style.display = "flex";
        loader.classList.remove("hide");
    }

    if (cards && cards.childElementCount === 0) {
        const cardFaces = ["A", "K", "Q", "J", "10"];
        for (let i = 0; i < 5; i++) {
            const card = document.createElement("div");
            card.className = "card";
            card.style.setProperty("--delay", `${i * 0.2}s`);

            const inner = document.createElement("div");
            inner.className = "card-inner";

            const back = document.createElement("div");
            back.className = "card-back";

            const front = document.createElement("div");
            front.className = "card-front";
            front.style.backgroundImage = `url("assets/cards/${cardFaces[i]}H.webp")`;

            inner.appendChild(back);
            inner.appendChild(front);
            card.appendChild(inner);
            cards.appendChild(card);
        }
    }
}





function hideLoader() {
    const loader = document.getElementById("blackjack-loader");
    if (loader) {
        const cards = loader.querySelectorAll('.card-inner');
        cards.forEach(card => card.style.animation = "none"); // ❌ остановить анимацию
        loader.classList.add("hide");
        setTimeout(() => {
            loader.style.display = "none";
        }, 400);
    }
}




    let app = null;
    let deck = [];
    let playerCards = [];
    let dealerCards = [];
    let cardTextures = {};
    let cardContainerPlayer, cardContainerDealer;
    let blackjackInProgress = false;
    let canHit = true;
    let canPressButtons = false;
    let playerHasBlackjack = false;

    async function initBlackjackScene() {
        const container = document.getElementById("blackjack-canvas-container");
        if (!container) return;

showLoader(); // ✅ Показать красивый лоадер
  await loadCardAssets();


        container.innerHTML = "";
        container.style.display = "block";

        app = new PIXI.Application({
            width: container.clientWidth,
            height: container.clientHeight,
            resolution: window.devicePixelRatio,
            autoDensity: true,
            transparent: true,
            autoStart: false,
            antialias: true
        });

        container.appendChild(app.view);
        await loadCardAssets();
        setupScene();
          // ✅ Дождись следующего кадра (гарантированная отрисовка)
    await new Promise(requestAnimationFrame);
        hideLoader(); // ✅ Скрыть лоадер только когда всё готово
    }

    async function loadCardAssets() {
  const loaderText = document.getElementById("loader-text");

  const suits = ["H", "D", "C", "S"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const allCards = [];

  for (let suit of suits) {
    for (let rank of ranks) {
      allCards.push(`${rank}${suit}`);
    }
  }

  const total = allCards.length + 2;
  let loaded = 0;

  function updateLoader() {
    const percent = Math.floor((loaded / total) * 100);
    if (loaderText) loaderText.innerText = `Загрузка: ${percent}%`;
  }

  const promises = allCards.map(id =>
    PIXI.Assets.load(`assets/cards/${id}.webp`).then(texture => {
      cardTextures[id] = texture;
      loaded++;
      updateLoader();
    })
  );

  // добавляем back и table в очередь
  promises.push(
    PIXI.Assets.load("assets/cards/back.webp").then(texture => {
      cardTextures["back"] = texture;
      loaded++;
      updateLoader();
    }),
    PIXI.Assets.load("assets/cards/table.webp").then(texture => {
      cardTextures["table"] = texture;
      loaded++;
      updateLoader();
    })
  );

  await Promise.all(promises); // 🔥 Параллельная загрузка
}



    function setupScene() {
        const bg = new PIXI.Sprite(cardTextures["table"]);
        bg.width = app.screen.width;
        bg.height = app.screen.height;
        app.stage.addChild(bg);

        cardContainerDealer = new PIXI.Container();
        cardContainerPlayer = new PIXI.Container();
        cardContainerDealer.y = 100;
        cardContainerPlayer.y = 100;
        cardContainerDealer.x = 150;
        cardContainerPlayer.x = 200;

        app.stage.addChild(cardContainerDealer);
        app.stage.addChild(cardContainerPlayer);
        addBlackjackLabels();
        app.render();
    }

    function addBlackjackLabels() {
        const dealerText = new PIXI.Text('Диллер', {
            fontFamily: 'Arial', fontSize: 20, fill: 'white', fontWeight: 'bold', stroke: '#000', strokeThickness: 4
        });
        dealerText.anchor.set(0, 0);
        dealerText.x = 16;
        dealerText.y = 10;
        app.stage.addChild(dealerText);

        const playerText = new PIXI.Text('Игрок', {
            fontFamily: 'Arial', fontSize: 20, fill: 'white', fontWeight: 'bold', stroke: '#000', strokeThickness: 4
        });
        playerText.anchor.set(1, 0);
        playerText.x = app.screen.width - 16;
        playerText.y = 10;
        app.stage.addChild(playerText);

        window.addEventListener("resize", () => {
            playerText.x = app.screen.width - 16;
        });
    }


    function destroyBlackjackScene() {
        const container = document.getElementById("blackjack-canvas-container");
        if (app) {
            app.stop();
            app.destroy(true, { children: true, texture: true, baseTexture: true });
            app = null;
        }

        deck = [];
        playerCards = [];
        dealerCards = [];
        cardTextures = {};

        if (container) {
            container.innerHTML = "";
            container.style.display = "none";
        }
    }

    function reset21Screen() {
        if (!app) return;
        canPressButtons = false;
        canHit = false;
        playerHasBlackjack = false;

        cardContainerPlayer?.removeChildren();
        cardContainerDealer?.removeChildren();

        playerCards = [];
        dealerCards = [];
        deck = [];

        cardContainerDealer.x = 30;
        cardContainerPlayer.x = 200;

        document.getElementById('blackjack-result').innerText = '';
        document.getElementById('blackjack-prize').innerText = '';
        app.render();
    }

    async function playShuffleAnimation() {
    return new Promise(async (resolve) => {
        const numCards = 25;
        const centerX = app.screen.width / 2;
        const centerY = app.screen.height / 2;
        const sprites = [];

        const allCardIds = Object.keys(cardTextures).filter(id => id !== "back" && id !== "table");

        // 1. Появление и разлёт
        for (let i = 0; i < numCards; i++) {
            const cardId = allCardIds[Math.floor(Math.random() * allCardIds.length)];
            const sprite = new PIXI.Sprite(cardTextures[cardId]);
            sprite.anchor.set(0.5);
            sprite.scale.set(0.13);
            sprite.alpha = 0;
            sprite.x = centerX;
            sprite.y = centerY;
            app.stage.addChild(sprite);
            sprites.push(sprite);

            const offsetX = (i - numCards / 2) * 10;
            const offsetY = Math.abs(i - numCards / 2) * 2;
            const rotation = (i - numCards / 2) * 0.03;

            gsap.to(sprite, {
                delay: i * 0.03,
                alpha: 1,
                x: centerX + offsetX,
                y: centerY + offsetY,
                rotation: rotation,
                duration: 0.4,
                ease: "power2.out",
                onUpdate: () => app.render()
            });
        }

        // 2. Ждём и потом собираем обратно
        setTimeout(() => {
            sprites.forEach((sprite, index) => {
                gsap.to(sprite, {
                    delay: index * 0.015,
                    x: centerX,
                    y: centerY,
                    rotation: 0,
                    alpha: 0,
                    duration: 0.35,
                    ease: "power1.inOut",
                    onUpdate: () => app.render(),
                    onComplete: () => {
                        if (index === sprites.length - 1) {
                            sprites.forEach(s => app.stage.removeChild(s));
                            app.render();
                            resolve();
                        }
                    }
                });
            });
        }, 1800); // Задержка перед сбором
    });
}



    function shuffleDeck() {
        const suits = ["H", "D", "C", "S"];
        const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        deck = [];
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push(`${rank}${suit}`);
            }
        }
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function drawCard(container, delay = 0, face = true) {
        if (!app || !app.screen) return;

        const cardId = deck.pop();
        const texture = face ? cardTextures[cardId] : cardTextures["back"];
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(0.15);

         const index = container.children.length;
        let targetX = index < 3 ? index * 30 + 50 : (index - 3) * 30 + 60;
        let targetY = index < 3 ? 0 : 50;




        sprite.x = app.screen.width / 2;
        sprite.y = app.screen.height / 2;
        sprite.alpha = 0;
        container.addChild(sprite);

        gsap.to(sprite, {
            delay,
            x: targetX,
            y: targetY,
            alpha: 1,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => app.render(),
            onComplete: () => app.render()
        });

        return cardId;
    }

    function getCardValue(card) {
        const rank = card.slice(0, -1);
        if (["K", "Q", "J"].includes(rank)) return 10;
        if (rank === "A") return 11;
        return parseInt(rank);
    }

    function calculateScore(cards) {
        let total = 0;
        let aces = 0;
        for (let card of cards) {
            const val = getCardValue(card);
            total += val;
            if (card.startsWith("A")) aces++;
        }
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        return total;
    }

   function updateBlackjackResultUI(result, winAmount = 0, customPrize = null) {
    const resultBox = document.getElementById('blackjack-result');
    const prizeBox = document.getElementById('blackjack-prize');
    const currency = selectedCurrency.toUpperCase();

    resultBox.innerText = result;

    if (customPrize) {
        prizeBox.innerText = customPrize;
    } else if (result === 'Вы выиграли!' || result === 'Blackjack!') {
        prizeBox.innerText = `🏆 +${winAmount} ${currency}`;
    } else if (result === 'Ничья') {
        prizeBox.innerText = `🤝 Ставка возвращена`;
    } else {
        prizeBox.innerText = `💸 Вы проиграли`;
    }

    // 💰 начисление выигрыша
    if (result === 'Ничья') {
        fakeBalance[selectedCurrency] += window.bet;
    } else if (result === 'Blackjack!') {
       // winAmount = window.bet * 3;
        fakeBalance[selectedCurrency] += winAmount;
    } else if (result === 'Вы выиграли!') {
        //winAmount = window.bet * 2;
        fakeBalance[selectedCurrency] += winAmount;
    }

    updateBalanceUI();

    // 📦 запись игры
    if (typeof recordGame === 'function') {
        recordGame("blackjack", window.bet, result, winAmount || 0);
    }
}



    function startBlackjackGame() {
        if (!app || blackjackInProgress) return;

            if (!window.bet || isNaN(window.bet) || window.bet <= 0) return alert("Введите корректную ставку.");
        const balanceAvailable = selectedCurrency === 'ton'
            ? parseFloat(fakeBalance.ton.toFixed(2))
            : parseFloat(fakeBalance.usdt.toFixed(2));
        if (window.bet > balanceAvailable) return alert(`Недостаточно средств (${selectedCurrency.toUpperCase()})`);
        if (window.bet < minBet) return alert(`Минимум ${minBet} ${selectedCurrency.toUpperCase()}`);

// 💸 Вычитаем ставку
fakeBalance[selectedCurrency] = parseFloat((balanceAvailable - window.bet).toFixed(2));
updateBalanceUI();





        reset21Screen();
        canPressButtons = false;
        canHit = false;
        blackjackInProgress = true;
        blockBlackjackUI();

        playShuffleAnimation().then(() => {
            shuffleDeck();

            document.getElementById('btn-blackjack-hit')?.classList.remove('hidden');
            document.getElementById('btn-blackjack-stand')?.classList.remove('hidden');
            document.getElementById('btn-blackjack-start')?.classList.add('hidden');

            let delay = 0.4;
            dealerCards.push(drawCard(cardContainerDealer, 0, true));
            dealerCards.push(drawCard(cardContainerDealer, delay, false));
            delay += 0.4;
            playerCards.push(drawCard(cardContainerPlayer, delay, true));
            playerCards.push(drawCard(cardContainerPlayer, delay + 0.4, true));

            setTimeout(() => {
                const playerScore = calculateScore(playerCards.slice(0, 2));
                const dealerScore = calculateScore(dealerCards.slice(0, 2));

                const dealerHasBlackjack = dealerCards.length === 2 && dealerScore === 21;
                const playerHasBlackjack = playerCards.length === 2 && playerScore === 21;

                if (dealerHasBlackjack || playerHasBlackjack) {
                    if (cardContainerDealer.children[1]) {
                        cardContainerDealer.children[1].texture = cardTextures[dealerCards[1]];
                    }
                    app.render();

                    if (dealerHasBlackjack && playerHasBlackjack) {
                        updateBlackjackResultUI("Ничья", 0, `🤝 У обоих Blackjack`);
                    } else if (dealerHasBlackjack) {
                        updateBlackjackResultUI("Проигрыш", 0, `🃏 У дилера Blackjack!`);
                    } else if (playerHasBlackjack) {
                        updateBlackjackResultUI("Blackjack!", (window.bet * 3));
                    }

                    blackjackInProgress = false;
                    unblockBlackjackUI();
                    document.getElementById('btn-blackjack-hit')?.classList.add('hidden');
                    document.getElementById('btn-blackjack-stand')?.classList.add('hidden');
                    document.getElementById('btn-blackjack-start')?.classList.remove('hidden');
                } else {
                    canPressButtons = true;
                    canHit = true;
                    enableBlackjackActionButtonsOnly();
                }
            }, 1000);

            app.render();
        });
    }

    function hitCard() {
        if (!app || !blackjackInProgress || !canHit || !canPressButtons) return;

        canHit = false;
        canPressButtons = false;

        blockBlackjackUI();

        const card = drawCard(cardContainerPlayer, 0, true);
        playerCards.push(card);

        setTimeout(() => {
            const score = calculateScore(playerCards);

            if (score > 21) {
               updateBlackjackResultUI("Проигрыш", 0, "💥 Перебор!");

                blackjackInProgress = false;
                unblockBlackjackUI();
                document.getElementById('btn-blackjack-hit')?.classList.add('hidden');
                document.getElementById('btn-blackjack-stand')?.classList.add('hidden');
                document.getElementById('btn-blackjack-start')?.classList.remove('hidden');
            } else {
                canHit = true;
                canPressButtons = true;
                enableBlackjackActionButtonsOnly();
                unblockBlackjackUI();
            }

            app.render();
        }, 1000);
    }

    function revealDealerAndFinish() {
    if (!app || !blackjackInProgress) return;
    blackjackInProgress = false;
    blockBlackjackUI();

    cardContainerDealer.children[1].texture = cardTextures[dealerCards[1]];
    app.render();

    document.getElementById('btn-blackjack-hit')?.setAttribute('disabled', 'true');
    document.getElementById('btn-blackjack-stand')?.setAttribute('disabled', 'true');

    const initialDealerScore = calculateScore(dealerCards.slice(0, 2));
    const dealerHasInitialBlackjack = dealerCards.length === 2 && initialDealerScore === 21;
    const initialPlayerScore = calculateScore(playerCards.slice(0, 2));
    const playerHasInitialBlackjack = playerCards.length === 2 && initialPlayerScore === 21;

    const playerFinalScore = calculateScore(playerCards);

    if (!dealerHasInitialBlackjack) {
        let dealerScore = calculateScore(dealerCards);

        // 🎲 Определяем исход
        const roll = Math.random();
        const forceDealerWin = roll < 0.7;
        const forceDraw = roll >= 0.7 && roll < 0.8;

        // Добираем пока < 17
        while (dealerScore < 17) {
            const card = drawCard(cardContainerDealer, 0.3, true);
            dealerCards.push(card);
            dealerScore = calculateScore(dealerCards);
        }

        // Попытка дотянуть до выигрыша
        if (dealerScore <= 21) {
            const scoreDiff = playerFinalScore - dealerScore;

            if (forceDealerWin && playerFinalScore <= 21 && scoreDiff >= 1) {
                let needed = playerFinalScore + 1;
                let found = null;

                for (let cardId of deck) {
                    const val = getCardValue(cardId);
                    if (val + dealerScore <= 21 && val + dealerScore === needed) {
                        found = cardId;
                        break;
                    }
                }

                if (found) {
                    const index = deck.indexOf(found);
                    if (index !== -1) deck.splice(index, 1);
                    dealerCards.push(found);
                    const sprite = new PIXI.Sprite(cardTextures[found]);
                    sprite.anchor.set(0.5);
                    sprite.scale.set(0.15);
                    sprite.x = app.screen.width / 2;
                    sprite.y = app.screen.height / 2;
                    sprite.alpha = 0;
                    cardContainerDealer.addChild(sprite);
                    gsap.to(sprite, {
                        delay: 0.3,
                        x: cardContainerDealer.children.length * 30,
                        y: 0,
                        alpha: 1,
                        duration: 0.5,
                        ease: "power2.out",
                        onUpdate: () => app.render(),
                        onComplete: () => app.render()
                    });
                }
            }
        }
    }

    const dealerFinalScore = calculateScore(dealerCards);

    if (dealerHasInitialBlackjack || playerHasInitialBlackjack) {
        if (dealerHasInitialBlackjack && playerHasInitialBlackjack) {
            updateBlackjackResultUI("Ничья", 0, `🤝 У обоих Blackjack`);
        } else if (dealerHasInitialBlackjack) {
            updateBlackjackResultUI("Проигрыш", 0, `🃏 У дилера Blackjack!`);
        } else if (playerHasInitialBlackjack) {
    const amount = window.bet * 3;
    const currency = window.selectedCurrency.toUpperCase();
    updateBlackjackResultUI("Blackjack!", amount, `🂡🂱 Blackjack! +${amount} ${currency}`);
}

    } else {
        if (dealerFinalScore > 21) {
            const amount = window.bet * 2;
const currency = window.selectedCurrency.toUpperCase();
updateBlackjackResultUI("Вы выиграли!", amount, `🔥 У дилера перебор. +${amount} ${currency}`);

        } else if (playerFinalScore > 21) {
            updateBlackjackResultUI("Проигрыш", 0, "💥 Перебор у игрока");
        } else if (dealerFinalScore > playerFinalScore) {
            updateBlackjackResultUI("Проигрыш", 0, "🤖 Дилер выигрывает");
        } else if (playerFinalScore > dealerFinalScore) {
    const amount = window.bet * 2;
    const currency = window.selectedCurrency.toUpperCase();
    updateBlackjackResultUI("Вы выиграли!", amount, `💰 +${amount} ${currency}`);
}
 else {
            updateBlackjackResultUI("Ничья", 0, "🤝 Одинаковое количество очков");
        }
    }

    document.getElementById('btn-blackjack-hit')?.classList.add('hidden');
    document.getElementById('btn-blackjack-stand')?.classList.add('hidden');

    setTimeout(() => {
        document.getElementById('btn-blackjack-start')?.classList.remove('hidden');
        canPressButtons = true;
        canHit = true;
        unblockBlackjackUI();
        app.render();
    }, 1000);

    app.render();
}



    function blockBlackjackUI() {
        document.querySelectorAll('#game-21 .currency-selector button').forEach(btn => btn.disabled = true);
        document.querySelectorAll('#game-21 .bet-box button').forEach(btn => btn.disabled = true);
        document.getElementById('btn-blackjack-hit')?.setAttribute('disabled', 'true');
        document.getElementById('btn-blackjack-stand')?.setAttribute('disabled', 'true');
        document.getElementById('btn-blackjack-start')?.setAttribute('disabled', 'true');
        document.querySelector('#game-21 .back-btn')?.setAttribute('disabled', 'true');
        document.querySelector('#game-21 .bet-box')?.classList.add('disabled');
    }

    function unblockBlackjackUI() {
        document.querySelectorAll('#game-21 .currency-selector button').forEach(btn => btn.disabled = false);
        document.querySelectorAll('#game-21 .bet-box button').forEach(btn => btn.disabled = false);
        document.getElementById('btn-blackjack-hit')?.removeAttribute('disabled');
        document.getElementById('btn-blackjack-stand')?.removeAttribute('disabled');
        document.getElementById('btn-blackjack-start')?.removeAttribute('disabled');
        document.querySelector('#game-21 .back-btn')?.removeAttribute('disabled');
        document.querySelector('#game-21 .bet-box')?.classList.remove('disabled');
    }

    function enableBlackjackActionButtonsOnly() {
        document.getElementById('btn-blackjack-hit')?.removeAttribute('disabled');
        document.getElementById('btn-blackjack-stand')?.removeAttribute('disabled');
    }

    window.initBlackjackScene = initBlackjackScene;
    window.destroyBlackjackScene = destroyBlackjackScene;
    window.reset21Screen = reset21Screen;
    window.startBlackjackGame = startBlackjackGame;
    window.hitCard = hitCard;
    window.revealDealerAndFinish = revealDealerAndFinish;
})();

(function () {
    let arrowInProgress = false;
    let arrowResult = null;
    let cashoutPressed = false;
    let arrowBlur = null;
    let motionBlur = null;
    let targetBlur = null;
    let hideTargetTimeout = null;
    let vibrationTween = null;

    let app = null;
    let arrowSprite, targetSprite, bgSprite, stuckArrowSprite;

    function autoRender() {
        console.log("♻️ render tick");
        app.render();
    }

    async function initArrowScene() {
        const container = document.getElementById("arrow-canvas-container");
        if (!container) return;

        container.innerHTML = "";
        container.style.display = "block";

        app = new PIXI.Application({
            width: container.clientWidth,
            height: container.clientHeight,
            transparent: true,
            autoStart: false,
            antialias: true
            });



            container.appendChild(app.view);

            window.addEventListener("resize", () => {
                app.renderer.resize(container.clientWidth, container.clientHeight);
                if (bgSprite) {
                    bgSprite.width = app.screen.width;
                    bgSprite.height = app.screen.height;
                }
                if (targetSprite) {
                    targetSprite.x = app.screen.width * 0.9;
                    targetSprite.y = app.screen.height / 2;
                }
                if (arrowSprite) {
                    arrowSprite.y = app.screen.height / 2;
                }
            });




        await PIXI.Assets.load([
            "assets/arrow.png",
            "assets/target.png",
            "assets/arrow-stuck-yellow.png",
            "assets/arrow-stuck-red.png",
            "assets/arrow-stuck-blue.png",
            "assets/arrow-stuck-black.png",
            "assets/arrow-stuck-white.png",
            "assets/target-zoom.png",
            "assets/background.png"
        ]);

        setupScene();
    }

    function setupScene() {
        const bgTexture = PIXI.Texture.from("assets/background.png");
        bgSprite = new PIXI.TilingSprite(bgTexture, app.screen.width, app.screen.height);
        bgSprite.tileScale.set(
            app.screen.width / bgTexture.width,
            app.screen.height / bgTexture.height
        );
        bgSprite.zIndex = 0;
        app.stage.addChild(bgSprite);

        targetSprite = PIXI.Sprite.from("assets/target.png");
        targetSprite.anchor.set(0.5);
        targetSprite.scale.set(0.2);
        targetSprite.x = app.screen.width * 0.9;
        targetSprite.y = app.screen.height * 0.7;
        targetSprite.zIndex = 1;
        app.stage.addChild(targetSprite);


        arrowSprite = PIXI.Sprite.from("assets/arrow.png");
        arrowSprite.anchor.set(0.5);
        arrowSprite.x = 40;
        arrowSprite.y = app.screen.height / 2;
        arrowSprite.scale.set(0.25);
        arrowSprite.zIndex = 2;
        app.stage.addChild(arrowSprite);

        app.stage.sortableChildren = true;
        app.render();
    }



    function determineScore() {
    const r = Math.random();
    if (r < 0.01) return 10;         // 1%
    if (r < 0.02) return 9;          // 1%
    if (r < 0.06) return 8;          // 4%
    if (r < 0.26) return 7;          // 20%
    if (r < 0.61) return 6;          // 35%
    return 0;                        // 39%
}



    function getStuckArrowTexture(score) {
        if (score === 10) return "assets/arrow-stuck-yellow.png";
        if (score === 9) return "assets/arrow-stuck-red.png";
        if (score === 8) return "assets/arrow-stuck-blue.png";
        if (score === 7) return "assets/arrow-stuck-black.png";
        if (score === 6) return "assets/arrow-stuck-white.png";
        return "assets/target-zoom.png";
    }

    function blockArrowUI() {
        document.querySelectorAll('#game-arrow .currency-selector button').forEach(btn => btn.disabled = true);
        document.querySelectorAll('#game-arrow .bet-box button').forEach(btn => btn.disabled = true);
        document.getElementById('btn-arrow-start')?.setAttribute('disabled', 'true');
        document.querySelector('#game-arrow .back-btn')?.setAttribute('disabled', 'true');
         document.querySelector('#game-arrow .bet-box')?.classList.add('disabled');
    }

    function unblockArrowUI() {
        document.querySelectorAll('#game-arrow .currency-selector button').forEach(btn => btn.disabled = false);
        document.querySelectorAll('#game-arrow .bet-box button').forEach(btn => btn.disabled = false);
        document.getElementById('btn-arrow-start')?.removeAttribute('disabled');
        document.querySelector('#game-arrow .back-btn')?.removeAttribute('disabled');
        document.querySelector('#game-arrow .bet-box')?.classList.remove('disabled');
    }

    function updateArrowResultUI(result, winAmount) {
        document.getElementById('arrow-result').innerText = result.label;
        const prizeBox = document.getElementById('arrow-prize');
        if (result.multiplier > 0) {
            prizeBox.innerText = `Выигрыш: ${formatAmount(winAmount)} ${window.selectedCurrency.toUpperCase()}`;
        } else {
            prizeBox.innerText = 'Вы проиграли!';
        }
    }

  function resetTarget() {
    clearTimeout(hideTargetTimeout);

    targetSprite.texture = PIXI.Texture.from("assets/target.png");
    targetSprite.scale.set(0.2);
    targetSprite.alpha = 1;
    targetSprite.visible = true;

    if (targetSprite.filters) {
        try {
            targetSprite.filters.forEach(f => f?.destroy?.());
        } catch (e) {}
        targetSprite.filters = null;
    }

    arrowSprite.visible = true;
    arrowSprite.x = 40;
    arrowSprite.y = app.screen.height / 2;
    arrowSprite.rotation = 0;
    arrowSprite.scale.set(0.25);

    if (arrowSprite.filters) {
        try {
            arrowSprite.filters.forEach(f => f?.destroy?.());
        } catch (e) {}
        arrowSprite.filters = null;
    }

    if (stuckArrowSprite) {
        app.stage.removeChild(stuckArrowSprite);
        stuckArrowSprite.destroy({ children: true, texture: true, baseTexture: true });
        stuckArrowSprite = null;
    }

    if (targetBlur) {
        try {
            targetBlur.destroy();
        } catch (e) {}
        targetBlur = null;
    }

    if (bgSprite.filters) {
        try {
            bgSprite.filters.forEach(f => f?.destroy?.());
        } catch (e) {}
        bgSprite.filters = null;
    }

    bgSprite.tilePosition.x = 0;
    app.render(); // обновляем сцену после сброса
}


    function startArrowGame() {
        const gameName = "Arrow";
        console.log("🎮 startArrowGame вызван");
        if (arrowInProgress || !arrowSprite) return;
        resetTarget();

        const balanceAvailable = window.selectedCurrency === 'ton'
    ? parseFloat(window.fakeBalance.ton.toFixed(2))
    : parseFloat(window.fakeBalance.usdt.toFixed(2));

        if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
    if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Некорректная ставка: ${window.bet}`);
    return showCustomAlert("Введите корректную ставку.", "error");
}
if (window.bet > balanceAvailable) {
    if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Недостаточно средств: ${window.bet} ${window.selectedCurrency.toUpperCase()} > ${balanceAvailable} ${window.selectedCurrency.toUpperCase()}`);
    return showCustomAlert(`Недостаточно средств (${window.selectedCurrency.toUpperCase()})`, "error");
}
if (window.bet < window.minBet) {
    if (typeof Player_action === 'function') Player_action(gameName, "Ошибка", `Ставка меньше минимума: ${window.bet} < ${window.minBet}`);
    return showCustomAlert(`Минимум ${window.minBet} ${selectedCurrency.toUpperCase()}`, "error");
}




        arrowInProgress = true;
        cashoutPressed = false;
        console.log("▶️ Добавляем autoRender");
        app.ticker.add(autoRender); // ✅ начать рендер
        app.start(); // ✅ запускаем рендер только во время анимации
        document.getElementById('arrow-result').innerText = '';
        document.getElementById('arrow-prize').innerText = '';
        document.getElementById('arrow-cashout')?.classList.add('hidden');

        window.fakeBalance[window.selectedCurrency] = parseFloat((balanceAvailable - window.bet).toFixed(2));
        updateBalanceUI();
        blockArrowUI();

        if (typeof Player_join === 'function') {
    Player_join(gameName, `TON: ${window.fakeBalance.ton} | USDT: ${window.fakeBalance.usdt}`);
}

if (typeof Player_action === 'function') {
    Player_action(gameName, "Ставка", `Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()}`);
}

        const score = determineScore();

        if (vibrationTween) vibrationTween.kill();
        vibrationTween = gsap.to(arrowSprite, {
            rotation: 0.05, y: "+=2", duration: 0.05,
            repeat: -1, yoyo: true, ease: "sine.inOut"
        });

        arrowBlur = new PIXI.filters.BlurFilter();
        arrowSprite.filters = [arrowBlur];
        gsap.to(arrowBlur, { blurX: 20, duration: 0.3 });

        motionBlur = new PIXI.filters.BlurFilter();
        bgSprite.filters = [motionBlur];
        gsap.to(motionBlur, { blurX: 30, blurY: 4, duration: 0.3 });

        arrowSprite.scale.set(0.25);
        gsap.to(arrowSprite.scale, { x: 0.4, y: 0.4, duration: 3 });

        targetBlur = new PIXI.filters.BlurFilter(8);
        targetSprite.visible = true;
        targetSprite.alpha = 1;
        targetSprite.scale.set(0.05);
        targetSprite.filters = [targetBlur];

        gsap.to(targetSprite.scale, { x: 0.2, y: 0.2, duration: 2.2 });

        setTimeout(() => {
            gsap.to(targetSprite, {
                alpha: 0, duration: 0.3,
                onComplete: () => {
                    targetSprite.visible = false;
                    app.render();
                }
            });
        }, 2400);

       const timeline = gsap.timeline();
        timeline.to(arrowSprite, {
            duration: 2.2,
            x: app.screen.width * 0.5,
            ease: "power2.inOut"
        });
        timeline.to(bgSprite.tilePosition, {
            x: app.screen.width * 1,
            duration: 2.2,
            ease: "power2.inOut"
        }, "<");

       timeline.to(arrowSprite, {
            duration: 1.2,
            x: targetSprite.x + 10,
            y: targetSprite.y + 3,
            rotation: 0,
            scaleX: 0.4,
            scaleY: 0.4,
            onComplete: () => {
                gsap.killTweensOf(arrowSprite);
                if (vibrationTween) vibrationTween.kill();

                gsap.to(arrowBlur, {
                    blurX: 0, duration: 0.3,
                    onComplete: () => {
                        arrowSprite.filters = null;
                        arrowBlur?.destroy(); arrowBlur = null;
                    }
                });

                gsap.to(motionBlur, {
                    blurX: 0, blurY: 0, duration: 0.4,
                    onComplete: () => {
                        bgSprite.filters = null;
                        motionBlur?.destroy(); motionBlur = null;
                    }
                });

                arrowSprite.visible = false;
                targetSprite.visible = false;



const texturePath = getStuckArrowTexture(score);
const texture = PIXI.Texture.from(texturePath);

if (!texture.baseTexture.valid) {
    console.warn("⚠️ Текстура не готова, ждём загрузки:", texturePath);
    texture.baseTexture.on('loaded', () => {
        showStuckArrow(texture);
    });
} else {
    showStuckArrow(texture);
}

function showStuckArrow(texture) {
    stuckArrowSprite = new PIXI.Sprite(texture);
    stuckArrowSprite.anchor.set(0.5);
    stuckArrowSprite.x = targetSprite.x;
    stuckArrowSprite.y = targetSprite.y;
    stuckArrowSprite.scale.set(0.6);
    stuckArrowSprite.zIndex = 3;
    app.stage.addChild(stuckArrowSprite);
    app.render();

    // Обязательно завершение тика чуть позже (1 тик)
    setTimeout(() => {
        app.ticker.remove(autoRender);
        app.stop();
    }, 0);
}





                let winAmount = 0;
                if (score === 10) winAmount = 10;
                else if (score === 9) winAmount = 3;
                else if (score === 8) winAmount = 2;
                else if (score === 7) winAmount = 1;
                else if (score === 6) winAmount = 0.5;

                arrowResult = {
                    multiplier: winAmount,
                    label: score === 0 ? "❌ Мимо" : `🎯 Попадание: ${score}`
                };

                if (winAmount > 0) {
    // Есть выигрыш
    document.getElementById('btn-arrow-start')?.classList.add('hidden');
    document.getElementById('arrow-cashout')?.classList.remove('hidden');
    document.getElementById('arrow-cashout')?.removeAttribute('disabled');
    blockArrowUI(); // остаётся заблокированным
} else {
    // Нет выигрыша
    document.getElementById('btn-arrow-start')?.classList.remove('hidden');
    unblockArrowUI(); // разблокировать
}



                updateArrowResultUI(arrowResult, window.bet * winAmount);

                if (typeof recordGame === 'function') {
    recordGame(
        "arrow",
        window.bet,
        arrowResult,
        window.bet * (arrowResult?.multiplier || 0),
        window.selectedCurrency
    );
}
                  if (typeof Player_leave === 'function' && arrowResult?.multiplier <= 0) {
    Player_leave(
        gameName,
        `Проигрыш | Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`
    );
}



                arrowInProgress = false;

                app.ticker.remove(autoRender); // 🛑 остановить рендер
                app.render();
            }
        });
    }

    function collectArrowPrize() {
        if (!arrowResult || cashoutPressed || arrowResult.multiplier <= 0) return;
        cashoutPressed = true;
        const winAmount = parseFloat((window.bet * arrowResult.multiplier).toFixed(2));
        window.fakeBalance[window.selectedCurrency] = parseFloat((window.fakeBalance[window.selectedCurrency] + winAmount).toFixed(2));
        updateBalanceUI();

        document.getElementById('arrow-cashout')?.setAttribute('disabled', 'true');
        document.getElementById('arrow-cashout')?.classList.add('hidden');
        document.getElementById('btn-arrow-start')?.classList.remove('hidden');

        resetTarget();
        app.render(); // обновление сцены после сброса
        unblockArrowUI(); // ✅ разблокировка после забора приза

        if (typeof Player_leave === 'function') {
    Player_leave(
        "Arrow",
        `Победа x${arrowResult.multiplier} (Выигрыш: ${winAmount} ${window.selectedCurrency.toUpperCase()}) | Ставка: ${window.bet} ${window.selectedCurrency.toUpperCase()} | Баланс: TON ${window.fakeBalance.ton}, USDT ${window.fakeBalance.usdt}`
    );
}


    }

    function destroyArrowScene() {
        const container = document.getElementById("arrow-canvas-container");

        if (app) {
            app.ticker.stop();
            app.ticker.remove(autoRender);
            app.destroy(true, { children: true, texture: true, baseTexture: true });
            app = null;
        }

        arrowSprite = null;
        targetSprite = null;
        bgSprite = null;
        stuckArrowSprite = null;
        arrowBlur = null;
        motionBlur = null;
        targetBlur = null;
        vibrationTween = null;

        arrowInProgress = false;
        arrowResult = null;
        cashoutPressed = false;
        hideTargetTimeout = null;

        if (container) {
            container.innerHTML = "";
            container.style.display = "none";
        }
    }

    window.initArrowScene = initArrowScene;
    window.startArrowGame = startArrowGame;
    window.collectArrowPrize = collectArrowPrize;
    window.resetTarget = resetTarget;
    window.destroyArrowScene = destroyArrowScene;
})();

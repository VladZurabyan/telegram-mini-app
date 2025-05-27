(function () {
    let arrowInProgress = false;
    let arrowResult = null;
    let cashoutPressed = false;

    let app, arrowSprite, targetSprite, bgSprite, stuckArrowSprite;

    async function initArrowScene() {
        const container = document.getElementById("arrow-canvas-container");
        if (!container) return;

        app = new PIXI.Application({
            width: container.clientWidth,
            height: container.clientHeight,
            transparent: true
        });

        container.innerHTML = "";
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
    }

    function determineScore() {
        const r = Math.random();
        if (r < 0.1) return 10;
        if (r < 0.25) return 9;
        if (r < 0.45) return 8;
        if (r < 0.7) return 7;
        if (r < 0.9) return 6;
        return 0;
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
    }

    function unblockArrowUI() {
        document.querySelectorAll('#game-arrow .currency-selector button').forEach(btn => btn.disabled = false);
        document.querySelectorAll('#game-arrow .bet-box button').forEach(btn => btn.disabled = false);
        document.getElementById('btn-arrow-start')?.removeAttribute('disabled');
        document.querySelector('#game-arrow .back-btn')?.removeAttribute('disabled');
    }

    function updateArrowResultUI(result, winAmount) {
        document.getElementById('arrow-result').innerText = result.label;
        const prizeBox = document.getElementById('arrow-prize');
        if (result.multiplier > 0) {
            prizeBox.innerText = `Выигрыш: ${formatAmount(winAmount)} ${selectedCurrency.toUpperCase()}`;
        } else {
            prizeBox.innerText = 'Вы проиграли!';
        }
    }

    function resetTarget() {
    targetSprite.texture = PIXI.Texture.from("assets/target.png");
    targetSprite.scale.set(0.2);
    targetSprite.alpha = 1;
    targetSprite.visible = true;
    targetSprite.filters = [];

    arrowSprite.visible = true;
    arrowSprite.x = 40;
    arrowSprite.y = app.screen.height / 2;
    arrowSprite.rotation = 0;
    arrowSprite.scale.set(0.25);
    arrowSprite.filters = [];

    if (stuckArrowSprite) {
        app.stage.removeChild(stuckArrowSprite);
        stuckArrowSprite = null;
    }

    bgSprite.filters = [];
    bgSprite.tilePosition.x = 0;
}


function startArrowGame() {
    if (arrowInProgress || !arrowSprite) return;

    resetTarget();

    if (!window.bet || isNaN(window.bet) || window.bet <= 0) {
        alert("Введите корректную ставку.");
        return;
    }

    const balanceAvailable = selectedCurrency === 'ton'
        ? parseFloat(fakeBalance.ton.toFixed(2))
        : parseFloat(fakeBalance.usdt.toFixed(2));

    if (window.bet > balanceAvailable) {
        alert(`Недостаточно средств (${selectedCurrency.toUpperCase()})`);
        return;
    }

    if (window.bet < minBet) {
        alert(`Минимум ${minBet} ${selectedCurrency.toUpperCase()}`);
        return;
    }

    arrowInProgress = true;
    cashoutPressed = false;
    document.getElementById('arrow-result').innerText = '';
    document.getElementById('arrow-prize').innerText = '';
    document.getElementById('arrow-cashout')?.classList.add('hidden');

    fakeBalance[selectedCurrency] = parseFloat((balanceAvailable - window.bet).toFixed(2));
    updateBalanceUI();
    blockArrowUI();

    const score = determineScore();

    const vibrationTween = gsap.to(arrowSprite, {
        rotation: 0.05,
        y: "+=2",
        duration: 0.05,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    const arrowBlur = new PIXI.filters.BlurFilter();
    arrowBlur.blurX = 0;
    arrowBlur.blurY = 0;
    arrowSprite.filters = [arrowBlur];

    gsap.to(arrowBlur, {
        blurX: 20,
        duration: 0.3,
        ease: "power2.out"
    });

    const motionBlur = new PIXI.filters.BlurFilter();
    motionBlur.blurX = 0;
    motionBlur.blurY = 0;
    bgSprite.filters = [motionBlur];

    gsap.to(motionBlur, {
        blurX: 30,
        blurY: 4,
        duration: 0.3,
        ease: "power2.out"
    });

    gsap.to(bgSprite.tilePosition, {
        x: bgSprite.tilePosition.x + 0,
        duration: 0.3,
        ease: "power1.out"
    });

    arrowSprite.scale.set(0.25);
    gsap.to(arrowSprite.scale, {
        x: 0.4,
        y: 0.4,
        duration: 3,
        ease: "sine.inOut"
    });

    // МИШЕНЬ: появляется маленькой и с блюром
    const targetBlur = new PIXI.filters.BlurFilter(8);
    targetSprite.visible = true;
    targetSprite.alpha = 1;
    targetSprite.scale.set(0.05);
    targetSprite.filters = [targetBlur];

    gsap.to(targetSprite.scale, {
        x: 0.2,
        y: 0.2,
        duration: 2.2,
        ease: "power1.inOut"
    });

    setTimeout(() => {
    gsap.to(targetSprite, {
        alpha: 0,
        duration: 0.3,
        ease: "sine.in",
        onComplete: () => {
            targetSprite.visible = false;
        }
    });
}, 2400); // или 1500 — как тебе по таймингу удобнее


    const timeline = gsap.timeline();

    // Полёт до центра
    timeline.to(arrowSprite, {
        duration: 2.2,
        x: app.screen.width * 0.5,
        ease: "power2.inOut"
    });

    timeline.to(bgSprite.tilePosition, {
    x: "+=200", // сместить фон на 200 пикселей
    duration: 2.2,
    ease: "power2.inOut"
}, "<"); // < — означает, что эта анимация запускается одновременно со стрелой


    // Финальный бросок без вращения
    timeline.to(arrowSprite, {
        duration: 1.2,
        x: targetSprite.x + 10,
        y: targetSprite.y + 3,
        rotation: 0,
        scaleX: 0.4,
        scaleY: 0.4,
        ease: "power2.out",
        onComplete: () => {
            gsap.killTweensOf(arrowSprite);
            vibrationTween.kill();

            gsap.to(arrowBlur, {
                blurX: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    arrowSprite.filters = [];
                }
            });

            gsap.to(motionBlur, {
                blurX: 0,
                blurY: 0,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    bgSprite.filters = [];
                }
            });

            arrowSprite.visible = false;
            targetSprite.visible = false; // скрываем обычную мишень

            const texturePath = getStuckArrowTexture(score);
            stuckArrowSprite = PIXI.Sprite.from(texturePath);
            stuckArrowSprite.anchor.set(0.5);
            stuckArrowSprite.x = targetSprite.x;
            stuckArrowSprite.y = targetSprite.y;
            stuckArrowSprite.scale.set(0.6);
            stuckArrowSprite.zIndex = 3;
            app.stage.addChild(stuckArrowSprite);

            let winAmount = 0;
            switch (score) {
                case 10: winAmount = 10; break;
                case 9: winAmount = 5; break;
                case 8: winAmount = 4; break;
                case 7: winAmount = 2; break;
                case 6: winAmount = 0.5; break;
                default: winAmount = 0;
            }

            arrowResult = {
                multiplier: winAmount,
                label: score === 0 ? "❌ Мимо" : `🎯 Попадание: ${score}`
            };

            if (arrowResult.multiplier > 0) {
    // Скрываем кнопку "Стрелять"
    document.getElementById('btn-arrow-start')?.classList.add('hidden');

    // Показываем кнопку "Забрать"
    document.getElementById('arrow-cashout')?.classList.remove('hidden');
    document.getElementById('arrow-cashout')?.removeAttribute('disabled');
}


            updateArrowResultUI(arrowResult, window.bet * arrowResult.multiplier);
            arrowInProgress = false;
            unblockArrowUI();
        }
    });
}





   function collectArrowPrize() {
    if (!arrowResult || cashoutPressed || arrowResult.multiplier <= 0) return;

    cashoutPressed = true;
    const winAmount = parseFloat((window.bet * arrowResult.multiplier).toFixed(2));
    fakeBalance[selectedCurrency] = parseFloat((fakeBalance[selectedCurrency] + winAmount).toFixed(2));
    updateBalanceUI();

    document.getElementById('arrow-cashout')?.setAttribute('disabled', 'true');
    document.getElementById('arrow-cashout')?.classList.add('hidden');

    // Показываем кнопку "Стрелять"
    document.getElementById('btn-arrow-start')?.classList.remove('hidden');

    resetTarget();
}


    window.initArrowScene = initArrowScene;
    window.startArrowGame = startArrowGame;
    window.collectArrowPrize = collectArrowPrize;
})();

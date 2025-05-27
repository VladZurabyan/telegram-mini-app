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
        bgSprite = PIXI.Sprite.from("assets/background.png");
        bgSprite.width = app.screen.width + 100;
        bgSprite.height = app.screen.height;
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
        if (score === 9 || score === 8) return "assets/arrow-stuck-red.png";
        if (score === 7) return "assets/arrow-stuck-blue.png";
        if (score === 6) return "assets/arrow-stuck-black.png";
        return "assets/arrow-stuck-white.png";
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
        if (stuckArrowSprite) {
            app.stage.removeChild(stuckArrowSprite);
            stuckArrowSprite = null;
        }
        arrowSprite.visible = true;
        arrowSprite.x = 40;
        arrowSprite.rotation = 0;
        targetSprite.visible = true;
        bgSprite.filters = [];
        bgSprite.x = 0;
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

    // Эффект вибрации
    gsap.to(arrowSprite, {
        rotation: 0.1,
        duration: 0.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // Эффект полёта: размытие фона + приближение
    const blur = new PIXI.filters.BlurFilter();
    blur.blurX = 8;
    bgSprite.filters = [blur];
    gsap.to(bgSprite, { x: -50, duration: 1, ease: "linear" });

    arrowSprite.scale.set(0.25);
    gsap.to(arrowSprite.scale, {
        x: 0.4,
        y: 0.4,
        duration: 3,
        ease: "sine.inOut"
    });

    targetSprite.visible = false;

   const timeline = gsap.timeline({
    onStart: () => {
        setTimeout(() => {
            targetSprite.visible = true;
            targetSprite.alpha = 0;
            const targetBlur = new PIXI.filters.BlurFilter(10);
            targetSprite.filters = [targetBlur];

            gsap.to(targetSprite, { alpha: 1, duration: 0.5, ease: "sine.inOut" });
            gsap.to(targetBlur, { blur: 0, duration: 0.5, ease: "sine.inOut" });
        }, 1500);
    }
});

timeline.to(arrowSprite, {
    duration: 3,
    x: app.screen.width / 2,
    ease: "power2.inOut"
});

timeline.to(arrowSprite, {
    duration: 0.9, // объединённая длительность
    x: targetSprite.x + 10,
    y: targetSprite.y + 3,
    rotation: Math.PI * 3,
    scaleX: 0.4,
    scaleY: 0.4,
    ease: "power2.inOut",
    onStart: () => {
        bgSprite.filters = [];
    },
    onComplete: () => {
        gsap.killTweensOf(arrowSprite);
        arrowSprite.visible = false;

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
            case 9:  winAmount = 5; break;
            case 8:  winAmount = 4; break;
            case 7:  winAmount = 2; break;
            case 6:  winAmount = 0.5; break;
            default: winAmount = 0;
        }

        arrowResult = {
            multiplier: winAmount,
            label: score === 0 ? "❌ Мимо" : `🎯 Попадание: ${score}`
        };

        if (arrowResult.multiplier > 0) {
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
        resetTarget();
    }

    window.initArrowScene = initArrowScene;
    window.startArrowGame = startArrowGame;
    window.collectArrowPrize = collectArrowPrize;
})();

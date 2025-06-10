export function initApp() {
    const initDataExists = !!window.Telegram?.WebApp?.initData;
    const isUserValid = !!window.Telegram?.WebApp?.initDataUnsafe?.user;

    const ua = navigator.userAgent;
    const isMobileTelegram = /Android|iPhone|iPad|iOS/i.test(ua);
    const isDesktopTelegram = /TelegramBot/.test(ua);
    const isWebTelegram = !isMobileTelegram && !isDesktopTelegram;

    if (!initDataExists || !isUserValid || isWebTelegram) {
        document.body.innerHTML = `
        <div style="position: fixed; inset: 0; display: flex; justify-content: center; align-items: center; background: rgba(15, 15, 15, 0.85); backdrop-filter: blur(10px); z-index: 99999; font-family: 'Segoe UI', sans-serif; color: #fff;">
            <div style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 16px; padding: 30px 40px; text-align: center; box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); animation: fadeIn 0.5s ease-out;">
                <h2 style="font-size: 28px; margin-bottom: 16px; color: #ff4e4e;">⛔ Доступ запрещён</h2>
                <p style="font-size: 18px; line-height: 1.5;">Откройте игру из <b>Telegram Mini App</b><br>на телефоне или через Telegram Desktop.</p>
            </div>
        </div>
        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
        </style>`;
        return false;
    }

    // ⛔ DevTools / клавиши
    document.addEventListener("keydown", function (e) {
        if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) || (e.ctrlKey && e.key === "U")) {
            e.preventDefault();
            if (typeof showCustomAlert === 'function') {
                showCustomAlert("⛔ DevTools запрещены", "error");
            }
        }
    });

    document.addEventListener("contextmenu", e => e.preventDefault());

    let devtoolsTriggered = false;
    setInterval(() => {
        const isDevToolsOpen = window.outerHeight - window.innerHeight > 160 || window.outerWidth - window.innerWidth > 160;
        if (isDevToolsOpen && !devtoolsTriggered) {
            devtoolsTriggered = true;
            if (typeof showCustomAlert === 'function') {
                showCustomAlert("⛔ DevTools замечены", "error");
            }
            if (typeof Player_action === 'function') {
                Player_action("Security", "DevTools", "Resize event");
            }
        }
    }, 1000);

    return true; // ✅ ВСЁ ОК
}

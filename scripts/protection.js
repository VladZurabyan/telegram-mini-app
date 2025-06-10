export function initApp() {
    const initDataExists = !!window.Telegram?.WebApp?.initData;
    const isUserValid = !!window.Telegram?.WebApp?.initDataUnsafe?.user;

    const ua = navigator.userAgent;
    const isMobileTelegram = /Android|iPhone|iPad|iOS/i.test(ua);
    const isDesktopTelegram = /TelegramBot|Telegram Desktop/i.test(ua);
    const isWebTelegram = !isMobileTelegram && !isDesktopTelegram;

    if (!initDataExists || !isUserValid || isWebTelegram) {
        showBlockScreen();
        return false; // ⛔ Доступ запрещён — вернуть false
    }

    // Блок клавиш
    document.addEventListener("keydown", function (e) {
        if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) || (e.ctrlKey && e.key === "U")) {
            e.preventDefault();
            showCustomAlert?.("⛔ DevTools запрещены", "error");
            return false;
        }
    });

    // Блок ПКМ
    document.addEventListener("contextmenu", e => e.preventDefault());

    // DevTools (размер окна)
    setInterval(() => {
        const devOpen = window.outerHeight - window.innerHeight > 160 || window.outerWidth - window.innerWidth > 160;
        if (devOpen) {
            showCustomAlert?.("⛔ Обнаружено DevTools", "error");
            Player_action?.("Security", "DevTools", "DevTools замечены через resize");
        }
    }, 1000);

    // DevTools (debugger timing)
    setInterval(() => {
        const start = performance.now();
        debugger;
        const end = performance.now();
        if (end - start > 100) {
            document.body.innerHTML = "<h1 style='color:red; text-align:center;'>⛔ DevTools запрещены</h1>";
        }
    }, 2000);

    return true; // ✅ Всё в порядке
}

function showBlockScreen() {
    document.body.innerHTML = `
    <div style="position: fixed; inset: 0; display: flex; justify-content: center; align-items: center; background: rgba(15, 15, 15, 0.85); backdrop-filter: blur(10px); z-index: 99999; font-family: 'Segoe UI', sans-serif; color: #fff;">
        <div style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 16px; padding: 30px 40px; text-align: center; box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); animation: fadeIn 0.5s ease-out;">
            <h2 style="font-size: 28px; margin-bottom: 16px; color: #ff4e4e;">⛔ Доступ запрещён</h2>
            <p style="font-size: 18px; line-height: 1.5;">Открой Mini App через <b>Telegram</b> (мобильный или десктоп).</p>
        </div>
    </div>
    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
    </style>`;
}

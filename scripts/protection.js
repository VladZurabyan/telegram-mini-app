export function initApp() {
    const initDataExists = !!window.Telegram?.WebApp?.initData;
    const isUserValid = !!window.Telegram?.WebApp?.initDataUnsafe?.user;

    const ua = navigator.userAgent;
    const isMobileTelegram = /Android|iPhone|iPad|iOS/i.test(ua);
    const isDesktopTelegram = /TelegramBot/.test(ua);
    const isWebTelegram = !isMobileTelegram && !isDesktopTelegram;

    // ❌ Запрет запуска вне Telegram Mini App
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
        return; // ✅ Просто выходим, не мешая загрузке остальных файлов
    }

    // 🛡️ Блокировка клавиш DevTools
    document.addEventListener("keydown", function (e) {
        if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) || (e.ctrlKey && e.key === "U")) {
            e.preventDefault();
            if (typeof showCustomAlert === 'function') {
                showCustomAlert("⛔ DevTools запрещены", "error");
            }
            return false;
        }
    });

    // 🛡️ Блокировка правой кнопки мыши
    document.addEventListener("contextmenu", e => e.preventDefault());

    // 🕵️ Обнаружение открытых DevTools через разницу размеров окна
    let devtoolsTriggered = false;
    setInterval(() => {
        const isDevToolsOpen = window.outerHeight - window.innerHeight > 160 || window.outerWidth - window.innerWidth > 160;
        if (isDevToolsOpen && !devtoolsTriggered) {
            devtoolsTriggered = true;
            if (typeof showCustomAlert === 'function') {
                showCustomAlert("⛔ Обнаружено возможное открытие DevTools. Это запрещено.", "error");
            }
            if (typeof Player_action === 'function') {
                Player_action("Security", "DevTools", "DevTools замечены через resize");
            }
        }
    }, 1000);

    // 🎯 Проверка времени выполнения debugger
    setInterval(() => {
        const start = performance.now();
        debugger;
        const end = performance.now();
        if (end - start > 100) {
            document.body.innerHTML = "<h1 style='color:red; text-align:center;'>⛔ DevTools запрещены</h1>";
        }
    }, 2000);
}


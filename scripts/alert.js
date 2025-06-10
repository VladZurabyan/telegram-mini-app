// scripts/alert.js

window.showCustomAlert = function (message, type = "") {
    const alert = document.getElementById("custom-alert");
    const msg = document.getElementById("custom-alert-message");

    if (!alert || !msg) {
        console.warn("⚠️ custom-alert не найден в DOM");
        return;
    }

    alert.classList.remove("success", "error", "hidden");
    if (type) alert.classList.add(type);

    msg.innerText = message;
};

window.closeCustomAlert = function () {
    const alert = document.getElementById("custom-alert");
    if (!alert) return;
    alert.classList.add("hidden");
    alert.classList.remove("success", "error");
};

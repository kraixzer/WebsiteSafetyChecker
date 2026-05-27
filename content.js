let threatCount = {
    redirects: 0,
    fakeButtons: 0,
    popups: 0,
    fakeVideos: 0,
    ads: 0
};

function updateStorage() {
    chrome.storage.local.set({
        threatData: threatCount
    });
}

// Warning Banner
function showWarning(message) {
    let banner = document.createElement("div");

    banner.innerText = "⚠ " + message;

    banner.style.position = "fixed";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.width = "100%";
    banner.style.background = "#dc2626";
    banner.style.color = "white";
    banner.style.padding = "10px";
    banner.style.zIndex = "999999";

    document.body.appendChild(banner);

    setTimeout(() => banner.remove(), 4000);
}

function detectRedirects() {
    const currentDomain = window.location.hostname;

    document.querySelectorAll("a").forEach(link => {
        try {
            const linkDomain = new URL(link.href).hostname;

            if (linkDomain !== currentDomain) {
                threatCount.redirects++;
                link.style.outline = "2px solid red";
            }
        } catch {}
    });
}

// Fake buttons
function detectFakeButtons() {
    document.querySelectorAll("button, div").forEach(el => {
        let text = el.innerText.toLowerCase();

        if (text.includes("download") || text.includes("play now") || text.includes("install")) {
            threatCount.fakeButtons++;
            el.style.outline = "2px dashed orange";

            el.addEventListener("click", () => {
                showWarning("Possible fake button (ad/scam)");
            });
        }
    });
}

// Popups
function detectPopups() {
    document.querySelectorAll("div, iframe").forEach(el => {
        let style = window.getComputedStyle(el);

        if (style.position === "fixed" && parseInt(style.zIndex) > 1000) {
            threatCount.popups++;
            el.style.border = "3px solid red";
        }
    });
}

function detectClickbait() {
    document.querySelectorAll("h1, h2, h3").forEach(el => {
        let text = el.innerText.toLowerCase();

        if (
            text.includes("free") ||
            text.includes("win") ||
            text.includes("earn") ||
            text.includes("click here")
        ) {
            threatCount.fakeButtons++;
            el.style.outline = "2px dashed orange";
        }
    });
}

function detectAds() {
    document.querySelectorAll("iframe").forEach(el => {
        const rect = el.getBoundingClientRect();

        if (rect.width < 500 && rect.height < 400) {
            threatCount.ads++;
            el.style.border = "2px solid purple";
        }
    });
}
// Detect notification permission request
if ("Notification" in window && Notification.permission === "default") {
    threatCount.popups++;
    showWarning("Site is requesting notification permission");
}

// RUN ALL
window.addEventListener("load", () => {
    detectRedirects();
    detectFakeButtons();
    detectPopups();
    detectFakeVideos();
    detectAds();
    detectClickbait();

    // Notification detection
    if (Notification && Notification.permission === "default") {
        showWarning("Site requesting notification access");
        threatCount.popups++;
    }

    updateStorage();
});

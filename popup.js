function loadData() {
    chrome.storage.local.get(
        [
            "siteStatus",
            "siteUrl",
            "riskScore",
            "statusColor",
            "threatData",
            "hostingInfo",
            "country"
        ],
        (data) => {

            // URL
            document.getElementById("url").innerText =
                data.siteUrl || "No site";

            // Status
            const statusEl = document.getElementById("status");
            statusEl.innerText = data.siteStatus || "Checking...";
            statusEl.style.color = data.statusColor || "white";

            // Risk score
            document.getElementById("risk").innerText =
                "Risk Score: " + (data.riskScore ?? "N/A");

            // Hosting info
            document.getElementById("hostInfo").innerText =
                "Host: " + (data.hostingInfo || "Unknown") +
                " | Country: " + (data.country || "Unknown");

            // Threat data (from content.js)
            const threats = data.threatData || {};

            document.getElementById("redirects").innerText =
                "🔁 Redirect Links: " + (threats.redirects || 0);

            document.getElementById("buttons").innerText =
                "🖱️ Fake Buttons: " + (threats.fakeButtons || 0);

            document.getElementById("popups").innerText =
                "🚨 Popups: " + (threats.popups || 0);

            document.getElementById("videos").innerText =
                "🎥 Fake Videos: " + (threats.fakeVideos || 0);

            document.getElementById("ads").innerText =
                "📢 Ads Detected: " + (threats.ads || 0);
        }
    );
}

// 🔄 Recheck
document.getElementById("recheck").addEventListener("click", () => {
    chrome.tabs.reload();
});

// 📊 Details
document.getElementById("details").addEventListener("click", () => {
    alert(
        "This tool analyzes:\n\n" +
        "- URL structure\n" +
        "- Google Safe Browsing\n" +
        "- Hosting & location\n" +
        "- Page behavior (ads, popups, redirects)"
    );
});

loadData();
// 🔑 ADD YOUR GOOGLE SAFE BROWSING API KEY HERE
const GOOGLE_API_KEY = "YOUR_GOOGLE_API_AIzaSyCgyqDSRyB8VzRbqYkrkLl168-VArgcQ8wY";

// ===============================
// 🔍 GOOGLE SAFE BROWSING CHECK
// ===============================
async function checkGoogleSafeBrowsing(url) {
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`;

    const body = {
        client: {
            clientId: "website-safety-checker",
            clientVersion: "1.0"
        },
        threatInfo: {
            threatTypes: [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION"
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }]
        }
    };

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            body: JSON.stringify(body)
        });

        const data = await res.json();
        return !!data.matches;

    } catch (error) {
        console.log("Safe Browsing Error:", error);
        return false;
    }
}

// ===============================
// 🌐 HOSTING / IP INFO (WHOIS ALT)
// ===============================
async function getDomainInfo(url) {
    try {
        const domain = new URL(url).hostname;

        const res = await fetch(`https://ipapi.co/${domain}/json/`);
        const data = await res.json();

        return {
            country: data.country_name || "Unknown",
            org: data.org || "Unknown"
        };

    } catch (error) {
        console.log("IP API Error:", error);
        return {
            country: "Unknown",
            org: "Unknown"
        };
    }
}

// ===============================
// 🧠 HEURISTIC ANALYSIS
// ===============================
function heuristicScore(url) {
    let risk = 0;

    try {
        const parsed = new URL(url);
        const domain = parsed.hostname.toLowerCase();

        const suspiciousTLDs = ['.xyz', '.top', '.fun', '.click', '.shop', '.online'];

        // 🚩 Suspicious TLD
        if (suspiciousTLDs.some(tld => domain.endsWith(tld))) {
            risk += 2;
        }

        // 🚩 Long or weird domain
        if (domain.length > 15) risk += 1;
        if (domain.includes('-')) risk += 1;

        // 🚩 Numbers in domain
        if (/\d/.test(domain)) risk += 1;

        // 🚩 Suspicious keywords
        if (
            url.toLowerCase().includes("free") ||
            url.toLowerCase().includes("win") ||
            url.toLowerCase().includes("bonus") ||
            url.toLowerCase().includes("crypto")
        ) {
            risk += 2;
        }

        // 🚩 HTTP (not secure)
        if (parsed.protocol === "http:") {
            risk += 2;
        }

    } catch (e) {
        risk += 3;
    }

    return risk;
}

// ===============================
// 🧠 FINAL ANALYSIS ENGINE
// ===============================
async function analyzeURL(url) {
    let risk = 0;

    // 1️⃣ Google Safe Browsing
    const isMalicious = await checkGoogleSafeBrowsing(url);
    if (isMalicious) {
        risk += 5;
    }

    // 2️⃣ Hosting Info
    const info = await getDomainInfo(url);

    // 🚩 Suspicious hosting signals
    if (info.country === "Unknown") risk += 1;

    if (info.org.toLowerCase().includes("hosting") ||
        info.org.toLowerCase().includes("cloud")) {
        risk += 1;
    }

    // 3️⃣ Heuristic Score
    risk += heuristicScore(url);

    // ===============================
    // 🎯 FINAL CLASSIFICATION
    // ===============================
    let status = "LIKELY SAFE ✅";
    let color = "green";

    if (risk >= 7) {
        status = "SCAM 🚨";
        color = "red";
    } else if (risk >= 4) {
        status = "SUSPICIOUS ⚠️";
        color = "orange";
    }

    return {
        risk,
        status,
        color,
        country: info.country,
        org: info.org
    };
}

// ===============================
// 🔄 TAB UPDATE LISTENER
// ===============================
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {

        try {
            const result = await analyzeURL(tab.url);

            chrome.storage.local.set({
                siteUrl: tab.url,
                riskScore: result.risk,
                siteStatus: result.status,
                statusColor: result.color,
                country: result.country,
                hostingInfo: result.org
            });

        } catch (error) {
            console.log("Analysis Error:", error);
        }
    }
});
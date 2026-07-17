//Weight script.js
const currentUser = localStorage.getItem("mimiTracker_session") || "guest";

document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();   // 🌙 Auto‑apply dark mode

    const today = new Date().toISOString().split('T')[0];
    document.getElementById("log-date").value = today;

    loadTarget();
    loadDailyWeights();
    renderHistory();
});

/* ============================================================
   🌙 APPLY SAVED THEME (NO toggle button)
   ============================================================ */
function applySavedTheme(){
    const saved = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", saved);
}

function loadTarget() {
    const targetData = JSON.parse(localStorage.getItem(`weight_target_${currentUser}`)) || { weight: "", reached: false };
    document.getElementById("target-weight-input").value = targetData.weight;
    document.getElementById("target-reached-checkbox").checked = targetData.reached;
    
    toggleCelebration(targetData.reached);
}

function saveTarget() {
    const targetWeight = document.getElementById("target-weight-input").value;
    const isReached = document.getElementById("target-reached-checkbox").checked;
    
    const targetData = { weight: targetWeight, reached: isReached };
    localStorage.setItem(`weight_target_${currentUser}`, JSON.stringify(targetData));
    
    toggleCelebration(isReached);
}

function toggleCelebration(show) {
    const msg = document.getElementById("celebration-msg");
    if (show) {
        msg.classList.remove("hidden");
    } else {
        msg.classList.add("hidden");
    }
}

function loadDailyWeights() {
    const selectedDate = document.getElementById("log-date").value;
    if (!selectedDate) return;

    const allData = JSON.parse(localStorage.getItem(`weight_logs_${currentUser}`)) || {};
    const dayData = allData[selectedDate] || { morning: "", afternoon: "", evening: "" };

    document.getElementById("morning-input").value = extractWeightVal(dayData.morning);
    document.getElementById("morning-saved").innerText = dayData.morning || "—";

    document.getElementById("afternoon-input").value = extractWeightVal(dayData.afternoon);
    document.getElementById("afternoon-saved").innerText = dayData.afternoon || "—";

    document.getElementById("evening-input").value = extractWeightVal(dayData.evening);
    document.getElementById("evening-saved").innerText = dayData.evening || "—";
}

function saveTimeWeight(timeOfDay) {
    const selectedDate = document.getElementById("log-date").value;
    const inputVal = document.getElementById(`${timeOfDay}-input`).value.trim();

    if (!inputVal) return alert("Please type a weight first!");

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    const formattedString = `(${timeString}) ${parseFloat(inputVal).toFixed(2)} kg`;

    const allData = JSON.parse(localStorage.getItem(`weight_logs_${currentUser}`)) || {};
    if (!allData[selectedDate]) allData[selectedDate] = { morning: "", afternoon: "", evening: "" };

    allData[selectedDate][timeOfDay] = formattedString;
    localStorage.setItem(`weight_logs_${currentUser}`, JSON.stringify(allData));

    loadDailyWeights();
    renderHistory();
}

function extractWeightVal(formattedStr) {
    if (!formattedStr || !formattedStr.includes(")")) return "";
    return formattedStr.split(")")[1].replace("kg", "").trim();
}

function renderHistory() {
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = "";

    const allData = JSON.parse(localStorage.getItem(`weight_logs_${currentUser}`)) || {};
    const sortedDates = Object.keys(allData).sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length === 0) {
        historyList.innerHTML = `<p style="color:#aaa; text-align:center; padding:1rem;">No logs found yet.</p>`;
        return;
    }

    sortedDates.forEach(date => {
        const item = allData[date];
        const dayDiv = document.createElement("div");
        dayDiv.className = "history-item";
        
        let logSummary = [];
        if (item.morning) logSummary.push(`🌅 M: ${extractWeightVal(item.morning)}kg`);
        if (item.afternoon) logSummary.push(`☀️ A: ${extractWeightVal(item.afternoon)}kg`);
        if (item.evening) logSummary.push(`🌙 E: ${extractWeightVal(item.evening)}kg`);

        dayDiv.innerHTML = `
            <span class="history-date">${formatDateLabel(date)}</span>
            <span class="history-weights">${logSummary.join(" | ") || "No entries logged"}</span>
        `;
        historyList.appendChild(dayDiv);
    });
}

function formatDateLabel(dateString) {
    const parts = dateString.split("-");
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

//Period script.js
const currentUser = localStorage.getItem("mimiTracker_session") || "guest";
let localSelectedSymptoms = [];

document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();   // 🌙 Auto‑apply dark mode

    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById("period-start-date").value = todayStr;
    
    renderPeriodTrackerUI();
});

/* ============================================================
   🌙 APPLY SAVED THEME (NO toggle button)
   ============================================================ */
function applySavedTheme(){
    const saved = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", saved);
}

// Returns tracking date footprints format code strings (YYYY-MM-DD)
function getTodayDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Manages selection states dynamically inside active symptom layout blocks
function toggleSymptom(name) {
    const btn = document.querySelector(`.symptom-tag[data-symptom="${name}"]`);
    if (!btn) return;

    if (localSelectedSymptoms.includes(name)) {
        localSelectedSymptoms = localSelectedSymptoms.filter(s => s !== name);
        btn.classList.remove("selected");
    } else {
        localSelectedSymptoms.push(name);
        btn.classList.add("selected");
    }
}

// Saves active checked conditions to localStorage records configurations 
function saveTodaySymptoms() {
    const todayKey = getTodayDateKey();
    const storageKey = `symptoms_${currentUser}`;
    
    let symptomsLog = JSON.parse(localStorage.getItem(storageKey)) || {};
    
    symptomsLog[todayKey] = [...localSelectedSymptoms];
    localStorage.setItem(storageKey, JSON.stringify(symptomsLog));

    alert("Today's symptoms logged successfully! 💕");
}

// Computes cycles intervals parameters, runs prediction calculus logic rules, and saves entry
function savePeriodCycle() {
    const startDateVal = document.getElementById("period-start-date").value;
    const cycleLength = parseInt(document.getElementById("cycle-length").value) || 28;
    const duration = parseInt(document.getElementById("period-duration").value) || 5;

    if (!startDateVal) {
        alert("Please select a valid period start date coordinate! 🌸");
        return;
    }

    const cycleHistory = JSON.parse(localStorage.getItem(`period_history_${currentUser}`)) || [];

    const newLog = {
        id: Date.now().toString(),
        startDate: startDateVal,
        cycleLength: cycleLength,
        duration: duration
    };

    cycleHistory.unshift(newLog);
    localStorage.setItem(`period_history_${currentUser}`, JSON.stringify(cycleHistory));

    renderPeriodTrackerUI();
}

function deletePeriodLog(id) {
    let cycleHistory = JSON.parse(localStorage.getItem(`period_history_${currentUser}`)) || [];
    cycleHistory = cycleHistory.filter(item => item.id !== id);
    localStorage.setItem(`period_history_${currentUser}`, JSON.stringify(cycleHistory));
    
    renderPeriodTrackerUI();
}

// Synchronizes graphical calculation loops with database records states
function renderPeriodTrackerUI() {
    const cycleHistory = JSON.parse(localStorage.getItem(`period_history_${currentUser}`)) || [];
    const listContainer = document.getElementById("cycle-history-list");
    listContainer.innerHTML = "";

    if (cycleHistory.length === 0) {
        listContainer.innerHTML = `<p class="empty-state">No historical cycles logged yet.</p>`;
        document.getElementById("countdown-days").innerText = "--";
        document.getElementById("prediction-text").innerText = "No cycle data logged";
        document.getElementById("cycle-day-text").innerText = "Log your last cycle details to view real-time countdown tracking.";
        return;
    }

    const latestLog = cycleHistory[0];
    const lastStart = new Date(latestLog.startDate + "T00:00:00"); 
    const today = new Date();
    today.setHours(0,0,0,0);

    const nextPeriodDate = new Date(lastStart.getTime());
    nextPeriodDate.setDate(nextPeriodDate.getDate() + latestLog.cycleLength);

    const msDiff = nextPeriodDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    if (daysLeft > 0) {
        document.getElementById("countdown-days").innerText = daysLeft;
        document.getElementById("prediction-text").innerText = `Next period expected in ${daysLeft} days`;
    } else if (daysLeft === 0) {
        document.getElementById("countdown-days").innerText = "0";
        document.getElementById("prediction-text").innerText = "Period predicted today! 🌸";
    } else {
        document.getElementById("countdown-days").innerText = "!";
        document.getElementById("prediction-text").innerText = `Cycle is running ${Math.abs(daysLeft)} days late`;
    }

    const opt = { month: 'short', day: 'numeric', year: 'numeric' };
    document.getElementById("cycle-day-text").innerText =
        `Last cycle logged: ${lastStart.toLocaleDateString('en-US', opt)} • Next cycle target: ${nextPeriodDate.toLocaleDateString('en-US', opt)}`;

    cycleHistory.forEach(item => {
        const itemStart = new Date(item.startDate + "T00:00:00");
        const rowNode = document.createElement("div");
        rowNode.className = "history-item";

        rowNode.innerHTML = `
            <div class="item-title">Started: ${itemStart.toLocaleDateString('en-US', opt)}</div>
            <div class="item-subtext">Duration: ${item.duration} days • Cycle Interval Setup: ${item.cycleLength} days</div>
            <button class="delete-log-btn" onclick="deletePeriodLog('${item.id}')">×</button>
        `;
        listContainer.appendChild(rowNode);
    });
}

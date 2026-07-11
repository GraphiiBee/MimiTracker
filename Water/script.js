const currentUser = localStorage.getItem("mimiTracker_session") || "guest";

// Dynamically fetch saved user target goal, default back to 2000ml if unconfigured
let dailyGoal = parseInt(localStorage.getItem(`water_goal_${currentUser}`)) || 2000;

document.addEventListener("DOMContentLoaded", () => {
    // Populate the Goal input field view with her active preference immediately
    document.getElementById("custom-goal-input").value = dailyGoal;
    checkAndLoadWaterLogs();
});

// Returns the date footprint code string for tracking record isolation (YYYY-MM-DD)
function getTodayDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Safely updates her target volume limits dynamically 
function updateDailyGoal() {
    const goalInput = document.getElementById("custom-goal-input");
    const newGoal = parseInt(goalInput.value);

    if (isNaN(newGoal) || newGoal < 500 || newGoal > 10000) {
        alert("Please choose a healthy target goal between 500 ml and 10,000 ml! 💧");
        return;
    }

    dailyGoal = newGoal;
    localStorage.setItem(`water_goal_${currentUser}`, dailyGoal);

    // Refresh calculations based on current day totals instantly
    const todayKey = getTodayDateKey();
    let currentIntake = 0;
    const savedLog = JSON.parse(localStorage.getItem(`water_log_${currentUser}`));
    if (savedLog && savedLog.date === todayKey) {
        currentIntake = savedLog.amount;
    }

    updateHydrationUI(currentIntake);
}

// Loads daily progress configurations or safely formats clean values on a brand new day
function checkAndLoadWaterLogs() {
    const todayKey = getTodayDateKey();
    let currentIntake = 0;

    const savedLog = JSON.parse(localStorage.getItem(`water_log_${currentUser}`));
    
    if (savedLog && savedLog.date === todayKey) {
        currentIntake = savedLog.amount;
    } else {
        // Automatically reset and instantiate empty metrics for the clean calendar sequence
        saveIntakeToStorage(0);
    }

    updateHydrationUI(currentIntake);
}

// Appends hydration adjustments into storage records
function addWater(amount) {
    const todayKey = getTodayDateKey();
    let currentIntake = 0;
    
    const savedLog = JSON.parse(localStorage.getItem(`water_log_${currentUser}`));
    if (savedLog && savedLog.date === todayKey) {
        currentIntake = savedLog.amount;
    }

    const brandNewTotal = currentIntake + amount;
    saveIntakeToStorage(brandNewTotal);
    updateHydrationUI(brandNewTotal);
}

// Handles custom water inputs parsing and numerical validation checks
function addCustomWater() {
    const input = document.getElementById("custom-water-input");
    const val = parseInt(input.value);

    if (isNaN(val) || val <= 0) {
        alert("Please enter a valid positive water measurement number! 💧");
        return;
    }

    addWater(val);
    input.value = ""; // Resets text after execution completes
}

// Wipes progress logs back to ground zero upon explicit confirmation action
function resetWater() {
    if (confirm("Are you sure you want to clear your current progress logs for today? 🌊")) {
        saveIntakeToStorage(0);
        updateHydrationUI(0);
    }
}

function saveIntakeToStorage(amount) {
    const logObj = {
        date: getTodayDateKey(),
        amount: amount
    };
    localStorage.setItem(`water_log_${currentUser}`, JSON.stringify(logObj));
}

// Recalculates visual metrics, adjustments fills, and handles completed milestones alerts
function updateHydrationUI(amount) {
    const percent = Math.min(Math.round((amount / dailyGoal) * 100), 100);
    const remaining = Math.max(dailyGoal - amount, 0);

    document.getElementById("water-percentage").innerText = `${percent}%`;
    document.getElementById("water-current-text").innerHTML = `<span class="highlight-blue">${amount}</span> / ${dailyGoal} ml`;
    
    const remainsText = document.getElementById("water-remains-text");
    if (remaining === 0) {
        remainsText.innerText = "Fantastic job! Daily hydration target achieved! 🎉🥳";
        remainsText.style.color = "#4E9F7F";
    } else {
        remainsText.innerText = `${remaining} ml left to go today!`;
        remainsText.style.color = "#777";
    }

    // Adjust linear indicator bounds smoothly
    document.getElementById("progress-bar-fill").style.width = `${percent}%`;
}
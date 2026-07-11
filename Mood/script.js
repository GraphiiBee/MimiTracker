const currentUser = localStorage.getItem("mimiTracker_session") || "guest";
let selectedMoodState = null;

const moodMetaConfigs = {
    excited: { color: "#FF9AA2", label: "Excited", emoji: "💖" },
    happy: { color: "#FFDAC1", label: "Happy", emoji: "😊" },
    relaxed: { color: "#E2F0CB", label: "Calm", emoji: "🍃" },
    tired: { color: "#C7CEEA", label: "Tired", emoji: "😴" },
    sad: { color: "#B5EAD7", label: "Down", emoji: "🥺" },
    stressed: { color: "#FFB7B2", label: "Stressed", emoji: "😤" }
};

document.addEventListener("DOMContentLoaded", () => {
    renderMoodLogsUI();
});

// Returns current local timestamp tracking boundary key string (YYYY-MM-DD)
function getTodayDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Manages high-light selections toggles on UI interaction nodes
function selectMood(moodType) {
    selectedMoodState = moodType;
    
    document.querySelectorAll(".mood-btn").forEach(btn => {
        btn.classList.remove("selected");
    });

    const targetedBtn = document.querySelector(`.mood-btn[data-mood="${moodType}"]`);
    if (targetedBtn) {
        targetedBtn.classList.add("selected");
    }
}

// Saves tracking items into history lists array collections
function saveDailyMood() {
    if (!selectedMoodState) {
        alert("Please pick a mood that matches your feeling today! 🌸");
        return;
    }

    const todayKey = getTodayDateKey();
    const noteContent = document.getElementById("mood-note").value.trim();
    
    let history = JSON.parse(localStorage.getItem(`mood_history_${currentUser}`)) || [];

    // Filter out historical items matching today's boundary key to allow updates/overwrites
    history = history.filter(log => log.date !== todayKey);

    const newMoodLog = {
        date: todayKey,
        mood: selectedMoodState,
        note: noteContent
    };

    history.unshift(newMoodLog); // Prepend to history stack so newest log is at the top
    localStorage.setItem(`mood_history_${currentUser}`, JSON.stringify(history));

    // Clear active parameters text spaces and select frames
    document.getElementById("mood-note").value = "";
    selectedMoodState = null;
    document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("selected"));

    renderMoodLogsUI();
}

function deleteMoodEntry(dateKey) {
    let history = JSON.parse(localStorage.getItem(`mood_history_${currentUser}`)) || [];
    history = history.filter(log => log.date !== dateKey);
    localStorage.setItem(`mood_history_${currentUser}`, JSON.stringify(history));
    renderMoodLogsUI();
}

// Refreshes structural calculation layers and dynamic lists
function renderMoodLogsUI() {
    const history = JSON.parse(localStorage.getItem(`mood_history_${currentUser}`)) || [];
    
    renderTimelineList(history);
    calculateAndRenderAnalytics(history);
}

// Appends sorted components cleanly into timeline containers
function renderTimelineList(history) {
    const timelineContainer = document.getElementById("mood-history-timeline");
    timelineContainer.innerHTML = "";

    if (history.length === 0) {
        timelineContainer.innerHTML = `<p class="empty-state">No mood history logged yet. Start today! ✨</p>`;
        return;
    }

    history.forEach(log => {
        const config = moodMetaConfigs[log.mood] || { emoji: "✨", label: log.mood, color: "#AAA" };
        
        // Formats the YYYY-MM-DD data output code into human readable views
        const dateParts = log.date.split("-");
        const formattedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
            .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const itemNode = document.createElement("div");
        itemNode.className = "timeline-item";
        itemNode.style.borderLeft = `4px solid ${config.color}`;

        itemNode.innerHTML = `
            <div class="item-emoji">${config.emoji}</div>
            <div class="item-content">
                <div class="item-header-row">
                    <span class="item-mood-type" style="color: ${config.color}">${config.label}</span>
                    <span class="item-date">${formattedDate}</span>
                </div>
                <p class="item-note">${log.note ? log.note : "<em>No notes recorded for this day.</em>"}</p>
            </div>
            <button class="delete-mood-btn" onclick="deleteMoodEntry('${log.date}')">×</button>
        `;

        timelineContainer.appendChild(itemNode);
    });
}

// Analyzes logs matching current calendar month to evaluate percentages graphs balances
function calculateAndRenderAnalytics(history) {
    const container = document.getElementById("analytics-container");
    container.innerHTML = "";

    const activeMonth = new Date().getMonth() + 1; // 1-12 match indices
    const activeYear = new Date().getFullYear();

    // Filters down item metrics tracking arrays matching active month frames explicitly
    const currentMonthLogs = history.filter(log => {
        const parts = log.date.split("-");
        return parseInt(parts[1]) === activeMonth && parseInt(parts[0]) === activeYear;
    });

    const totalLogsCount = currentMonthLogs.length;

    // Instantiate dynamic calculation bucket frameworks
    const moodTallies = { excited: 0, happy: 0, relaxed: 0, tired: 0, sad: 0, stressed: 0 };
    
    currentMonthLogs.forEach(log => {
        if (moodTallies[log.mood] !== undefined) {
            moodTallies[log.mood]++;
        }
    });

    // Generate output bar structures mapping data layouts
    Object.keys(moodMetaConfigs).forEach(key => {
        const count = moodTallies[key];
        const pct = totalLogsCount > 0 ? Math.round((count / totalLogsCount) * 100) : 0;
        const conf = moodMetaConfigs[key];

        const barRow = document.createElement("div");
        barRow.className = "analytics-bar-row";

        barRow.innerHTML = `
            <span class="label-span">${conf.emoji} ${conf.label}</span>
            <div class="bar-track">
                <div class="bar-fill" style="width: ${pct}%; background-color: ${conf.color}"></div>
            </div>
            <span class="pct-text">${pct}%</span>
        `;

        container.appendChild(barRow);
    });
}
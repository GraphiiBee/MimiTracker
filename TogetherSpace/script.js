/* TogetherSpace/script.js */

let activeUser = "";
let partnerCode = "";
let selectedColor = "#FFF0F2";

document.addEventListener("DOMContentLoaded", () => {
    initTogetherSpace();
});

function initTogetherSpace() {
    // 1. Validate explicit session state exactly like root index
    activeUser = localStorage.getItem("mimiTracker_session");
    if (!activeUser) {
        window.location.href = "../index.html";
        return;
    }

    // 2. Fetch specific matching linking string
    partnerCode = localStorage.getItem(`partner_${activeUser}`);
    if (!partnerCode) {
        window.location.href = "../index.html";
        return;
    }

    // 3. Render tracking code values visually on screen layout
    document.getElementById("display-partner-code").innerText = partnerCode;

    // 4. Initialize event configuration for the color dot selection engine
    setupColorPicker();

    // 5. Initialize layout rendering modules
    checkDailyJarReset();
    renderJar();
    renderCoupleGoals();
    renderStickyNotes();
}

/* ============================================================
   FEATURE 1: "I MISS YOU" JAR CONTROLLER (SHARED)
   ============================================================ */
function getJarKey() { return `together_jar_${partnerCode}`; }

function checkDailyJarReset() {
    const todayStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const savedData = JSON.parse(localStorage.getItem(getJarKey())) || { count: 0, date: todayStr };

    if (savedData.date !== todayStr) {
        savedData.count = 0;
        savedData.date = todayStr;
        localStorage.setItem(getJarKey(), JSON.stringify(savedData));
    }
}

function renderJar() {
    const data = JSON.parse(localStorage.getItem(getJarKey())) || { count: 0 };
    const counterEl = document.getElementById("jar-counter");
    const fillEl = document.getElementById("jar-fill");

    // Display total clicks without limits
    counterEl.innerText = data.count;

    // Visually caps at 99 inside layout bounding metrics
    let fillPercentage = Math.min(data.count, 99);
    fillEl.style.height = `${fillPercentage}%`;
}

function spamHeart() {
    const todayStr = new Date().toISOString().split('T')[0];
    const data = JSON.parse(localStorage.getItem(getJarKey())) || { count: 0, date: todayStr };

    data.count += 1;
    localStorage.setItem(getJarKey(), JSON.stringify(data));
    renderJar();

    // Trigger floating heart animation effects programmatically
    createFloatingHeart();
}

function createFloatingHeart() {
    const container = document.getElementById("jar-container");
    const heart = document.createElement("div");
    heart.className = "floating-heart";
    heart.innerText = "💗";

    // Randomize initial horizontal placements inside layout engine
    const randomLeft = Math.floor(Math.random() * 60) + 30; 
    const randomRotation = Math.floor(Math.random() * 60) - 30; 

    heart.style.left = `${randomLeft}px`;
    heart.style.bottom = "30px";
    heart.style.setProperty('--rot', `${randomRotation}deg`);

    container.appendChild(heart);

    // Garbage collection optimization rule
    setTimeout(() => {
        heart.remove();
    }, 800);
}

/* ============================================================
   FEATURE 2: SHARED COUPLE GOALS CONTROLLER (SHARED)
   ============================================================ */
function getGoalsKey() { return `together_goals_${partnerCode}`; }

function renderCoupleGoals() {
    const listEl = document.getElementById("goals-list");
    const goals = JSON.parse(localStorage.getItem(getGoalsKey())) || [];
    listEl.innerHTML = "";

    goals.forEach((goal, index) => {
        const li = document.createElement("li");
        li.className = `goal-item ${goal.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="goal-left">
                <input type="checkbox" ${goal.completed ? 'checked' : ''} onchange="toggleGoal(${index})">
                <span class="goal-text">${escapeHTML(goal.text)}</span>
            </div>
            <button class="btn-delete-goal" onclick="deleteGoal(${index})" aria-label="Delete Goal">&times;</button>
        `;
        listEl.appendChild(li);
    });
}

function addCoupleGoal() {
    const inputEl = document.getElementById("new-goal-input");
    const text = inputEl.value.trim();

    if (!text) return;

    const goals = JSON.parse(localStorage.getItem(getGoalsKey())) || [];
    goals.push({ text: text, completed: false });
    
    localStorage.setItem(getGoalsKey(), JSON.stringify(goals));
    inputEl.value = "";
    renderCoupleGoals();
}

function toggleGoal(index) {
    const goals = JSON.parse(localStorage.getItem(getGoalsKey())) || [];
    if (goals[index]) {
        goals[index].completed = !goals[index].completed;
        localStorage.setItem(getGoalsKey(), JSON.stringify(goals));
        renderCoupleGoals();
    }
}

function deleteGoal(index) {
    const goals = JSON.parse(localStorage.getItem(getGoalsKey())) || [];
    goals.splice(index, 1);
    localStorage.setItem(getGoalsKey(), JSON.stringify(goals));
    renderCoupleGoals();
}

/* ============================================================
   FEATURE 3: MICRO-OPTIMIZED STICKY NOTES ENGINE (SHARED)
   ============================================================ */
function getStickyKey() { return `together_sticky_${partnerCode}`; }

function renderStickyNotes() {
    const gridEl = document.getElementById("sticky-grid");
    const creatorBox = document.getElementById("sticky-creator-box");
    const countBadge = document.getElementById("sticky-count-badge");
    const notes = JSON.parse(localStorage.getItem(getStickyKey())) || [];

    gridEl.innerHTML = "";
    countBadge.innerText = `${notes.length} / 5`;

    // Cap at exactly 5 elements safely: hide inputs if limits are met
    if (notes.length >= 5) {
        creatorBox.classList.add("hidden");
    } else {
        creatorBox.classList.remove("hidden");
    }

    notes.forEach((note, index) => {
        const item = document.createElement("div");
        item.className = "board-note";
        item.style.backgroundColor = note.color;

        // Author name formatting rule from root script engine
        const formattedAuthor = note.author.charAt(0).toUpperCase() + note.author.slice(1);

        item.innerHTML = `
            <div class="board-note-text">${escapeHTML(note.text)}</div>
            <div class="board-note-footer">
                <span class="board-note-author">✨ ${formattedAuthor}</span>
                <button class="btn-delete-note" onclick="deleteStickyNote(${index})" aria-label="Delete Note">&times;</button>
            </div>
        `;
        gridEl.appendChild(item);
    });
}

function addStickyNote() {
    const inputEl = document.getElementById("new-sticky-input");
    const text = inputEl.value.trim();
    const notes = JSON.parse(localStorage.getItem(getStickyKey())) || [];

    if (notes.length >= 5) {
        alert("The board is full! Remove an old note first.");
        return;
    }

    if (!text) return;

    notes.push({
        text: text,
        color: selectedColor,
        author: activeUser
    });

    localStorage.setItem(getStickyKey(), JSON.stringify(notes));
    inputEl.value = "";
    document.getElementById("char-counter-display").innerText = "0/100";
    renderStickyNotes();
}

function deleteStickyNote(index) {
    const notes = JSON.parse(localStorage.getItem(getStickyKey())) || [];
    notes.splice(index, 1);
    localStorage.setItem(getStickyKey(), JSON.stringify(notes));
    renderStickyNotes();
}

function updateCharCount() {
    const text = document.getElementById("new-sticky-input").value;
    document.getElementById("char-counter-display").innerText = `${text.length}/100`;
}

function setupColorPicker() {
    const dots = document.querySelectorAll(".sticky-color-picker .color-dot");
    dots.forEach(dot => {
        dot.addEventListener("click", (e) => {
            dots.forEach(d => d.classList.remove("active"));
            e.target.classList.add("active");
            selectedColor = e.target.getAttribute("data-color");
        });
    });
}

/* ============================================================
   CONNECTION CONTROL PIPELINES & WIPER ENGINES
   ============================================================ */
function confirmDisconnect() {
    const confirmation = confirm("Are you sure you want to disconnect?\n\nThis will remove your link and data between you two will be cleared.");
    
    if (confirmation) {
        // 1. Purge shared data keys mapped to this partner room string
        localStorage.removeItem(`together_jar_${partnerCode}`);
        localStorage.removeItem(`together_goals_${partnerCode}`);
        localStorage.removeItem(`together_sticky_${partnerCode}`);

        // 2. Tear down linkage variables from user configurations
        localStorage.removeItem(`partner_${activeUser}`);

        // 3. Route user to home view state configuration
        window.location.href = "../index.html";
    }
}

// Security Helper to avoid XSS vectors when injecting user strings
function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
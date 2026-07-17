//Calendar script.js
const currentUser = localStorage.getItem("mimiTracker_session") || "guest";

let currentDate = new Date();
let displayedMonth = currentDate.getMonth(); 
let displayedYear = currentDate.getFullYear();

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Reference holder for the live ticking countdown loop
let countdownInterval = null;

document.addEventListener("DOMContentLoaded", () => {
    handleTypeChange(); 
    renderCalendar();
    renderRemindersList();
    
    countdownInterval = setInterval(updateLiveCountdowns, 1000);

    /* 🌙 APPLY SAVED THEME ON LOAD (NO BUTTON) */
    applySavedTheme();
});

/* ============================================================
   🌙 APPLY SAVED THEME (NO toggle button)
   ============================================================ */
function applySavedTheme(){
    const saved = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", saved);
}

/* ============================================================
   REMINDER SYSTEM (unchanged)
   ============================================================ */

function handleTypeChange() {
    const type = document.getElementById("reminder-type").value;
    const container = document.getElementById("dynamic-fields-container");
    container.innerHTML = "";

    if (type === "birthday" || type === "anniversary") {
        container.innerHTML = `
            <div class="input-row">
                <div class="input-group">
                    <label>Month</label>
                    <select id="field-month">
                        ${monthNames.map((m, idx) => `<option value="${idx + 1}" ${idx === displayedMonth ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </div>
                <div class="input-group">
                    <label>Day</label>
                    <input type="number" id="field-day" min="1" max="31" placeholder="DD" value="${new Date().getDate()}">
                </div>
            </div>
        `;
    } else if (type === "event") {
        container.innerHTML = `
            <div class="input-row">
                <div class="input-group">
                    <label>Month</label>
                    <select id="field-month">
                        ${monthNames.map((m, idx) => `<option value="${idx + 1}" ${idx === displayedMonth ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </div>
                <div class="input-group">
                    <label>Day</label>
                    <input type="number" id="field-day" min="1" max="31" placeholder="DD" value="${new Date().getDate()}">
                </div>
                <div class="input-group">
                    <label>Year</label>
                    <input type="number" id="field-year" placeholder="YYYY" value="${displayedYear}">
                </div>
            </div>
            <div class="input-group">
                <label>Start Time (Visual record only)</label>
                <input type="time" id="field-time" value="12:00">
            </div>
        `;
    } else if (type === "countdown") {
        container.innerHTML = `
            <div class="input-row">
                <div class="input-group">
                    <label>Month</label>
                    <select id="field-month">
                        ${monthNames.map((m, idx) => `<option value="${idx + 1}" ${idx === displayedMonth ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </div>
                <div class="input-group">
                    <label>Day</label>
                    <input type="number" id="field-day" min="1" max="31" placeholder="DD" value="${new Date().getDate()}">
                </div>
                <div class="input-group">
                    <label>Year</label>
                    <input type="number" id="field-year" placeholder="YYYY" value="${displayedYear}">
                </div>
            </div>
        `;
    }
}

function renderCalendar() {
    const grid = document.getElementById("days-grid");
    const label = document.getElementById("month-year-label");
    grid.innerHTML = "";

    label.innerText = `${monthNames[displayedMonth]} ${displayedYear}`;

    const firstDayIndex = new Date(displayedYear, displayedMonth, 1).getDay();
    const totalDaysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();

    const reminders = JSON.parse(localStorage.getItem(`reminders_${currentUser}`)) || [];

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "day-cell empty";
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDaysInMonth; day++) {
        const cell = document.createElement("div");
        cell.className = "day-cell";
        cell.innerText = day;

        const realToday = new Date();
        if (day === realToday.getDate() && displayedMonth === realToday.getMonth() && displayedYear === realToday.getFullYear()) {
            cell.classList.add("today");
        }

        const targetMonth = displayedMonth + 1;
        const hasMatch = reminders.some(rem => {
            if (rem.type === "birthday" || rem.type === "anniversary") {
                return parseInt(rem.month) === targetMonth && parseInt(rem.day) === day;
            } else {
                return parseInt(rem.month) === targetMonth && parseInt(rem.day) === day && parseInt(rem.year) === displayedYear;
            }
        });

        if (hasMatch) {
            const dot = document.createElement("span");
            dot.className = "event-dot";
            cell.appendChild(dot);
        }

        grid.appendChild(cell);
    }
}

function changeMonth(direction) {
    displayedMonth += direction;
    if (displayedMonth < 0) {
        displayedMonth = 11;
        displayedYear--;
    } else if (displayedMonth > 11) {
        displayedMonth = 0;
        displayedYear++;
    }
    renderCalendar();
    renderRemindersList();
}

function saveReminder() {
    const title = document.getElementById("reminder-title").value.trim();
    const type = document.getElementById("reminder-type").value;
    
    if (!title) {
        alert("Please enter a title for the reminder! 💕");
        return;
    }

    const month = parseInt(document.getElementById("field-month").value);
    const day = parseInt(document.getElementById("field-day").value);
    
    let year = null;
    let time = null;

    if (type === "event" || type === "countdown") {
        year = parseInt(document.getElementById("field-year").value);
        if (!year) {
            alert("Please provide a valid year!");
            return;
        }
    }
    if (type === "event") {
        time = document.getElementById("field-time").value;
    }

    const reminders = JSON.parse(localStorage.getItem(`reminders_${currentUser}`)) || [];
    
    const newReminder = {
        id: Date.now().toString(),
        title: title,
        type: type,
        month: month,
        day: day,
        year: year,
        time: time
    };

    reminders.push(newReminder);
    localStorage.setItem(`reminders_${currentUser}`, JSON.stringify(reminders));

    document.getElementById("reminder-title").value = "";
    
    renderCalendar();
    renderRemindersList();
}

function deleteReminder(id) {
    let reminders = JSON.parse(localStorage.getItem(`reminders_${currentUser}`)) || [];
    reminders = reminders.filter(item => item.id !== id);
    localStorage.setItem(`reminders_${currentUser}`, JSON.stringify(reminders));
    renderCalendar();
    renderRemindersList();
}

function renderRemindersList() {
    const listContainer = document.getElementById("reminders-list");
    listContainer.innerHTML = "";
    
    document.getElementById("list-title").innerText = `Reminders for ${monthNames[displayedMonth]}`;

    const reminders = JSON.parse(localStorage.getItem(`reminders_${currentUser}`)) || [];
    const targetMonth = displayedMonth + 1;

    const monthlyReminders = reminders.filter(rem => {
        if (rem.type === "birthday" || rem.type === "anniversary") {
            return parseInt(rem.month) === targetMonth;
        } else {
            return parseInt(rem.month) === targetMonth && parseInt(rem.year) === displayedYear;
        }
    });

    if (monthlyReminders.length === 0) {
        listContainer.innerHTML = `<p class="empty-state">No reminders recorded for this month. ✨</p>`;
        return;
    }

    monthlyReminders.sort((a, b) => a.day - b.day);

    monthlyReminders.forEach(rem => {
        const item = document.createElement("div");
        item.className = "reminder-item";
        
        let metaDetails = "";
        let countdownPlaceholder = "";

        if (rem.type === "birthday" || rem.type === "anniversary") {
            metaDetails = `Happens every year on ${monthNames[rem.month - 1]} ${rem.day}`;
        } else if (rem.type === "event") {
            metaDetails = `Date: ${monthNames[rem.month - 1]} ${rem.day}, ${rem.year} — Starts at: ⏰ ${rem.time}`;
        } else if (rem.type === "countdown") {
            metaDetails = `Target Date: ${monthNames[rem.month - 1]} ${rem.day}, ${rem.year}`;
            countdownPlaceholder = `<div class="live-countdown" data-target-year="${rem.year}" data-target-month="${rem.month}" data-target-day="${rem.day}">Calculating clock...</div>`;
        }

        item.innerHTML = `
            <div class="reminder-top-row">
                <span class="title">${rem.title}</span>
                <span class="type-badge">${rem.type}</span>
            </div>
            <p class="meta-text">${metaDetails}</p>
            ${countdownPlaceholder}
            <button class="delete-reminder-btn" onclick="deleteReminder('${rem.id}')">×</button>
        `;

        listContainer.appendChild(item);
    });

    updateLiveCountdowns();
}

function updateLiveCountdowns() {
    const clocks = document.querySelectorAll(".live-countdown");
    clocks.forEach(clock => {
        const y = parseInt(clock.getAttribute("data-target-year"));
        const m = parseInt(clock.getAttribute("data-target-month")) - 1;
        const d = parseInt(clock.getAttribute("data-target-day"));

        const targetTime = new Date(y, m, d, 0, 0, 0).getTime();
        const now = new Date().getTime();
        const distance = targetTime - now;

        if (distance < 0) {
            clock.innerText = "Event arrived! 🎉";
            clock.style.borderColor = "#B5EAD7";
            clock.style.color = "#4E9F7F";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        clock.innerText = `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s`;
    });
}

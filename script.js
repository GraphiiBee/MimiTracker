let tempUsername = "";
let isExistingUser = false;

document.addEventListener("DOMContentLoaded", () => {
    checkSession();
});

function openAuthModal() {
    document.getElementById("auth-modal").classList.remove("hidden");
    resetAuthModal();
}

function closeAuthModal() {
    document.getElementById("auth-modal").classList.add("hidden");
}

function resetAuthModal() {
    document.getElementById("auth-step-1").classList.remove("hidden");
    document.getElementById("auth-step-2").classList.add("hidden");
    document.getElementById("username-input").value = "";
    document.getElementById("password-input").value = "";
    tempUsername = "";
}

function handleUsernameSubmit() {
    const usernameInput = document.getElementById("username-input").value.trim();
    if (!usernameInput) return alert("Please type a username!");

    tempUsername = usernameInput.toLowerCase();
    const savedUserData = localStorage.getItem("user_" + tempUsername);

    document.getElementById("auth-step-1").classList.add("hidden");
    document.getElementById("auth-step-2").classList.remove("hidden");

    if (savedUserData) {
        isExistingUser = true;
        document.getElementById("password-title").innerText = "Log In";
        document.getElementById("auth-status-msg").innerText = `"${usernameInput}" is registered. Enter your password.`;
    } else {
        isExistingUser = false;
        document.getElementById("password-title").innerText = "Register Name";
        document.getElementById("auth-status-msg").innerText = `"${usernameInput}" is available! Create a password to claim it.`;
    }
}

function handlePasswordSubmit() {
    const passwordInput = document.getElementById("password-input").value.trim();
    if (!passwordInput) return alert("Password cannot be blank!");

    if (isExistingUser) {
        const savedUserData = JSON.parse(localStorage.getItem("user_" + tempUsername));
        if (savedUserData.password === passwordInput) {
            loginSuccess(tempUsername);
        } else {
            alert("Incorrect password! Try again.");
        }
    } else {
        const newUserData = {
            username: tempUsername,
            password: passwordInput
        };
        localStorage.setItem("user_" + tempUsername, JSON.stringify(newUserData));
        loginSuccess(tempUsername);
    }
}

function loginSuccess(username) {
    localStorage.setItem("mimiTracker_session", username);
    closeAuthModal();
    checkSession();
}

function logout() {
    localStorage.removeItem("mimiTracker_session");
    checkSession();
}

function checkSession() {
    const activeUser = localStorage.getItem("mimiTracker_session");
    const authBtn = document.getElementById("auth-btn");
    const userDisplay = document.getElementById("user-display");
    const logoutBtn = document.getElementById("logout-btn");
    const welcomeText = document.getElementById("welcome-text");
    const previewsBlock = document.getElementById("home-previews");

    if (activeUser) {
        authBtn.classList.add("hidden");
        userDisplay.classList.remove("hidden");
        logoutBtn.classList.remove("hidden");
        previewsBlock.classList.remove("hidden");
        
        const displayLabel = activeUser.charAt(0).toUpperCase() + activeUser.slice(1);
        userDisplay.innerText = `🌸 Hello, ${displayLabel}`;
        welcomeText.innerText = `Welcome back, ${displayLabel} ✨`;

        renderPeriodPreview(activeUser);
        renderRemindersPreview(activeUser);
    } else {
        authBtn.classList.remove("hidden");
        userDisplay.classList.add("hidden");
        logoutBtn.classList.add("hidden");
        previewsBlock.classList.add("hidden");
        welcomeText.innerText = "Welcome to MimiTracker ✨";
    }
}

function renderPeriodPreview(user) {
    const outputBox = document.getElementById("home-period-content");
    const history = JSON.parse(localStorage.getItem(`period_history_${user}`)) || [];

    if (history.length === 0) {
        outputBox.innerHTML = "No cycle data logged yet. Click the card below to configure tracking! 🌸";
        return;
    }

    const latest = history[0];
    const lastStart = new Date(latest.startDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextTarget = new Date(lastStart.getTime());
    nextTarget.setDate(nextTarget.getDate() + latest.cycleLength);

    const timeDiff = nextTarget.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysLeft > 0) {
        outputBox.innerHTML = `Next period expected in <span class="preview-highlight">${daysLeft}</span> days.`;
    } else if (daysLeft === 0) {
        outputBox.innerHTML = `<span class="preview-highlight">🚨 Period predicted today!</span> Take care of yourself.`;
    } else {
        outputBox.innerHTML = `Cycle is running <span class="preview-highlight">${Math.abs(daysLeft)}</span> days late.`;
    }
}

function renderRemindersPreview(user) {
    const displayBox = document.getElementById("home-reminders-content");
    const reminders = JSON.parse(localStorage.getItem(`reminders_${user}`)) || [];

    if (reminders.length === 0) {
        displayBox.innerHTML = "No events scheduled yet. Tap Calendar to add entries! ✨";
        return;
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const parsedEvents = reminders.map(item => {
        let yr = item.year ? parseInt(item.year) : currentYear;
        let eventDate = new Date(yr, parseInt(item.month) - 1, parseInt(item.day), 0, 0, 0);

        if (!item.year && eventDate.getTime() < today.setHours(0, 0, 0, 0)) {
            eventDate.setFullYear(currentYear + 1);
        }

        return {
            title: item.title,
            dateObj: eventDate,
            dateString: `${shortMonths[eventDate.getMonth()]} ${eventDate.getDate()}`
        };
    });

    const absoluteToday = new Date();
    absoluteToday.setHours(0, 0, 0, 0);

    const filteredUpcoming = parsedEvents
        .filter(ev => ev.dateObj.getTime() >= absoluteToday.getTime())
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    if (filteredUpcoming.length === 0) {
        displayBox.innerHTML = "No upcoming events scheduled.";
        return;
    }

    displayBox.innerHTML = "";
    filteredUpcoming.slice(0, 3).forEach(ev => {
        const row = document.createElement("div");
        row.className = "preview-row";
        row.innerHTML = `
            <span class="preview-row-title">${ev.title}</span>
            <span class="preview-row-date">${ev.dateString}</span>
        `;
        displayBox.appendChild(row);
    });
}
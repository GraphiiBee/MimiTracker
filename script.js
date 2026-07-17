/*bruh diddy */
/*root script.js*/

let tempUsername = "";
let isExistingUser = false;
let generatedPartnerCode = "";

document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    initAccessibility();

    /* 🌙 APPLY SAVED THEME ON LOAD */
    applySavedTheme();

    /* 📱 CREATE FLOATING MOBILE TOGGLE */
    createFloatingThemeToggle();
});

/* ---------- Auth modal open / close / reset ---------- */

function openAuthModal(){
    document.getElementById("auth-modal").classList.remove("hidden");
    resetAuthModal();
}

function closeAuthModal(){
    document.getElementById("auth-modal").classList.add("hidden");
}

function resetAuthModal(){
    document.getElementById("auth-step-1").classList.remove("hidden");
    document.getElementById("auth-step-2").classList.add("hidden");
    document.getElementById("username-input").value = "";
    document.getElementById("password-input").value = "";
    tempUsername = "";
}

/* ---------- Step 1: username ---------- */

function handleUsernameSubmit(){
    const usernameInput = document.getElementById("username-input").value.trim();

    if(!usernameInput){
        alert("Please type a username!");
        return;
    }

    tempUsername = usernameInput.toLowerCase();
    const savedUser = localStorage.getItem("user_" + tempUsername);

    document.getElementById("auth-step-1").classList.add("hidden");
    document.getElementById("auth-step-2").classList.remove("hidden");

    if(savedUser){
        isExistingUser = true;
        document.getElementById("password-title").innerText = "Welcome Back ✨";
        document.getElementById("auth-status-msg").innerText = `"${usernameInput}" already exists. Enter your password.`;
    }else{
        isExistingUser = false;
        document.getElementById("password-title").innerText = "Create Your Account 🌸";
        document.getElementById("auth-status-msg").innerText = `"${usernameInput}" is available! Create a password.`;
    }
}

/* ---------- Step 2: password ---------- */

function handlePasswordSubmit(){
    const password = document.getElementById("password-input").value.trim();

    if(!password){
        alert("Password cannot be blank!");
        return;
    }

    if(isExistingUser){
        const userData = JSON.parse(localStorage.getItem("user_" + tempUsername));

        if(userData.password === password){
            loginSuccess(tempUsername);
        }else{
            alert("Incorrect password! Try again.");
        }
    }else{
        const newUser = { username:tempUsername, password:password };
        localStorage.setItem("user_" + tempUsername, JSON.stringify(newUser));
        loginSuccess(tempUsername);
    }
}

function loginSuccess(username){
    localStorage.setItem("mimiTracker_session", username);
    closeAuthModal();
    checkSession();
}

function logout(){
    localStorage.removeItem("mimiTracker_session");
    checkSession();
}

/* ---------- Session state ---------- */

function checkSession(){
    const activeUser = localStorage.getItem("mimiTracker_session");
    const authBtn = document.getElementById("auth-btn");
    const userDisplay = document.getElementById("user-display");
    const logoutBtn = document.getElementById("logout-btn");
    const welcomeText = document.getElementById("welcome-text");
    const previews = document.getElementById("home-previews");

    if(activeUser){
        authBtn.classList.add("hidden");
        userDisplay.classList.remove("hidden");
        logoutBtn.classList.remove("hidden");
        previews.classList.remove("hidden");

        const displayName = activeUser.charAt(0).toUpperCase() + activeUser.slice(1);
        userDisplay.innerText = `🌸 Hello, ${displayName}`;
        welcomeText.innerText = `Welcome back, ${displayName} ✨`;

        renderPeriodPreview(activeUser);
        renderRemindersPreview(activeUser);
        renderTogetherPreview(activeUser);
    }else{
        authBtn.classList.remove("hidden");
        userDisplay.classList.add("hidden");
        logoutBtn.classList.add("hidden");
        previews.classList.add("hidden");
        welcomeText.innerText = "Welcome to MimiTracker ✨";
    }
}

/* ---------- Together Space modal ---------- */

function openTogetherModal(){
    document.getElementById("together-modal").classList.remove("hidden");
}

function closeTogetherModal(){
    document.getElementById("together-modal").classList.add("hidden");
}

function handleTogetherCardClick(){
    const activeUser = localStorage.getItem("mimiTracker_session");
    if(!activeUser) return;

    const isConnected = localStorage.getItem(`partner_${activeUser}`);
    if(isConnected){
        window.location.href = "TogetherSpace/index.html";
    }else{
        openTogetherModal();
    }
}

function generatePartnerCode(){
    const activeUser = localStorage.getItem("mimiTracker_session");

    if(!activeUser){
        alert("Please login first.");
        return;
    }

    generatedPartnerCode = Math.random().toString(36).substring(2,8).toUpperCase();
    localStorage.setItem(`partner_code_${activeUser}`, generatedPartnerCode);
    document.getElementById("partner-code-input").value = generatedPartnerCode;
}

function connectPartner(){
    const activeUser = localStorage.getItem("mimiTracker_session");
    const code = document.getElementById("partner-code-input").value.trim().toUpperCase();

    if(!code){
        alert("Please enter a partner code.");
        return;
    }

    localStorage.setItem(`partner_${activeUser}`, code);
    closeTogetherModal();
    window.location.href = "TogetherSpace/index.html";
}

/* ---------- Together preview ---------- */

function renderTogetherPreview(user){
    const statusText = document.getElementById("together-space-status");
    const statusBadge = document.getElementById("together-status-badge");
    if(!statusText) return;

    const isConnected = localStorage.getItem(`partner_${user}`);

    if(isConnected){
        statusText.innerHTML = "Your shared space is ready 💗 Tap to view your moments together.";
        if(statusBadge){
            statusBadge.innerText = "Connected";
            statusBadge.classList.add("connected");
        }
    }else{
        statusText.innerHTML = "Connect with someone special to unlock your shared space.";
        if(statusBadge){
            statusBadge.innerText = "Not Connected";
            statusBadge.classList.remove("connected");
        }
    }
}

/* ---------- Cycle preview ---------- */

function renderPeriodPreview(user){
    const output = document.getElementById("home-period-content");
    const history = JSON.parse(localStorage.getItem(`period_history_${user}`)) || [];

    if(history.length === 0){
        output.innerHTML = "No cycle data logged yet. Start tracking whenever you're ready 🌸";
        return;
    }

    const latest = history[0];
    const lastStart = new Date(latest.startDate + "T00:00:00");
    const today = new Date();
    today.setHours(0,0,0,0);

    const next = new Date(lastStart);
    next.setDate(next.getDate() + latest.cycleLength);

    const difference = next.getTime() - today.getTime();
    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if(days > 0){
        output.innerHTML = `Next period expected in <span class="preview-highlight">${days}</span> days.`;
    }else if(days === 0){
        output.innerHTML = `<span class="preview-highlight">🌸 Expected today.</span> Take care of yourself.`;
    }else{
        output.innerHTML = `Cycle is <span class="preview-highlight">${Math.abs(days)}</span> days late.`;
    }
}

/* ---------- Reminders preview ---------- */

function renderRemindersPreview(user){
    const box = document.getElementById("home-reminders-content");
    const reminders = JSON.parse(localStorage.getItem(`reminders_${user}`)) || [];

    if(reminders.length === 0){
        box.innerHTML = "No upcoming events yet. Add reminders anytime ✨";
        return;
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const year = today.getFullYear();
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const events = reminders.map(item => {
        let eventYear = item.year ? Number(item.year) : year;
        let date = new Date(eventYear, Number(item.month) - 1, Number(item.day));

        if(!item.year && date < today){
            date.setFullYear(year + 1);
        }

        return { title: item.title, date: date, label: `${months[date.getMonth()]} ${date.getDate()}` };
    });

    const upcoming = events.filter(e => e.date >= today).sort((a, b) => a.date - b.date).slice(0, 3);

    if(upcoming.length === 0){
        box.innerHTML = "No upcoming events scheduled.";
        return;
    }

    box.innerHTML = "";

    upcoming.forEach(event => {
        const row = document.createElement("div");
        row.className = "preview-row";
        row.innerHTML = `
            <span class="preview-row-title">${event.title}</span>
            <span class="preview-row-date">${event.label}</span>
        `;
        box.appendChild(row);
    });
}

/* ---------- Accessibility ---------- */

function initAccessibility(){
    const togetherCard = document.querySelector(".together-card");
    if(togetherCard){
        togetherCard.addEventListener("keydown", e => {
            if(e.key === "Enter" || e.key === " "){
                e.preventDefault();
                handleTogetherCardClick();
            }
        });
    }

    document.querySelectorAll(".close-btn").forEach(btn => {
        btn.addEventListener("keydown", e => {
            if(e.key === "Enter" || e.key === " "){
                e.preventDefault();
                btn.click();
            }
        });
    });
}

/* ============================================================
   🌙 LIGHT / DARK MODE SYSTEM
   ============================================================ */

/* Apply saved theme on load */
function applySavedTheme(){
    const saved = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", saved);

    const headerToggle = document.getElementById("theme-toggle");
    if(headerToggle){
        headerToggle.textContent = saved === "dark" ? "🌞" : "🌙";
    }

    const floatingToggle = document.querySelector(".floating-theme-toggle");
    if(floatingToggle){
        floatingToggle.textContent = saved === "dark" ? "🌞" : "🌙";
    }
}

/* Toggle theme */
function toggleTheme(){
    const current = document.body.getAttribute("data-theme");
    const newTheme = current === "dark" ? "light" : "dark";

    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    const headerToggle = document.getElementById("theme-toggle");
    if(headerToggle){
        headerToggle.textContent = newTheme === "dark" ? "🌞" : "🌙";
        headerToggle.classList.add("theme-animate");
        setTimeout(() => headerToggle.classList.remove("theme-animate"), 300);
    }

    const floatingToggle = document.querySelector(".floating-theme-toggle");
    if(floatingToggle){
        floatingToggle.textContent = newTheme === "dark" ? "🌞" : "🌙";
        floatingToggle.classList.add("theme-animate");
        setTimeout(() => floatingToggle.classList.remove("theme-animate"), 300);
    }
}

/* Create floating mobile toggle */
function createFloatingThemeToggle(){
    const btn = document.createElement("button");
    btn.className = "floating-theme-toggle";
    btn.textContent = document.body.getAttribute("data-theme") === "dark" ? "🌞" : "🌙";
    btn.onclick = toggleTheme;

    document.body.appendChild(btn);
}

//BMI script.js
const currentUser = localStorage.getItem("mimiTracker_session") || "guest";

// Track dynamic settings globally
let currentHeightUnit = "cm";
let currentWeightUnit = "kg";

document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();        // 🌙 Auto‑apply dark mode
    loadSavedProfile();
});

/* ============================================================
   🌙 APPLY SAVED THEME (NO toggle button)
   ============================================================ */
function applySavedTheme(){
    const saved = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", saved);
}

// Live Height Unit Switching & Instant Numerical Conversion Logic
function setHeightUnit(unit) {
    if (currentHeightUnit === unit) return;

    const input = document.getElementById("height-input");
    let val = parseFloat(input.value);

    if (!isNaN(val)) {
        if (unit === "cm") {
            input.value = Math.round(val * 30.48);
        } else {
            input.value = Number((val / 30.48).toFixed(2));
        }
    }

    currentHeightUnit = unit;

    const buttons = document.querySelectorAll("#height-toggle .toggle-btn");
    buttons[0].classList.toggle("active", unit === "cm");
    buttons[1].classList.toggle("active", unit === "ft");

    input.placeholder = unit === "cm" ? "e.g. 160" : "e.g. 5.25";
}

// Live Weight Unit Switching & Instant Numerical Conversion Logic
function setWeightUnit(unit) {
    if (currentWeightUnit === unit) return;

    const input = document.getElementById("weight-input");
    let val = parseFloat(input.value);

    if (!isNaN(val)) {
        if (unit === "kg") {
            input.value = Number((val * 0.45359237).toFixed(1));
        } else {
            input.value = Number((val / 0.45359237).toFixed(1));
        }
    }

    currentWeightUnit = unit;

    const buttons = document.querySelectorAll("#weight-toggle .toggle-btn");
    buttons[0].classList.toggle("active", unit === "kg");
    buttons[1].classList.toggle("active", unit === "lbs");

    input.placeholder = unit === "kg" ? "e.g. 50.5" : "e.g. 110.0";
}

function loadSavedProfile() {
    const savedData = JSON.parse(localStorage.getItem(`bmi_profile_${currentUser}`));
    if (savedData) {
        document.getElementById("age-input").value = savedData.age || "";

        if (savedData.heightUnit) setHeightUnit(savedData.heightUnit);
        if (savedData.weightUnit) setWeightUnit(savedData.weightUnit);

        document.getElementById("height-input").value = savedData.height || "";
    }
}

function calculateBMI() {
    const age = document.getElementById("age-input").value;
    let heightVal = parseFloat(document.getElementById("height-input").value);
    let weightVal = parseFloat(document.getElementById("weight-input").value);

    if (!age || !heightVal || !weightVal) {
        alert("Please fill out all fields!");
        return;
    }

    const profileData = {
        age: age,
        height: heightVal,
        heightUnit: currentHeightUnit,
        weightUnit: currentWeightUnit
    };
    localStorage.setItem(`bmi_profile_${currentUser}`, JSON.stringify(profileData));

    let heightInMeters = currentHeightUnit === "cm"
        ? heightVal / 100
        : heightVal * 0.3048;

    let weightInKg = currentWeightUnit === "kg"
        ? weightVal
        : weightVal * 0.45359237;

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    const finalBmi = bmi.toFixed(1);

    let status = "";
    let feedback = "";
    let color = "";

    if (bmi < 18.5) {
        status = "Underweight 🌟";
        feedback = "You're a star, make sure you fuel your lovely body with plenty of nourishing snacks today! 🍰";
        color = "#FFB7B2";
    } else if (bmi >= 18.5 && bmi < 24.9) {
        status = "Normal Weight ✨";
        feedback = "Perfect harmony! Your health stats look incredibly balanced. 💕";
        color = "#B5EAD7";
    } else if (bmi >= 25 && bmi < 29.9) {
        status = "Overweight 🌸";
        feedback = "Every body is beautiful. Focus on joyful movement and feeling vibrant. 🏃‍♀️";
        color = "#FFDAC1";
    } else {
        status = "Obese 💖";
        feedback = "Be kind to your body. Health is a journey taken one step at a time. 🥰";
        color = "#E2F0CB";
    }

    document.getElementById("bmi-number").innerText = finalBmi;

    const statusLabel = document.getElementById("bmi-status");
    statusLabel.innerText = status;
    statusLabel.style.color = (color === "#B5EAD7") ? "#4E9F7F" : "#FF9AA2";

    document.getElementById("bmi-feedback").innerText = feedback;
    document.getElementById("result-card").classList.remove("hidden");
}

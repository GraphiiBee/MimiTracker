const currentUser = localStorage.getItem("mimiTracker_session") || "guest";

// Track dynamic settings globally
let currentHeightUnit = "cm";
let currentWeightUnit = "kg";

document.addEventListener("DOMContentLoaded", () => {
    loadSavedProfile();
});

// Live Height Unit Switching & Instant Numerical Conversion Logic
function setHeightUnit(unit) {
    if (currentHeightUnit === unit) return; // Ignore clicking the already active button

    const input = document.getElementById("height-input");
    let val = parseFloat(input.value);

    // If there's an active value inside the box, convert it instantly
    if (!isNaN(val)) {
        if (unit === "cm") {
            // ft converted to cm (e.g., 50ft * 30.48 = 1524cm)
            input.value = Math.round(val * 30.48);
        } else {
            // cm converted to ft 
            input.value = Number((val / 30.48).toFixed(2));
        }
    }

    currentHeightUnit = unit;
    
    // Toggle active visual highlight CSS classes
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
            // lbs converted to kg
            input.value = Number((val * 0.45359237).toFixed(1));
        } else {
            // kg converted to lbs
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
        
        // Match her previous preference states
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

    // Save profile preferences state
    const profileData = {
        age: age,
        height: heightVal,
        heightUnit: currentHeightUnit,
        weightUnit: currentWeightUnit
    };
    localStorage.setItem(`bmi_profile_${currentUser}`, JSON.stringify(profileData));

    // Convert values safely to accurate metric scales for calculating BMI formula
    let heightInMeters = 0;
    if (currentHeightUnit === "cm") {
        heightInMeters = heightVal / 100;
    } else {
        heightInMeters = heightVal * 0.3048; // ft conversion to metric meters
    }

    let weightInKg = 0;
    if (currentWeightUnit === "kg") {
        weightInKg = weightVal;
    } else {
        weightInKg = weightVal * 0.45359237; // lbs conversion to metric kg
    }

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    const finalBmi = bmi.toFixed(1);

    let status = "";
    let feedback = "";
    let color = "";

    if (bmi < 18.5) {
        status = "Underweight 🌟";
        feedback = "You're a star, make sure you fuel your lovely body with plenty of nourishing snacks today! Don't forget to treat yourself. 🍰";
        color = "#FFB7B2";
    } else if (bmi >= 18.5 && bmi < 24.9) {
        status = "Normal Weight ✨";
        feedback = "Perfect harmony! Your health stats look incredibly balanced. Keep up the phenomenal work taking care of yourself! 💕";
        color = "#B5EAD7";
    } else if (bmi >= 25 && bmi < 29.9) {
        status = "Overweight 🌸";
        feedback = "Every body is beautiful. Focus on joyful movement and feeling vibrant rather than numbers. You're wonderful just as you are! 🏃‍♀️";
        color = "#FFDAC1";
    } else {
        status = "Obese 💖";
        feedback = "Be kind to your body. Prioritizing health is a long journey done one small step at a time. Sending lots of encouragement! 🥰";
        color = "#E2F0CB";
    }

    document.getElementById("bmi-number").innerText = finalBmi;
    
    const statusLabel = document.getElementById("bmi-status");
    statusLabel.innerText = status;
    statusLabel.style.color = (color === "#B5EAD7") ? "#4E9F7F" : "#FF9AA2";

    document.getElementById("bmi-feedback").innerText = feedback;
    document.getElementById("result-card").classList.remove("hidden");
}
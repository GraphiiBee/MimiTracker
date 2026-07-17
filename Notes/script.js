/* Notes/script.js */

const currentUser = localStorage.getItem("mimiTracker_session") || "guest";
let selectedColor = "#FFF0F2";
let attachedImageBase64 = "";

// Load dark mode if set
document.addEventListener("DOMContentLoaded", () => {
    const theme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", theme);

    setupHeader();
    setupColorPicker();
    setupImageUpload();
    renderNotes();
});

// Partner badge
function setupHeader() {
    const partnerCode = localStorage.getItem(`partner_${currentUser}`);
    const partnerName = localStorage.getItem(`partnerName_${currentUser}`);
    const statusEl = document.getElementById("partner-status");

    if (partnerName) {
        statusEl.style.display = "block";
        statusEl.innerHTML = `Connected with<br><strong>${escapeHTML(partnerName)}</strong>`;
    } else if (partnerCode) {
        statusEl.style.display = "block";
        statusEl.innerHTML = `Connected<br><strong>Code: ${escapeHTML(partnerCode)}</strong>`;
    }
}

// Auto-resize textarea
function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
}

// Color picker
function setupColorPicker() {
    const dots = document.querySelectorAll(".color-picker .color-dot");
    const creatorCard = document.getElementById("note-creator-card");

    dots.forEach(dot => {
        dot.addEventListener("click", e => {
            dots.forEach(d => d.classList.remove("active"));
            e.target.classList.add("active");

            selectedColor = e.target.getAttribute("data-color");
            creatorCard.style.backgroundColor = selectedColor;
        });
    });
}

// IMAGE UPLOAD RESTORED
function setupImageUpload() {
    const fileInput = document.getElementById("note-image");
    const previewLabel = document.getElementById("file-name-preview");

    fileInput.addEventListener("change", e => {
        const file = e.target.files[0];

        if (!file) {
            attachedImageBase64 = "";
            previewLabel.textContent = "No image selected";
            return;
        }

        if (file.size > 800000) {
            alert("Please select an image smaller than 800KB 🌸");
            fileInput.value = "";
            attachedImageBase64 = "";
            previewLabel.textContent = "No image selected";
            return;
        }

        previewLabel.textContent = file.name;

        const reader = new FileReader();
        reader.onload = event => {
            attachedImageBase64 = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Load BOTH old and new notes safely
function getSafeNotes() {
    const newKey = `notes_${currentUser}`;
    const oldKey = `mimiNotes_${currentUser}`;

    const newNotes = JSON.parse(localStorage.getItem(newKey)) || [];
    const oldNotes = JSON.parse(localStorage.getItem(oldKey)) || [];

    // Convert old notes to new format but KEEP images
    const convertedOld = oldNotes.map(note => ({
        id: note.id || Date.now(),
        content: note.content || "",
        color: note.colorHex || "#FFF0F2",
        date: note.timestamp || "",
        isShared: note.visibility === "shared",
        author: currentUser,
        image: note.image || ""
    }));

    return [...convertedOld, ...newNotes];
}

function saveNotesToStorage(notesArray) {
    const newKey = `notes_${currentUser}`;
    localStorage.setItem(newKey, JSON.stringify(notesArray));
}

function renderNotes() {
    const gridEl = document.getElementById("notes-grid");
    const notes = getSafeNotes();

    gridEl.innerHTML = "";

    if (notes.length === 0) {
        gridEl.innerHTML = `<p style="text-align:center;color:#A0A0A0;margin-top:2rem;">No notes yet. Add your first one above! ✨</p>`;
        return;
    }

    notes.sort((a, b) => b.id - a.id);

    notes.forEach(note => {
        const item = document.createElement("div");
        item.className = "note-item";
        item.style.backgroundColor = note.color;

        const badgeText = note.isShared ? "💖 Shared" : "🔒 Only Me";
        const badgeClass = note.isShared ? "shared" : "private";

        let imageHTML = "";
        if (note.image) {
            imageHTML = `
                <img src="${note.image}" class="note-attached-img" alt="Note Image">
            `;
        }

        item.innerHTML = `
            <div class="note-header">
                <span class="type-badge ${badgeClass}">${badgeText}</span>
            </div>

            <div class="note-content-text">${escapeHTML(note.content)}</div>

            ${imageHTML}

            <div class="note-footer">
                <span>${note.date}</span>
                <button class="delete-btn" onclick="deleteNote(${note.id})">×</button>
            </div>
        `;

        gridEl.appendChild(item);
    });
}

function saveNote() {
    const contentEl = document.getElementById("note-content");
    const content = contentEl.value.trim();
    const isShared = document.querySelector('input[name="note-visibility"]:checked').value === "shared";

    if (!content && !attachedImageBase64) {
        alert("Please write something or attach an image 💕");
        return;
    }

    const notes = getSafeNotes();
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const newNote = {
        id: Date.now(),
        content,
        color: selectedColor,
        date: dateStr,
        isShared,
        author: currentUser,
        image: attachedImageBase64
    };

    notes.push(newNote);
    saveNotesToStorage(notes);

    contentEl.value = "";
    contentEl.style.height = "auto";
    attachedImageBase64 = "";
    document.getElementById("note-image").value = "";
    document.getElementById("file-name-preview").textContent = "No image selected";

    renderNotes();
}

function deleteNote(noteId) {
    if (confirm("Are you sure you want to remove this note?")) {
        let notes = getSafeNotes();
        notes = notes.filter(note => note.id !== noteId);
        saveNotesToStorage(notes);
        renderNotes();
    }
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

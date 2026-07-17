/* MimiTracker – Gallery Script.js */
const currentUser = localStorage.getItem("mimiTracker_session") || "guest";

/* ============================================================
   🌸 GLOBAL STATE
   ============================================================ */
let galleryMode = "onlyme"; // onlyme | shared
let galleryTheme = "minimal"; // minimal | kawaii | film | couple

let photoboothImage = null;
let photoboothFilter = "none";
let photoboothStickers = [];
let collageItems = [];

/* ============================================================
   🌸 INITIAL LOAD
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();
    loadGallery();
    loadSharedGallery();
    switchTab("gallery");
});

/* ============================================================
   🌙 AUTO DARK MODE
   ============================================================ */
function applySavedTheme() {
    const saved = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", saved);
}

/* ============================================================
   🌸 MODE SWITCHING (Only Me / Shared)
   ============================================================ */
function switchGalleryMode(mode) {
    galleryMode = mode;

    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    if (mode === "onlyme") {
        loadGallery();
    } else {
        loadSharedGallery();
    }
}

/* ============================================================
   🌸 THEME SWITCHING
   ============================================================ */
function setGalleryTheme(theme) {
    galleryTheme = theme;
    document.body.setAttribute("data-gallery-theme", theme);
}

/* ============================================================
   🌸 TAB SWITCHING
   ============================================================ */
function switchTab(tab) {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tab === tab);
    });

    document.querySelectorAll(".tab-section").forEach(sec => {
        sec.classList.toggle("active", sec.id === `tab-${tab}`);
    });
}

/* ============================================================
   🌸 GALLERY (Only Me)
   ============================================================ */
function loadGallery() {
    const grid = document.getElementById("gallery-grid");
    grid.innerHTML = "";

    const photos = JSON.parse(localStorage.getItem(`gallery_${currentUser}`)) || [];

    photos.forEach((photo, index) => {
        const div = document.createElement("div");
        div.className = "gallery-item";

        div.innerHTML = `
            <img src="${photo.url}" class="gallery-photo">
            <div class="photo-note">${photo.note || ""}</div>
            <button class="delete-btn" onclick="deletePhoto(${index})">×</button>
        `;

        grid.appendChild(div);
    });
}

function uploadPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const photos = JSON.parse(localStorage.getItem(`gallery_${currentUser}`)) || [];
        photos.push({ url: reader.result, note: "" });
        localStorage.setItem(`gallery_${currentUser}`, JSON.stringify(photos));
        loadGallery();
    };
    reader.readAsDataURL(file);
}

function deletePhoto(index) {
    const photos = JSON.parse(localStorage.getItem(`gallery_${currentUser}`)) || [];
    photos.splice(index, 1);
    localStorage.setItem(`gallery_${currentUser}`, JSON.stringify(photos));
    loadGallery();
}

/* ============================================================
   🌸 SHARED GALLERY
   ============================================================ */
function loadSharedGallery() {
    const grid = document.getElementById("gallery-grid");
    grid.innerHTML = "";

    const sharedPhotos = JSON.parse(localStorage.getItem(`gallery_shared`)) || [];

    sharedPhotos.forEach((photo, index) => {
        const div = document.createElement("div");
        div.className = "gallery-item shared";

        div.innerHTML = `
            <img src="${photo.url}" class="gallery-photo">
            <div class="photo-note">${photo.note || ""}</div>
            <div class="shared-tag">Shared</div>
        `;

        grid.appendChild(div);
    });
}

/* ============================================================
   🌸 PHOTOBOOTH
   ============================================================ */
function loadPhotoboothImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        photoboothImage = reader.result;
        document.getElementById("photobooth-preview").src = photoboothImage;
    };
    reader.readAsDataURL(file);
}

function applyFilter(filter) {
    photoboothFilter = filter;
    const preview = document.getElementById("photobooth-preview");

    preview.className = "";
    preview.classList.add(`filter-${filter}`);
}

function addSticker(type) {
    photoboothStickers.push(type);
    // Stickers will be rendered in CSS overlay or canvas later
}

function savePhotobooth() {
    if (!photoboothImage) {
        alert("Please upload a photo first!");
        return;
    }

    const note = document.getElementById("photobooth-note").value;

    const photos = JSON.parse(localStorage.getItem(`gallery_${currentUser}`)) || [];
    photos.push({
        url: photoboothImage,
        note: note,
        filter: photoboothFilter,
        stickers: photoboothStickers
    });

    localStorage.setItem(`gallery_${currentUser}`, JSON.stringify(photos));

    alert("Photobooth photo saved! ✨");
    loadGallery();
}

/* ============================================================
   🌸 COLLAGE MAKER
   ============================================================ */
function addCollageItem(type) {
    const canvas = document.getElementById("collage-canvas");

    const item = document.createElement("div");
    item.className = "collage-item";
    item.draggable = true;

    if (type === "photo") {
        item.innerHTML = `<input type="file" accept="image/*" onchange="loadCollagePhoto(event, this)">`;
    }

    if (type === "text") {
        item.innerHTML = `<textarea class="collage-text" placeholder="Type something cute..."></textarea>`;
    }

    if (type === "sticker") {
        item.innerHTML = `<div class="collage-sticker">✨</div>`;
    }

    item.addEventListener("dragstart", dragStart);
    item.addEventListener("dragend", dragEnd);

    canvas.appendChild(item);
}

function loadCollagePhoto(event, element) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        element.parentElement.innerHTML = `<img src="${reader.result}" class="collage-photo">`;
    };
    reader.readAsDataURL(file);
}

function dragStart(e) {
    e.target.classList.add("dragging");
}

function dragEnd(e) {
    e.target.classList.remove("dragging");
}

document.getElementById("collage-canvas").addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const canvas = document.getElementById("collage-canvas");
    const rect = canvas.getBoundingClientRect();

    dragging.style.left = `${e.clientX - rect.left - 50}px`;
    dragging.style.top = `${e.clientY - rect.top - 50}px`;
});

function setCollageBg(bg) {
    const canvas = document.getElementById("collage-canvas");
    canvas.setAttribute("data-bg", bg);
}

function saveCollage() {
    alert("Collage saved! (Export feature coming soon ✨)");
}

/* ============================================================
   END
   ============================================================ */

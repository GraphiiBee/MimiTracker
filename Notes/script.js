//Notes script.js
let activeUser = "";
let selectedColorHex = "#FFF0F5";
let attachedImageBase64 = "";
let selectedVisibility = "private";

document.addEventListener("DOMContentLoaded", () => {
    activeUser = localStorage.getItem("mimiTracker_session");

    if (!activeUser) {
        alert("Please log in on the home page first! 🌸");
        window.location.href = "../index.html";
        return;
    }

    initializeColorPicker();
    initializeVisibility();
    initializeImageReader();
    renderUserNotes();
});


function escapeHTML(str) {
    if (!str) return "";

    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}



function initializeColorPicker() {

    const dots = document.querySelectorAll(".color-dot");

    dots.forEach(dot => {

        dot.addEventListener("click", e => {

            dots.forEach(d => d.classList.remove("selected"));

            e.target.classList.add("selected");

            selectedColorHex =
            e.target.getAttribute("data-color");

        });

    });

}



function initializeVisibility(){

    const options =
    document.querySelectorAll(".visibility-option");


    if(!options.length) return;


    options.forEach(option=>{

        option.addEventListener("click",()=>{

            options.forEach(o=>
                o.classList.remove("selected")
            );


            option.classList.add("selected");


            selectedVisibility =
            option.getAttribute("data-visibility");

        });

    });

}



function initializeImageReader(){

    const fileSelector =
    document.getElementById("note-image");


    const nameLabel =
    document.getElementById("file-name-preview");


    fileSelector.addEventListener("change", e=>{


        const file =
        e.target.files[0];


        if(!file){

            attachedImageBase64 = "";

            nameLabel.innerText =
            "No image selected";

            return;

        }



        if(file.size > 800000){

            alert(
            "Please select an image smaller than 800KB to keep things loading fast!"
            );


            fileSelector.value = "";

            attachedImageBase64 = "";

            nameLabel.innerText =
            "No image selected";


            return;

        }



        nameLabel.innerText =
        file.name;



        const reader =
        new FileReader();



        reader.onload = event=>{

            attachedImageBase64 =
            event.target.result;

        };


        reader.readAsDataURL(file);


    });

}




function createNewNote(){

    const titleVal =
    document.getElementById("note-title")
    .value.trim();


    const bodyVal =
    document.getElementById("note-content")
    .value.trim();



    if(!titleVal && !bodyVal && !attachedImageBase64){

        return alert(
        "Your note looks completely empty! Type something first. ✨"
        );

    }



    const storageKey =
    `mimiNotes_${activeUser}`;



    const collection =
    JSON.parse(
        localStorage.getItem(storageKey)
    ) || [];



    const now =
    new Date();



    const timeLabel =
    now.toLocaleDateString(
        "en-US",
        {
            month:"short",
            day:"numeric",
            hour:"2-digit",
            minute:"2-digit"
        }
    );



    const newNote = {

        id:
        "note_" + Date.now(),

        title:
        titleVal || "Untitled Thoughts",

        content:
        bodyVal,

        image:
        attachedImageBase64,

        colorHex:
        selectedColorHex,

        timestamp:
        timeLabel,

        visibility:
        selectedVisibility

    };



    collection.unshift(newNote);



    localStorage.setItem(
        storageKey,
        JSON.stringify(collection)
    );



    document.getElementById("note-title").value = "";

    document.getElementById("note-content").value = "";

    document.getElementById("note-image").value = "";

    document.getElementById("file-name-preview").innerText =
    "No image selected";


    attachedImageBase64 = "";

    selectedVisibility = "private";


    renderUserNotes();

}




function renderUserNotes(){

    const targetGrid =
    document.getElementById("notes-grid");


    const storageKey =
    `mimiNotes_${activeUser}`;


    let savedNotes =
    JSON.parse(
        localStorage.getItem(storageKey)
    ) || [];



    // Upgrade old notes automatically
    savedNotes =
    savedNotes.map(note=>{

        if(!note.visibility){

            note.visibility = "private";

        }

        return note;

    });



    localStorage.setItem(
        storageKey,
        JSON.stringify(savedNotes)
    );




    if(savedNotes.length === 0){

        targetGrid.innerHTML = `

        <div style="
        grid-column:1/-1;
        text-align:center;
        color:#aaa;
        padding:3rem 0;
        font-weight:600;
        ">

        Your notes board is clear!
        Write your first idea above 📝✨

        </div>

        `;

        return;

    }




    targetGrid.innerHTML = "";



    savedNotes.forEach(note=>{


        const containerBox =
        document.createElement("div");


        containerBox.className =
        "sticky-note";


        containerBox.style.backgroundColor =
        note.colorHex;




        const safeTitle =
        escapeHTML(note.title);



        const safeContent =
        escapeHTML(note.content)
        .replace(/\n/g,"<br>");




        let imageHTML = "";



        if(note.image){

            imageHTML =
            `
            <img 
            src="${note.image}"
            class="note-attached-img"
            alt="Pinned Content">
            `;

        }




        containerBox.innerHTML = `

        <div>

            <div class="note-header-row">

                <div class="note-headline">
                ${safeTitle}
                </div>


                <button 
                class="delete-note-btn"
                onclick="removeStickyNote('${note.id}')">

                &times;

                </button>

            </div>


            <div class="note-body">
            ${safeContent}
            </div>


            ${imageHTML}


        </div>


        <div class="note-timestamp">

        ${note.timestamp}

        </div>

        `;



        targetGrid.appendChild(containerBox);


    });


}




function removeStickyNote(targetId){

    if(!confirm("Delete this note permanently?"))
    return;



    const storageKey =
    `mimiNotes_${activeUser}`;



    let collection =
    JSON.parse(
        localStorage.getItem(storageKey)
    ) || [];



    collection =
    collection.filter(
        note=>note.id !== targetId
    );



    localStorage.setItem(
        storageKey,
        JSON.stringify(collection)
    );


    renderUserNotes();

}
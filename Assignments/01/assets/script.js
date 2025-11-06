console.log("Script loaded succesfully.");

// Buttons
const addButton = document.getElementById("add-button");
const listButton = document.getElementById("button-list-view");
const cardButton = document.getElementById("button-card-view");
const clearAllBtn = document.getElementById("clear-all-btn");

// Elements
const textInput = document.getElementById("text-input");
const posesList = document.getElementById("poses-list-container");
const colorPicker = document.getElementById("color-picker");

// Stats elements
const totalPosesEl = document.getElementById("total-poses");
const favoriteColorEl = document.getElementById("favorite-color");
const progressFillEl = document.getElementById("progress-fill");

// Modal elements
const modal = document.getElementById("confirm-modal");
const cancelBtn = document.getElementById("cancel-btn");
const confirmClearBtn = document.getElementById("confirm-clear-btn");

// Legend elements
const legendColorPicker = document.getElementById("legend-color-picker");
const legendTextInput = document.getElementById("legend-text-input");
const legendAddBtn = document.getElementById("legend-add-btn");
const legendItems = document.getElementById("legend-items");


// Function to update statistics
function updateStats() {
    const poses = posesList.querySelectorAll("li");
    const total = poses.length;
    totalPosesEl.textContent = total;

    // Calculate most used color based on the color-dot
    const colorCount = {};

    poses.forEach(pose => {
        const colorDot = pose.querySelector(".color-dot");
        if (!colorDot) return;

        const bgColor = window.getComputedStyle(colorDot).backgroundColor;
        if (!bgColor) return;

        colorCount[bgColor] = (colorCount[bgColor] || 0) + 1;
    });

    let maxColor = null;
    let maxCount = 0;
    for (const color in colorCount) {
        if (colorCount[color] > maxCount) {
            maxCount = colorCount[color];
            maxColor = color;
        }
    }

    if (maxColor) {
        favoriteColorEl.innerHTML = `
            <div style="
                width: 30px; 
                height: 30px; 
                background: ${maxColor}; 
                border-radius: 50%; 
                border: 2px solid rgb(160, 72, 114); 
                margin: 0 auto;
            "></div>`;
    } else {
        // Nessun colore usato: mostra una semplice icona
        favoriteColorEl.textContent = "🎨";
    }

    // Update progress bar (es. ogni 5 pose = +10%)
    const progress = Math.min((total / 5) * 10, 100);
    progressFillEl.style.width = progress + "%";
    progressFillEl.textContent = Math.round(progress) + "%";
}

// Add remove listeners to existing elements
const existingRemoveButtons = document.querySelectorAll(".remove-button");
existingRemoveButtons.forEach(button => {
    button.addEventListener("click", () => {
        button.parentElement.remove();
        updateStats();
    });
});

// Add new pose
addButton.addEventListener("click", () => {
    console.log("Add button pressed!!"); 
    const inputValue = textInput.value.trim(); 
    
    if (inputValue === "") {
        textInput.classList.add("shake");
        setTimeout(() => textInput.classList.remove("shake"), 500);
        return;
    }
    
    const selectedColor = colorPicker.value;
    
    // Create new li element
    const listElement = document.createElement("li"); 

    // Create color dot
    const colorDot = document.createElement("span");
    colorDot.classList.add("color-dot");
    colorDot.style.backgroundColor = selectedColor;

    // Create text
    const textParagraph = document.createElement("p");
    textParagraph.textContent = inputValue;
    
    // Create remove button
    const removeButton = document.createElement("button");
    removeButton.textContent = "X";
    removeButton.classList.add("remove-button");
    removeButton.addEventListener("click", () => {
        listElement.remove();
        updateStats();
    });
    
    // Append dot, text, and button to li
    listElement.appendChild(colorDot);
    listElement.appendChild(textParagraph);
    listElement.appendChild(removeButton);
    
    // Add li to list
    posesList.appendChild(listElement); 
    
    textInput.value = "";
    updateStats(); 
});

// List view
listButton.addEventListener("click", () => {
    console.log("list button pressed!!");
    posesList.classList.remove("card-view");
    posesList.classList.add("list-view");
    listButton.classList.add("active");
    cardButton.classList.remove("active");
});

// Card view
cardButton.addEventListener("click", () => {
    console.log("card button pressed!!");
    posesList.classList.remove("list-view");
    posesList.classList.add("card-view");
    cardButton.classList.add("active");
    listButton.classList.remove("active");
});

// Clear all button
clearAllBtn.addEventListener("click", () => {
    modal.style.display = "block";
});

cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

confirmClearBtn.addEventListener("click", () => {
    posesList.innerHTML = "";
    modal.style.display = "none";
    updateStats();
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

// Enter key to add pose
textInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addButton.click();
    }
});

// Legend functionality

// Add legend item
legendAddBtn.addEventListener("click", () => {
    const colorValue = legendColorPicker.value;
    const textValue = legendTextInput.value.trim();
    
    if (textValue === "") {
        legendTextInput.classList.add("shake");
        setTimeout(() => legendTextInput.classList.remove("shake"), 500);
        return;
    }
    
    // Create legend item
    const legendItem = document.createElement("div");
    legendItem.classList.add("legend-item");
    
    const colorSquare = document.createElement("div");
    colorSquare.classList.add("legend-color-square");
    colorSquare.style.backgroundColor = colorValue;
    
    const legendText = document.createElement("span");
    legendText.classList.add("legend-text");
    legendText.textContent = textValue;
    
    const removeBtn = document.createElement("button");
    removeBtn.classList.add("legend-remove-btn");
    removeBtn.textContent = "X";
    removeBtn.addEventListener("click", () => {
        legendItem.remove();
    });
    
    legendItem.appendChild(colorSquare);
    legendItem.appendChild(legendText);
    legendItem.appendChild(removeBtn);
    
    legendItems.appendChild(legendItem);
    
    // Reset inputs
    legendTextInput.value = "";
    legendColorPicker.value = "#ffffff";
});

// Enter key for legend
legendTextInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        legendAddBtn.click();
    }
});

// Inizializza le statistiche alla partenza
updateStats();

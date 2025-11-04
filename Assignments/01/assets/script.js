console.log("Script loaded succesfully.")

// Buttons
const addButton = (document.getElementById("add-button"));
const listButton = document.getElementById("button-list-view");
const cardButton = document.getElementById("button-card-view");

// Elements
const textInput = document.getElementById("text-input");
const posesList = document.getElementById("poses-list-container");

// Remove existing elements
const existingRemoveButtons = document.querySelectorAll(".remove-button");
existingRemoveButtons.forEach(button => {
    button.addEventListener("click", () => {
        button.parentElement.remove();
    });
});

// Event listeners 
// List 

// Add
addButton.addEventListener("click", () => {
    console.log("Add button pressed!!"); 
    const inputValue = textInput.value; 
    
    if (inputValue.trim() === "") {
        return;
    }
    
    console.log(textInput.value);
    
    // Color-picker selector
    const colorPicker = document.getElementById("color-picker");
    const selectedColor = colorPicker.value;
    
    // Create new li element
    const listElement = document.createElement("li"); 
    const textParagraph = document.createElement("p");
    textParagraph.textContent = inputValue;
    
    // Apply personalized background color
   listElement.style.backgroundColor = selectedColor;

    // Create new remove button
    const removeButton = document.createElement("button");
    removeButton.textContent = "X";
    removeButton.classList.add("remove-button");
    removeButton.addEventListener("click", () => {
        listElement.remove();
    });
    
    // Add element and button to li
    listElement.appendChild(textParagraph);
    listElement.appendChild(removeButton);
    
    // Add li to list
    posesList.appendChild(listElement); 
    
    textInput.value = ""; 
});

// List
listButton.addEventListener("click", () => {
    console.log("list button pressed!!")
    posesList.classList.remove("card-view");
    posesList.classList.add("list-view");
});

// Card
cardButton.addEventListener("click", () => {
    console.log("card button pressed!!")
    posesList.classList.remove("list-view");
    posesList.classList.add("card-view");
});
// Buttons
const addButton = (document.getElementById("add-button"));
const listButton = document.getElementById("list-view-button");
const cardButton = document.getElementById("card-view-button");

// Elements
const taskInput = document.getElementById("task-input");
const objectList = document.getElementById("objects-list-container");

// Event listeners 
// List 

// Add
// this basically tels java to keep count everytime someone clicks the button specified. it can do other things too, in this case we chose the click 
addButton.addEventListener("click", () => {
    console.log("Add button pressed!!"); // to try and see if it takes it properly 
    const inputValue = taskInput.value; 
    console.log(taskInput.value); //this goes to take the input box, if you write .value you can access to the content that has been written to the box
    const listElement = document.createElement("li"); // this creates the listElement and tells him that it has to add a new element to the box
    listElement.innerHTML = inputValue; //here you tell the listElement to create the new element from the input value inserted by the user 
    objectList.appendChild(listElement); //here you are telling java where it has to put the new element created from the input
    taskInput.value = ""; 

})

// List
// here we're telling it to change from list to card view by pointing that when it shows card cannot show list and viceversa
listButton.addEventListener("click", () => {
    console.log("list button pressed!!")
    objectList.classList.remove("card-view");
    objectList.classList.add("list-view");


})

cardButton.addEventListener("click", () => {
    console.log("card button pressed!!")
    objectList.classList.remove("list-view");
    objectList.classList.add("card-view");
})


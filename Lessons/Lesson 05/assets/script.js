//console.log('ciao')


//const HOBBIES = ["Judo", "Box", "Cycling", "Swimming"] // this is a creation of an array of elements
// console.log(HOBBIES.length) // this will display the content of my array on the browser. 
// If you add the .lenght in the end, you will see the total number of the elements of the array
// console.log(HOBBIES[0]) //this will select the first element of the array 
//const PERSON = {
    //name: "Sasha", 
    //lastname: "Bravo", 
    //hobbies: ["Judo", "Box", "Cycling", "Swimming"]
//}                   //this is the object
//console.log(PERSON) //this logs the whole object that we created above with all the 

//console.log(PERSON.name) //this way we will see the name displayed 

//console.log(PERSON.hobbies[0]) //this will display the first element of the array hobbies 
//console.log(PERSON.hobbies) //this will display all the array 

const CONTAINER = document.getElementById('container') //this creates a new element that has to be added also on the html



//for (hobby of PERSON.hobbies){
   // console.log(hobby)
// }
// this is a loop that starts from an array (hobbies) and it creates a temporary variable "hobby". once you create this temporary variable you can use it to console.log something within the html.
//it will print line by line all the items that are inside the array 

// for (hobby of PERSON.hobbies) {
    //const ITEM = document.createElement('li');
    //ITEM.textContent = hobby; // you can only add the text 
    // ITEM.innerHTML = hobby; //inside this property you can include not only the text as they come from the array but you can add other html elements 

    //CONTAINER.appendChild(ITEM); //this will add a list as if it was added from the html 

// }
//this would create two new elements on the html 

const CONTAINER = document.getElementById('container') //this creates a new element that has to be added also on the html



fetch('./assets/data/data.json') // get the data from an external source
  .then(response => response.json()) // parse/convert the data in JavaScript format
  .then(data => displayData(data)) // dispay the data in the console - always keep this function so the page can show the data
  .catch(error => displayError(error)); // display an error if the data cannot be loaded - always keep this part so that if there's the error the screen will show this error in case the data is not available

function displayData(data){
    console.log(data)

    let counter = 0; // it will display the count of the total elements in the array

    for (hobby of data.hobbies) {
        
        counter += 1;
        const ITEM = document.createElement('li');
        ITEM.textContent = `$(counter): $(hobby)`;

       CONTAINER.appendChild(ITEM);

    }
} //this substitutes the .then console.log(data) but does the same

function displayError(error){
    console.log(error)
} //this kinda substitutes the .then console.log(error) but does the same
const API_KEY = '22b93325153114d754cae534e2426ec1'
const API_URL = "https://api.openweathermap.org/data/2.5/forecast?lat=42.2&lon=2.16&units=metric&appid=" + API_KEY

fetch(API_URL) // code to extract the data
  .then(response => response.json())  // then you tell to your script that your specific data has a format, in this case the json. It's parcing (?) the file it has 
  .then(data => showData(data)) // this is a basic function to show the data. Visible in the console but not desplayed in the page. 
  .catch(error => showError(error)); // this tells the console what to show if there's some error with the code or with the extraction of the API

 function showData(data){
  // console.log(data)

  const weatherData = data.list;
  console.log(weatherData)

  for (let item of weatherData){

      const temperature = item.main.temp;
      const tempFix = (temperature + 2) * 20; // PROBLEM HERE; BARS APPEAR INFINITE, FIX!
      const time = item.dt_txt.substring(0, 16);

      const listItem = document.createElement('li');
      listItem.textContent = `${time} : ${temperature}`; // this to call and display two variables, in this case time and temperature 

      let bgColor = tempToHSL (temperature);
      // if (temperature <= 0) {
      //   bgColor = 'blue'
      // }


      const tempBar = document.createElement('div'); // this creates a bar that will demonstrate the temperature as a visual element
      tempBar.classList.add ('bar');
      tempBar.style.width = `${tempFix}px`; // this tells it to make the width (only dependent variable for the bar) according to the temperature (data)
      tempBar.style.backgroundColor = bgColor;

      listItem.appendChild(tempBar);
      CONTAINER.appendChild(listItem);

  }

 }

 function showError(error){
  console.log(error)
 }

 function tempToHSL(temp, minTemp = -5, maxTemp = 30){ // we need the first variable (temperature), then we need the parameter from the color wheel (from 0 to 360)
  // we specify the parameter directly in the function 

    temp = Math.max(minTemp, Math.min(maxTemp, temp))

    const hue = ((maxTemp - temp) / (maxTemp - minTemp)) * 240;

    return `hsl(${hue}, 80%, 50%)`;
    
 }
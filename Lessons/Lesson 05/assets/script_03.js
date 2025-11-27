const API_KEY = '80d1993378fa9e47ffc9c7fec53fe1d2'
const coordinates =  [42.2244, 2.1686];
const API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates[0]}&lon=${coordinates[1]}&units=metric&appid=${API_KEY}`

fetch(API_URL)
  .then(response => response.json()) 
  .then(data => displayData(data))
  .catch(error => displayError(error));

  function displayData(data){

    const FORECAST = data.list;
    const cityName = data.city && data.city.name ? data.city.name : 'Campdevanol';

    console.log(data.list[12])

    for (let item of FORECAST){

        const DATE_TIME = item.dt_txt;
        const DATE = DATE_TIME.substring(0,10) // this will show only a part of that string, from 0, to 10 position

        const TIME = DATE_TIME.substring(11,13)
        
        const TEMP = item.main.temp;

        //console.log(DATE, TIME, TEMP)

    }

  }

  function displayError(error){
    console.log(error)

  }
// ==== SELECTING HTML ELEMENTS ====

// Input field where the user types the city name
const cityInput = document.querySelector('.city_input')

// Search button the user clicks to get the weather
const searchBtn = document.querySelector('.search_button')

// Sections for displaying result, error, or instructions
const notFoundSection = document.querySelector('.not-found')
const searchCitySection = document.querySelector('.search-city')
const weatherInfoSection = document.querySelector('.weather_info')

// Text and image areas to display weather data
const countryTxt = document.querySelector('.country_txt')
const tempTxt = document.querySelector('.temp_txt')
const conditionTxt = document.querySelector('.condition_txt')
const humidityValueTxt = document.querySelector('.humidity-value-txt')
const windValueTxt = document.querySelector('.wind-value-txt')
const weatherSummaryImg = document.querySelector('.weather_summary_img')
const currentDateTxt = document.querySelector('.current_date_txt')

// Container for future forecast items
const forecastItemContainer = document.querySelector('.forecast-items-container')

// === API KEY ===
const apiKey = config.weatherApiKey;

// ==== EVENT LISTENERS ====

// When the search button is clicked
searchBtn.addEventListener('click', () =>{
    if (cityInput.value.trim() != ''){
        updateWeatherInfo(cityInput.value)  // call main function
        cityInput.value = ''
        cityInput.blur()    // remove focus from input field
    }
})

// When user presses Enter key inside the input field
cityInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' && cityInput.value.trim() != ''){
            updateWeatherInfo(cityInput.value)
            cityInput.value = ''
            cityInput.blur()
    }
})


// ==== FETCHING DATA FROM OPENWEATHER API ====

// This function builds the API URL and fetches data
async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;

    const response = await fetch(apiUrl)

    return response.json()  // convert response to JavaScript object
}

// ==== ICON MAPPING FUNCTION ====

// Maps weather condition IDs to icon filenames
function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg'
    if (id <= 321) return 'drizzle.svg'
    if (id <= 531) return 'rain.svg'
    if (id <= 622) return 'snow.svg'
    if (id <= 781) return 'atmosphere.svg'
    if (id == 800) return 'clear.svg'
    if (id >= 801 && id <= 804) return 'clouds.svg'
}

// ==== DATE FORMATTER ====

// Returns the current date in a readable format like "Sun, 29 Jun"
function getCurrentDate() {
    const currentDate = new Date()
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }

    return currentDate.toLocaleDateString('en-GB', options)
    
}

// ==== MAIN WEATHER UPDATE FUNCTION ====

// Gets current weather and forecast, and displays them
async function updateWeatherInfo(city) {
    
    let weatherData

    try {
        weatherData = await getFetchData('weather', city)
        
        if (weatherData.cod != 200){
            showDisplaySection(notFoundSection)
            return
        }   
    } 
    catch (error) {
        showDisplaySection(notFoundSection)
        console.error("Error fetching weather:", error)
        return
    }
    
    
    // Destructure the important weather fields from API response
    const {
        name: country,
        main: {temp, humidity},
        weather: [{id, main}],
        wind: {speed}
    } = weatherData

     // Update UI with current weather
    countryTxt.textContent = country
    tempTxt.textContent = Math.round(temp) + ' °C'
    conditionTxt.textContent = main
    humidityValueTxt.textContent = humidity
    windValueTxt.textContent = speed + ' M/s'

    currentDateTxt.textContent = getCurrentDate()
    weatherSummaryImg.src = `assets/assets/weather/${getWeatherIcon(id)}`

    // Get 5-day forecast
    await updateForecastsInfo(city) 

    // Show the weather section
    showDisplaySection(weatherInfoSection)
    
}

// ==== FETCH & DISPLAY 5-DAY FORECAST ====

// Pulls forecast data and displays items only for 12:00 PM each day
 async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city)

    const timeTaken = '12:00:00'
    const todayDate = new Date().toISOString().split('T')[0]

    // Clear old forecast items
    forecastItemContainer.innerHTML = ''

    // Filter for 12:00 forecasts (except today)
    forecastsData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && 
        !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastItems(forecastWeather)  
        }
    })
}

// ==== DISPLAY SINGLE FORECAST CARD ====

// Creates and inserts HTML for each forecast item
function  updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData

    const dateTaken = new Date(date)
    const dateOption = {
        day:  '2-digit',
        month: 'short'
    }

    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption)
    const forecastItem =  `
            <div class="forecast-item">
                <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
                <img src="assets/assets/weather/${getWeatherIcon(id)}" alt="" class="forecast-item-img">
                <h5 class="forecast-item-temp">${Math.round(temp)}</h5>
            </div>
    `

    forecastItemContainer.insertAdjacentHTML('beforeend', forecastItem)



}

// ==== SWITCH BETWEEN SECTIONS ====

// Only show the relevant section (weather or error or default)
function showDisplaySection(section) {

    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(section => section.style.display = 'none')

        section.style.display = 'flex'
}
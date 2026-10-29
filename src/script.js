import "./style.css";

const LogicControl = (() => {

    function buildWeatherUrl( location, unit) {
        const VISUAL_CROSSING_API_KEY = "8HAYQZXGHJMCPF64NPA7YVDP9";
        let url =
            "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/" + encodeURIComponent(location);



        const params = new URLSearchParams({
            unitGroup: `${unit}`,
            include: "current,hours,days",
            elements: "datetime,description,temp,humidity,windspeed,conditions,uvindex,icon,tempmin,tempmax",
            key: `${VISUAL_CROSSING_API_KEY}`,
            contentType: "json"
        });

        return `${url}?${params}`;
    }

    const getLocationData = async (location, unit) => {
        const url = buildWeatherUrl(location, unit)
        try {
            const result = await fetch(url);
            const locationData = await result.json();
            return locationData;
        }catch(e){
            console.error(e);
        }
    } 

    const gliphyWeatherStickers = async(query) => {
        const GLIPHY_API_KEY = "7TemOoRGitdPRLlpbsGaJjc8N2b0dERd"; 
        const GLIPHY_API_URL = `https://api.giphy.com/v1/stickers/search?api_key=${GLIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1`

        try{
            const response = await fetch(GLIPHY_API_URL);
            const data = await response.json();
            return data.data[0].images.original.url;

        }catch(e){
            console.error("Erreur Giphy:", e);
            return null;
        }     
    }
    
    return {buildWeatherUrl, getLocationData, gliphyWeatherStickers}

})() 

const DomControl = (() => {

    const toggleLoading = (isLoading) => {
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.textContent = isLoading ? "Searching..." : "Search"
        }
    };

    const toggleTempUnit = (unit) => {
        const fareinheitUnitBtn = document.getElementById("temp-unit-fareinheit");
        const celciusUnitBtn = document.getElementById("temp-unit-celcius")

        if (unit === "metric"){
            celciusUnitBtn.setAttribute("class", "active-unit")
            fareinheitUnitBtn.removeAttribute("class", "active-unit")
        }else if (unit === "us"){
            fareinheitUnitBtn.setAttribute("class", "active-unit")
            celciusUnitBtn.removeAttribute("class", "active-unit")
        }
    }

    const displayWeather = async (weather, unit) => {
        if (!weather || !weather.currentConditions) return;

        const tempUnit = unit === "metric" ? " °C" : " °F"

        const activeLocation = document.getElementById('active-location-search');
        const acticeLocationTimezone = document.getElementById('active-location-timezone'); // Note : "actice" garde la faute de frappe du HTML

        const currentWeatherTemp = document.getElementById('current-weather-temp');
        const currentWeatherDesc = document.getElementById('current-weather-desc');
        const generalConditionsInView = document.getElementById('general-conditions-in-view');

        const windSpreed = document.getElementById("wind-indicator");
        const humidity = document.getElementById("humidity-indicator");
        const uv = document.getElementById("uv-index-indicator");

        activeLocation.textContent = weather.address;
        acticeLocationTimezone.textContent = weather.timezone;

        currentWeatherTemp.textContent = weather.currentConditions.temp + tempUnit;
        currentWeatherDesc.textContent = weather.days[0].description;

        const generalConditionsInViewImg = document.createElement("img")
        generalConditionsInViewImg.setAttribute("id", "general-conditions-in-view-img");

        const weatherCondition =  weather.currentConditions.conditions;
        const imgUrl = await LogicControl.gliphyWeatherStickers(weatherCondition)
        generalConditionsInViewImg.src = imgUrl;
        generalConditionsInView.textContent = ""
        generalConditionsInView.append(generalConditionsInViewImg)

        windSpreed.textContent = weather.currentConditions.windspeed;
        humidity.textContent = weather.currentConditions.humidity;
        uv.textContent = weather.currentConditions.uvindex;

        const forecastElem = document.querySelector(".forecast-list");
        forecastElem.innerHTML = "";

        const days = weather.days.slice(1, 8);
        for (const day of days) {
            const forecastDay = document.createElement("div")
            const ds = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            forecastDay.setAttribute("class", "forecast-day")

            const forecastDayName = document.createElement("span")
            forecastDayName.setAttribute("class", "day-name")
            const forecastDayIcon = document.createElement("img")

            const d = new Date(day.datetime);
            forecastDayName.textContent = ds[d.getDay()];

            //forecastDayName.textContent = day.datetime.getDate();
            const icon = await LogicControl.gliphyWeatherStickers(day.icon)
            forecastDayIcon.src = icon;
            forecastDayIcon.setAttribute("class", "day-icon")

            const forecastDayTemps = document.createElement("div")
            forecastDayTemps.setAttribute("class", "forecast-day-temps")
            forecastDayTemps.style.display = "flex";

            forecastDayTemps.innerHTML = `${day.tempmin} ${tempUnit}  /  ${day.tempmax} ${tempUnit}`

            forecastDay.appendChild(forecastDayName)
            forecastDay.appendChild(forecastDayIcon)
            forecastDay.appendChild(forecastDayTemps)

            forecastElem.append(forecastDay)
        }
   
    }
    return {displayWeather, toggleLoading, toggleTempUnit}
})()

const MainApp = (() => {
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("location-search");

    //save the searched location
    let location = "antarctic";
    
    const search = async(loc, unit="metric") => {
        if (loc){
            DomControl.toggleLoading(true);
            try{
                const weather = await LogicControl.getLocationData(loc, unit);
                if (weather){
                    await DomControl.displayWeather(weather, unit)
                }
            }catch(e){
                throw new Error(e)
            }finally {
                DomControl.toggleLoading(false)
            }     
        }
    }
    //default 
    
    DomControl.toggleTempUnit("metric")
    search(location)

    searchBtn.addEventListener("click", () => {
        location = searchInput.value;
        DomControl.toggleTempUnit("metric")
        search(location);
        searchInput.value = "";
    })

    const fareinheitUnitBtn = document.getElementById("temp-unit-fareinheit");
    const celciusUnitBtn = document.getElementById("temp-unit-celcius")

    fareinheitUnitBtn.addEventListener("click", () => {
        DomControl.toggleTempUnit("us")
        search(location, "us");
    })

    celciusUnitBtn.addEventListener("click", () =>{
        DomControl.toggleTempUnit("metric")
        search(location);
    })

})() 
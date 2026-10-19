const LogicControl = (() => {

    //const GLIPHY_API_KEY = "7TemOoRGitdPRLlpbsGaJjc8N2b0dERd"; 
    //const GLIPHY_URL = "https://api.giphy.com/v1/stickers/random?api_key="


    function buildWeatherUrl( location, startDate, endDate) {
        const VISUAL_CROSSING_API_KEY = "8HAYQZXGHJMCPF64NPA7YVDP9";
        let url =
            "https://weather.visualcrossing.com/" +
            "VisualCrossingWebServices/rest/services/timeline/" +
            encodeURIComponent(location);

        if (startDate) {
            url += "/" + encodeURIComponent(startDate);
        }

        if (startDate && endDate) {
            url += "/" + encodeURIComponent(endDate);
        }

        const params = new URLSearchParams({
            unitGroup: "us",
            include: "current,days",
            elements: "datetime,tempmax,tempmin,precip,precipprob,conditions",
            key: `${VISUAL_CROSSING_API_KEY}`,
            contentType: "json"
        });

        return `${url}?${params}`;
    }

    const getLocationData = async (location, startDate, endDate) => {
        const url = buildWeatherUrl(location, startDate, endDate)
        try {
            const result = await fetch(url);
            const locationData = await result.json();
            console.log(locationData)
            return locationData;
        }catch(e){
            console.error(e);
        }
    } 
    
    return {buildWeatherUrl, getLocationData}

})() 

const DomControl = (() => {

    const displayWeather = (weather) => {
        const location =
        document.getElementById(
            "weather-location"
        );
    
        const results =
        document.getElementById(
            "weather-results"
        );
    
        location.textContent =
        `Weather for ${weather.resolvedAddress}`;
    
        results.innerHTML = "";
    
        weather.days.slice(0, 5).forEach(day => {
        const item =
            document.createElement("div");
    
        const date =
            document.createElement("h3");
    
        const conditions =
            document.createElement("p");
    
        const temperatures =
            document.createElement("p");
    
        date.textContent =
            day.datetime;
    
        conditions.textContent =
            day.conditions ?? "";
    
        temperatures.textContent =
            `High: ${day.tempmax}°, ` +
            `Low: ${day.tempmin}°`;
    
        item.appendChild(date);
        item.appendChild(conditions);
        item.appendChild(temperatures);
    
        results.appendChild(item);
        });
    }

    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("location-search");

    searchBtn.addEventListener("click", () => {
        const location = searchInput.value;
        if (location){
            //
            searchInput.value = "";
        }
    })
    

})()

const MainApp = (() => {
    //const weather = GetLocationWeather.getLocationData("dakar");
})()
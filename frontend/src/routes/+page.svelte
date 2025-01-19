<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { fade, slide, scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import Chart from 'chart.js/auto';

    import LocationSearch from './LocationSearch.svelte';
    import WeatherForecast from './WeatherForecast.svelte';
    import SolarDataSection from './SolarDataSection.svelte';
    import WeatherModal from './WeatherModal.svelte';
    import LocationMap from './LocationMap.svelte';

    // Weather and solar data
    let weatherData = [];
    let solarData = [];
    let loading = true;
    let error = null;
    let searchLocation = '';
    let currentLocation = { lat: 33.7490, lon: -84.3880, name: 'Atlanta, GA' };
    let selectedDay = null;
    let showModal = false;
    let selectedDate = new Date().toISOString().slice(0, 10);
    let loadingIrradiance = false; // Add this line
    let lastWorkingLocation = null; // Add this line

    // Weather icons
    const weatherIcons = {
        'Clear': '☀️',
        'Sunny': '☀️',
        'Mostly Clear': '🌤️',
        'Partly Cloudy': '⛅',
        'Mostly Cloudy': '🌥️',
        'Cloudy': '☁️',
        'Rain': '🌧️',
        'Light Rain': '🌧️',
        'Heavy Rain': '⛈️',
        'Showers': '🌦️',
        'Scattered Showers': '🌦️',
        'Snow': '❄️',
        'Light Snow': '🌨️',
        'Heavy Snow': '⛄',
        'Thunderstorm': '⛈️',
        'Windy': '💨',
        'Fog': '🌫️',
        'Haze': '🌫️',
        'Partly Sunny': '🌤️',
        'Mostly Sunny': '🌤️',
        'Rain and Snow': '🌨️',
        'Sleet': '🌨️'
    };

    function getWeatherIcon(forecast) {
        // Try exact match first
        if (weatherIcons[forecast]) {
            return weatherIcons[forecast];
        }
        
        // Try partial match
        const key = Object.keys(weatherIcons).find(k => 
            forecast.toLowerCase().includes(k.toLowerCase())
        );
        
        return key ? weatherIcons[key] : '🌈';
    }

    async function geocodeLocation() {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                currentLocation = {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    name: data[0].display_name
                };
                
                // Reset and fetch data
                loading = true;
                error = null;
                await Promise.all([
                    fetchWeatherData(), 
                    fetchSolarIrradiance()
                ]);
                loading = false;
            } else {
                error = 'Location not found. Please try again.';
            }
        } catch (err) {
            error = 'Failed to geocode location';
            console.error(err);
        }
    }

    async function fetchWeatherData() {
        try {
            const { lat, lon } = currentLocation;
            
            const pointsResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
            const pointsData = await pointsResponse.json();
            
            const forecastResponse = await fetch(pointsData.properties.forecast);
            const forecastData = await forecastResponse.json();
            
            weatherData = forecastData.properties.periods.slice(0, 11); // Today + 10 days
            return true;
        } catch (err) {
            error = 'Failed to fetch weather data';
            console.error(err);
            return false;
        }
    }

    async function fetchSolarIrradiance() {
        try {
            const { lat, lon } = currentLocation;
            const apiKey = 'x4Q6drs0JqPZ1anlzvB1PDbQjesbJ32H9RVN5xPz';
            
            const response = await fetch(
                `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${apiKey}&lat=${lat}&lon=${lon}`
            );
            
            const data = await response.json();
            
            const monthNames = {
                'jan': 'January', 'feb': 'February', 'mar': 'March', 
                'apr': 'April', 'may': 'May', 'jun': 'June', 
                'jul': 'July', 'aug': 'August', 'sep': 'September', 
                'oct': 'October', 'nov': 'November', 'dec': 'December'
            };
            
            if (data.outputs) {
                solarData = {
                    "Annual Average": data.outputs.avg_dni.annual,
                    ...Object.entries(data.outputs.avg_dni.monthly).reduce((acc, [month, value]) => ({
                        ...acc,
                        [monthNames[month.toLowerCase()]]: value
                    }), {})
                };
                lastWorkingLocation = { ...currentLocation };
                return true;
            }
            return false;
        } catch (err) {
            error = 'Failed to fetch solar irradiance data';
            console.error(err);

            location.reload();
            return false;
        }
    }

    async function handleMapLocationChange({ lat, lon }) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );
            const data = await response.json();
            
            if (data) {
                const newLocation = {
                    lat,
                    lon,
                    name: data.display_name
                };

                loadingIrradiance = true; // Add this
                
                // Try fetching both data types
                const [weatherSuccess, solarSuccess] = await Promise.all([
                    fetchWeatherData(),
                    fetchSolarIrradiance()
                ]);

                // Only update the location if at least weather data worked
                if (weatherSuccess) {
                    currentLocation = newLocation;
                    if (!solarSuccess && lastWorkingLocation) {
                        // Silently revert to last working location for solar data
                        await fetchSolarIrradiance();
                    }
                }
                
                loadingIrradiance = false; // Add this
            }
        } catch (err) {
            error = 'Failed to get location info';
            console.error(err);
            loadingIrradiance = false; // Add this
        }
    }

    function handleSearch(e) {
        e.preventDefault();
        if (searchLocation.trim()) {
            geocodeLocation();
        }
    }

    function openModal(day) {
        selectedDay = day;
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        selectedDay = null;
    }

    onMount(async () => {
        await Promise.all([
            fetchWeatherData(), 
            fetchSolarIrradiance()
        ]);
        loading = false;
    });
</script>

<svelte:window on:keydown={(e) => {
    if (e.key === 'Escape' && showModal) {
        closeModal();
    }
}}/>

<main class="container">
    <div class="background-gradient"></div>
    
    <LocationSearch 
        bind:searchLocation 
        {handleSearch}
    />

    {#if loading}
        <div class="loading-container" in:fade>
            <div class="loading-spinner"></div>
            <p>Loading weather and solar data...</p>
        </div>
    {:else if error}
        <p class="error glass" in:slide={{duration: 300}}>{error}</p>
    {:else}
        <h2 class="" in:slide={{duration: 300, delay: 100}}>
            Weather for {currentLocation.name}
        </h2>
        
        <LocationMap 
            lat={currentLocation.lat} 
            lon={currentLocation.lon}
            onLocationChange={handleMapLocationChange}
        />
        
        <div class="weather-section" in:fade={{duration: 400, delay: 200}}>
            <WeatherForecast 
                {weatherData} 
                {openModal} 
                {getWeatherIcon}
            />
        </div>

        {#if solarData && Object.keys(solarData).length > 0}
            <SolarDataSection 
                bind:solarData 
                bind:selectedDate
                {loadingIrradiance}
                {weatherData}
            />
        {/if}

        <WeatherModal 
            bind:showModal 
            bind:selectedDay 
            {closeModal} 
            {getWeatherIcon}
        />
    {/if}
</main>

<style>
    /* Add at the top of existing styles */
    :global(.glass) {
        position: relative;
        overflow: hidden;
    }

    :global(.glass::before) {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 200%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.01),
            transparent
        );
        transition: 0.5s;
        pointer-events: none;
    }

    :global(.glass:hover::before) {
        left: 100%;
    }

    .background-gradient {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
            radial-gradient(circle at 0% 0%, rgba(76, 0, 255, 0.15), transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(76, 0, 255, 0.15), transparent 50%);
        z-index: 0;
        pointer-events: none;
    }

    :global(body) {
        margin: 0;
        min-height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: #e9ecef;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
    }

    :global(html) {
        min-height: 100vh;
        background: #1a1a2e;
    }

    .container {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        font-family: 'Inter', system-ui, sans-serif;
        flex: 1;
        overflow-y: auto;
    }

    .glass {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    }

    .location-search {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        margin-bottom: 2rem;
    }

    .location-search input {
        flex-grow: 1;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        color: #e9ecef;
        transition: all 0.3s ease;
    }

    .location-search input:focus {
        outline: none;
        background: rgba(255, 255, 255, 0.15);
    }

    .location-search button {
        padding: 0.75rem 1.5rem;
        background: rgba(76, 0, 255, 0.6);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .location-search button:hover {
        background: rgba(76, 0, 255, 0.8);
        transform: translateY(-1px);
    }

    .title {
        padding: 1rem 2rem;
        margin-bottom: 2rem;
        text-align: center;
    }

    .forecast-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
    }

    .forecast-card {
        padding: 1.5rem;
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
    }

    .forecast-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        background: rgba(255, 255, 255, 0.08);
    }

    .weather-icon {
        font-size: 3rem;
        margin: 1rem 0;
    }

    .temperature {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0.5rem 0;
    }

    .forecast {
        color: #adb5bd;
    }

    .details-icon {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        color: rgba(255, 255, 255, 0.5);
        transition: all 0.2s ease;
    }

    .forecast-card:hover .details-icon {
        color: rgba(255, 255, 255, 0.8);
        transform: scale(1.1);
    }

    .solar-section {
        padding: 2rem;
        margin-top: 3rem;
    }

    .chart-container {
        width: 100%;
        max-width: 800px;
        height: 400px;
        margin: 20px auto;
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 20px;
    }

    .solar-data-table {
        width: 100%;
        max-width: 800px;
        margin: 20px auto;
        border-collapse: collapse;
    }

    .solar-data-table th, 
    .solar-data-table td {
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 10px;
        text-align: left;
    }

    .interpolator-controls {
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        z-index: 10;
    }

    .date-picker {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .date-picker input {
        padding: 0.5rem;
        border: none;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.1);
        color: #e9ecef;
        font-family: inherit;
    }

    .date-picker input:focus {
        outline: none;
        background: rgba(255, 255, 255, 0.15);
    }

    .interpolated-value {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.9rem;
    }

    .interpolated-value strong {
        font-size: 1.1rem;
        color: rgba(76, 0, 255, 0.8);
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        margin: 4rem 0;
    }

    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top: 3px solid rgba(76, 0, 255, 0.6);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .error {
        color: #ff6b6b;
        text-align: center;
        padding: 1rem 2rem;
        margin: 2rem 0;
    }

    details {
        margin-top: 1rem;
    }

    summary {
        cursor: pointer;
        color: #adb5bd;
    }

    pre {
        margin-top: 0.5rem;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        font-size: 0.8rem;
        white-space: pre-wrap;
    }

    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        position: relative;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 2rem;
    }

    .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        color: #e9ecef;
        font-size: 2rem;
        cursor: pointer;
        padding: 0.5rem;
        line-height: 1;
        transition: transform 0.2s;
    }

    .close-button:hover {
        transform: scale(1.1);
    }

    .modal-content {
        margin-top: 1rem;
    }

    .modal-weather-info {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin: 2rem 0;
    }

    .modal-icon {
        font-size: 4rem;
    }

    .modal-main-info {
        flex: 1;
    }

    .modal-temp {
        font-size: 2.5rem;
        font-weight: bold;
        margin: 0;
    }

    .modal-forecast {
        font-size: 1.2rem;
        color: #adb5bd;
        margin: 0.5rem 0;
    }

    .modal-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
        padding: 1.5rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .detail-label {
        color: #adb5bd;
        font-size: 0.9rem;
    }

    .detail-value {
        font-size: 1.2rem;
        font-weight: 500;
    }

    .detailed-forecast {
        margin-top: 2rem;
        line-height: 1.6;
    }

    .detailed-forecast h3 {
        margin-bottom: 1rem;
        color: #e9ecef;
    }

    .detailed-forecast p {
        color: #adb5bd;
    }
</style>
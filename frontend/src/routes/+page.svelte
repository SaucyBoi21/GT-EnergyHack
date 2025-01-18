<script>
    import { onMount } from 'svelte';

    // Weather and solar data
    let weatherData = [];
    let solarData = [];
    let hourlyIrradianceData = [];
    let loading = true;
    let error = null;
    let searchLocation = '';
    let currentLocation = { lat: 33.7490, lon: -84.3880, name: 'Atlanta, GA' };

    // Comprehensive weather icons mapping
    const weatherIcons = {
        'Clear': '☀️',
        'Sunny': '☀️',
        'Partly Cloudy': '⛅',
        'Mostly Cloudy': '🌥️',
        'Cloudy': '☁️',
        'Rain': '🌧️',
        'Showers': '🌧️',
        'Snow': '❄️',
        'Thunderstorm': '⛈️',
        'Windy': '💨',
        'Fog': '🌫️',
        'Haze': '🌫️'
    };

    async function geocodeLocation() {
        try {
            // Use OpenStreetMap Nominatim for free geocoding
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
                
                // Reset and fetch all data
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
        } catch (err) {
            error = 'Failed to fetch weather data';
            console.error(err);
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
            
            // Extract annual and monthly solar data
            solarData = [
                { 
                    month: 'Annual Average', 
                    value: data.outputs.avg_dni.annual 
                },
                ...Object.entries(data.outputs.avg_dni.monthly).map(([month, value]) => ({ 
                    month, 
                    value 
                }))
            ];
        } catch (err) {
            error = 'Failed to fetch solar irradiance data';
            console.error(err);
        }
    }

    onMount(async () => {
        await Promise.all([
            fetchWeatherData(), 
            fetchSolarIrradiance(), 
        ]);
        loading = false;
    });

    // Helper to get detailed weather description
    function getDetailedWeatherInfo(day) {
        return `
            Detailed Forecast: ${day.detailedForecast}
            Chance of Precipitation: ${day.probabilityOfPrecipitation?.value || 'N/A'}%
            Humidity: ${day.relativeHumidity?.value || 'N/A'}%
            Wind: ${day.windSpeed} ${day.windDirection}
        `;
    }
</script>

<main class="container">
    <div class="location-search">
        <input 
            type="text" 
            bind:value={searchLocation} 
            placeholder="Enter a location (e.g., New York, NY)"
        >
        <button on:click={geocodeLocation}>Search</button>
    </div>

    {#if loading}
        <p>Loading weather and solar data...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else}
        <h1>Weather for {currentLocation.name}</h1>
        
        <div class="weather-section">
            <h2>Weather Forecast</h2>
            <div class="forecast-grid">
                {#each weatherData as day}
                    <div class="forecast-card">
                        <h3>{day.name}</h3>
                        <div class="weather-icon">
                            {weatherIcons[day.shortForecast] || '🌈'}
                        </div>
                        <p>Temperature: {day.temperature}°{day.temperatureUnit}</p>
                        <p>Forecast: {day.shortForecast}</p>
                        <details>
                            <summary>More Details</summary>
                            <pre>{getDetailedWeatherInfo(day)}</pre>
                        </details>
                    </div>
                {/each}
            </div>
        </div>

        <div class="solar-section">
            <h2>Solar Irradiance Data</h2>
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>DNI (kWh/m²/day)</th>
                    </tr>
                </thead>
                <tbody>
                    {#each solarData as data}
                        <tr>
                            <td>{data.month}</td>
                            <td>{data.value.toFixed(2)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="hourly-solar-section">
            <h2>Hourly Solar Irradiance Forecast</h2>
            {#if hourlyIrradianceData.length > 0}
                {#each hourlyIrradianceData as dayData}
                    <div class="day-irradiance">
                        <h3>{new Date(dayData.date).toLocaleDateString()}</h3>
                        {#if dayData.forecasts.length > 0}
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>DNI (W/m²)</th>
                                        <th>DHI (W/m²)</th>
                                        <th>GHI (W/m²)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each dayData.forecasts as hourData}
                                        <tr>
                                            <td>{hourData.time}</td>
                                            <td>{hourData.dni.toFixed(2)}</td>
                                            <td>{hourData.dhi.toFixed(2)}</td>
                                            <td>{hourData.ghi.toFixed(2)}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        {:else}
                            <p>No hourly irradiance data available for this day.</p>
                        {/if}
                    </div>
                {/each}
            {:else}
                <p>No hourly irradiance data available.</p>
            {/if}
        </div>
    {/if}
</main>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
    }

    .location-search {
        display: flex;
        margin-bottom: 20px;
    }

    .location-search input {
        flex-grow: 1;
        padding: 10px;
        margin-right: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .location-search button {
        padding: 10px 15px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .forecast-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
    }

    .forecast-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        text-align: center;
        width: calc(20% - 15px);
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .weather-icon {
        font-size: 3rem;
        margin: 10px 0;
    }

    details {
        margin-top: 10px;
        text-align: left;
    }

    pre {
        background-color: #f4f4f4;
        padding: 10px;
        border-radius: 4px;
        white-space: pre-wrap;
        font-size: 0.8rem;
    }

    .solar-section {
        margin-top: 30px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    .hourly-solar-section {
        margin-top: 30px;
    }

    .day-irradiance {
        margin-bottom: 20px;
        border: 1px solid #e0e0e0;
        padding: 15px;
        border-radius: 5px;
    }

    .day-irradiance h3 {
        margin-top: 0;
        color: #333;
    }

    .hourly-solar-section table {
        width: 100%;
        border-collapse: collapse;
    }

    .hourly-solar-section th, 
    .hourly-solar-section td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    .hourly-solar-section th {
        background-color: #f2f2f2;
    }

    .error {
        color: red;
        text-align: center;
    }
</style>
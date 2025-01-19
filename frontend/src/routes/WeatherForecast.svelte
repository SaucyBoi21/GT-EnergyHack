<script>
    import { scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    export let weatherData = [];
    export let openModal;
    export let getWeatherIcon;

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

    // Remove the isTonight function, we'll use first-child instead
</script>

<div class="forecast-grid">
    {#each weatherData as day, i}
        <div 
            class="forecast-card glass {i === 0 ? 'featured-card' : ''}"
            on:click={() => openModal(day)}
            in:scale={{
                duration: 400,
                delay: i * 50,
                start: 0.95,
                easing: quintOut
            }}
        >
            {#if i === 0}
                <!-- Featured card layout -->
                <h3>{day.name}</h3>
                <div class="weather-icon">
                    {getWeatherIcon(day.shortForecast)}
                </div>
                <div class="main-temp">
                    <span class="temperature">{day.temperature}°{day.temperatureUnit}</span>
                    <span class="feels-like">Feels like {day.apparentTemperature?.value || day.temperature}°</span>
                </div>
                <p class="forecast">{day.shortForecast}</p>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-icon">🌧️</span>
                        <div class="stat-info">
                            <span class="stat-value">{day.probabilityOfPrecipitation?.value || 0}%</span>
                            <span class="stat-label">Rain</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">💨</span>
                        <div class="stat-info">
                            <span class="stat-value">{day.windSpeed}</span>
                            <span class="stat-label">Wind</span>
                        </div>
                    </div>
                </div>
            {:else}
                <!-- Compact card layout -->
                <div class="compact-header">
                    <h3>{day.name}</h3>
                    <span class="compact-forecast">{day.shortForecast}</span>
                </div>
                <div class="compact-content">
                    <span class="temperature">{day.temperature}°</span>
                    <div class="weather-icon">
                        {getWeatherIcon(day.shortForecast)}
                    </div>
                </div>
            {/if}
        </div>
    {/each}
</div>

<style>
    .forecast-grid {
        display: grid;
        grid-template-columns: minmax(300px, 1fr) repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        padding: 1rem;
        overflow: hidden;
        height: fit-content;
        min-height: 0; /* This helps with Grid layout containment */
    }

    .forecast-card {
        background: rgba(26, 26, 46, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 1.5rem;
        transition: all 0.3s ease;
        cursor: pointer;
        overflow: hidden;
    }

    .forecast-card:hover {
        transform: translateY(-2px);
        background: rgba(26, 26, 46, 0.98);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .forecast-card:not(.featured-card) {
        display: flex;
        flex-direction: column;
        min-height: 180px; /* Increased from 140px */
        max-height: 200px; /* Increased from 160px */
        padding: 1rem;
        position: relative;
    }

    .featured-card {
        grid-row: span 2;
        max-height: 400px; /* Increased from 320px */
    }

    h3 {
        font-size: 1.1rem;
        font-weight: 600;
        color: #fff;
        margin: 0 0 1rem 0;
    }

    .weather-icon {
        font-size: 2.5rem;
        margin: 0.5rem 0;
        transition: transform 0.2s ease;
    }

    .forecast-card:hover .weather-icon {
        transform: scale(1.1);
    }

    .main-temp {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin: 1rem 0;
    }

    .temperature {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(90deg, #fff, #a8b1ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: 1;
    }

    .feels-like {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.6);
    }

    .forecast {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.8);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .stat-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        transition: transform 0.2s ease;
    }

    .stat-item:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.05);
    }

    .stat-icon {
        font-size: 1.25rem;
    }

    .stat-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .stat-value {
        font-size: 1rem;
        font-weight: 600;
        color: #fff;
    }

    .stat-label {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.5);
    }

    .compact-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
        margin-top: 0.5rem;
    }

    .compact-info .temperature {
        font-size: 1.75rem;
    }

    .compact-info .forecast {
        font-size: 0.9rem;
        text-align: center;
    }

    .compact-header {
        text-align: center;
        margin-bottom: 1rem;
    }

    .compact-header h3 {
        margin: 0 0 0.25rem 0;
    }

    .compact-forecast {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.6);
        display: block;
        line-height: 1.2;
    }

    .compact-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
        justify-content: center;
        position: absolute;
        bottom: 1rem;
        left: 0;
        right: 0;
    }

    .compact-content .temperature {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    .compact-content .weather-icon {
        font-size: 2rem;
        margin: 0;
        height: 2.5rem; /* Fixed height to ensure consistent spacing */
        display: flex;
        align-items: center;
    }

    .forecast-card:not(.featured-card):hover .weather-icon {
        transform: scale(1.15);
    }
</style>

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
            class="forecast-card {i === 0 ? 'first-card' : ''}"
            on:click={() => i !== 0 && openModal(day)}
            in:scale={{
                duration: 400,
                delay: i * 100,
                easing: quintOut,
                start: 0.8
            }}
        >
            <h3>{day.name}</h3>
            <div class="weather-icon">
                {getWeatherIcon(day.shortForecast)}
            </div>
            <p class="temperature">{day.temperature}°{day.temperatureUnit}</p>
            
            {#if i === 0}
                <p class="forecast">{day.shortForecast}</p>
                <div class="details">
                    <div class="detail-item">
                        <span class="detail-label">Precipitation</span>
                        <span class="detail-value">{day.probabilityOfPrecipitation?.value || 0}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Humidity</span>
                        <span class="detail-value">{day.relativeHumidity?.value || 0}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Wind</span>
                        <span class="detail-value">{day.windSpeed} {day.windDirection}</span>
                    </div>
                    <p class="detailed-forecast">{day.detailedForecast}</p>
                </div>
            {:else}
                <div class="details-link">
                    <span>View details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </div>
            {/if}
        </div>
    {/each}
</div>

<style>
    .forecast-grid {
        display: grid;
        grid-template-columns: 350px repeat(5, 1fr);
        grid-template-rows: repeat(2, minmax(120px, auto));
        gap: 1rem;
    }

    .first-card {
        grid-column: 1;
        grid-row: 1 / span 2;
    }

    /* Position other cards */
    .forecast-card:nth-child(2) { grid-area: 1 / 2; }
    .forecast-card:nth-child(3) { grid-area: 1 / 3; }
    .forecast-card:nth-child(4) { grid-area: 1 / 4; }
    .forecast-card:nth-child(5) { grid-area: 1 / 5; }
    .forecast-card:nth-child(6) { grid-area: 1 / 6; }
    .forecast-card:nth-child(7) { grid-area: 2 / 2; }
    .forecast-card:nth-child(8) { grid-area: 2 / 3; }
    .forecast-card:nth-child(9) { grid-area: 2 / 4; }
    .forecast-card:nth-child(10) { grid-area: 2 / 5; }
    .forecast-card:nth-child(11) { grid-area: 2 / 6; }

    .forecast-card:not(.first-card):nth-child(n+2):nth-child(-n+6) {
        grid-row: 1;
    }

    .forecast-card:not(.first-card):nth-child(n+7) {
        grid-row: 2;
    }

    .forecast-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.2rem;
        min-height: 120px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 15px;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .first-card {
        grid-row: span 2;
        grid-column: 1;
        padding: 1.5rem;
    }

    .forecast-card:not(.first-card) {
        justify-content: center;
        gap: 0.5rem;
    }

    .forecast-card:not(.first-card) h3 {
        font-size: 0.95rem;
        margin: 0;
    }

    .forecast-card:not(.first-card) .weather-icon {
        font-size: 2rem;
        margin: 0.5rem 0;
    }

    .forecast-card:not(.first-card) .temperature {
        font-size: 1.2rem;
        margin: 0;
    }

    .details-link {
        margin-top: auto;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
        display: flex;
        align-items: center;
        gap: 0.3rem;
        transition: color 0.2s;
    }

    .forecast-card:not(.first-card):hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.05);
    }

    .forecast-card:not(.first-card):hover .details-link {
        color: rgba(255, 255, 255, 0.9);
    }

    .details {
        margin-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 1rem;
    }

    h3 {
        margin-bottom: 0.5rem;
        font-size: 1.2rem;
        color: #e9ecef;
    }

    .weather-icon {
        font-size: 3rem;
        margin: 0.5rem 0;
        transform: scale(1);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .forecast-card:hover .weather-icon {
        transform: scale(1.1);
    }

    .temperature {
        font-size: 1.5rem;
        font-weight: bold;
        color: #e9ecef;
    }

    .forecast {
        margin: 0.5rem 0;
        opacity: 0.8;
        color: #e9ecef;
    }

    .more-details {
        margin-top: auto;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
        transition: color 0.2s;
    }

    .forecast-card:not(.first-card):hover .more-details {
        color: rgba(255, 255, 255, 0.9);
    }

    .details-icon {
        position: absolute;
        bottom: 10px;
        right: 10px;
        color: rgba(255, 255, 255, 0.6);
        transition: color 0.3s ease;
    }

    .forecast-card:hover .details-icon {
        color: rgba(255, 255, 255, 0.9);
    }

    /* Update sizes for non-first-card */
    .forecast-card:not(.first-card) {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
    }

    .forecast-card:not(.first-card) h3 {
        font-size: 1rem;
    }

    .forecast-card:not(.first-card) .weather-icon {
        font-size: 2.5rem;
        margin: 0.25rem 0;
    }

    .forecast-card:not(.first-card) .temperature {
        font-size: 1.25rem;
        margin: 0.25rem 0;
    }
</style>

<script>
    import { fade, scale } from 'svelte/transition';
    import { quintOut, cubicInOut } from 'svelte/easing';

    export let showModal = false;
    export let selectedDay = null;
    export let closeModal;
    export let getWeatherIcon;
    export let dayPrediction; // Add this prop

    // Format the prediction value
    $: formattedPrediction = dayPrediction ? dayPrediction.toFixed(2) : 'Calculating...';
</script>

{#if showModal && selectedDay}
    <div class="modal-backdrop" on:click|self={closeModal} transition:fade={{duration: 300}}>
        <div 
            class="modal glass"
            on:click|stopPropagation
            in:scale={{
                duration: 400,
                delay: 100,
                start: 0.95,
                opacity: 0,
                easing: cubicInOut
            }}
        >
            {#if selectedDay}
                <button class="close-button" on:click={closeModal}>×</button>
                <div class="modal-content">
                    <h2>{selectedDay.name}</h2>
                    
                    <div class="modal-weather-info">
                        <div class="modal-icon">
                            {getWeatherIcon(selectedDay.shortForecast)}
                        </div>
                        <div class="modal-main-info">
                            <p class="modal-temp">{selectedDay.temperature}°{selectedDay.temperatureUnit}</p>
                            <p class="feels-like">Feels like {selectedDay.apparentTemperature?.value || selectedDay.temperature}°</p>
                            <p class="modal-forecast">{selectedDay.shortForecast}</p>
                        </div>
                    </div>

                    <div class="modal-stats">
                        <div class="stat-item">
                            <div class="stat-icon">🌧️</div>
                            <div class="stat-info">
                                <span class="stat-value">{selectedDay.probabilityOfPrecipitation?.value || 0}%</span>
                                <span class="stat-label">Chance of Rain</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon">💨</div>
                            <div class="stat-info">
                                <span class="stat-value">{selectedDay.windSpeed}</span>
                                <span class="stat-label">Wind Speed</span>
                            </div>
                        </div>
                    </div>

                    <div class="detailed-forecast">
                        <h3>Detailed Forecast</h3>
                        <p>{selectedDay.detailedForecast}</p>
                    </div>

                    <!-- Add prediction section -->
                    <div class="prediction-section">
                        <h3>Solar Production Prediction</h3>
                        <div class="prediction-value">
                            {formattedPrediction}
                            <span class="prediction-unit">kWh/m²/day</span>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        background: rgba(26, 26, 46, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.6);
        border-radius: 24px;
        padding: 2rem;
        width: 90%;
        max-width: 480px;
        position: relative;
    }

    .close-button {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: #fff;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .close-button:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
    }

    .modal-content h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #fff;
        margin: 0 0 1.5rem 0;
    }

    .modal-weather-info {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 16px;
    }

    .modal-icon {
        font-size: 4rem;
    }

    .modal-main-info {
        flex: 1;
    }

    .modal-temp {
        font-size: 3rem;
        font-weight: 700;
        margin: 0;
        line-height: 1;
        background: linear-gradient(90deg, #fff, #a8b1ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .feels-like {
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.6);
        margin: 0.5rem 0;
    }

    .modal-forecast {
        font-size: 1.1rem;
        color: #fff;
        margin: 0.5rem 0 0 0;
    }

    .modal-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        transition: transform 0.2s ease;
    }

    .stat-item:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.05);
    }

    .stat-icon {
        font-size: 1.5rem;
    }

    .stat-info {
        display: flex;
        flex-direction: column;
    }

    .stat-value {
        font-size: 1.1rem;
        font-weight: 600;
        color: #fff;
    }

    .stat-label {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.5);
    }

    .detailed-forecast {
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 16px;
    }

    .detailed-forecast h3 {
        font-size: 1.1rem;
        font-weight: 600;
        color: #fff;
        margin: 0 0 1rem 0;
    }

    .detailed-forecast p {
        font-size: 0.95rem;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.8);
        margin: 0;
    }

    .prediction-section {
        margin-top: 1.5rem;
        padding: 1.5rem;
        background: rgba(76, 0, 255, 0.1);
        border-radius: 12px;
        text-align: center;
    }

    .prediction-section h3 {
        color: rgba(76, 0, 255, 0.9);
        font-size: 1rem;
        margin: 0 0 0.5rem 0;
    }

    .prediction-value {
        font-size: 2rem;
        font-weight: 700;
        color: rgba(76, 0, 255, 0.9);
    }

    .prediction-unit {
        font-size: 1rem;
        color: rgba(76, 0, 255, 0.6);
        margin-left: 0.5rem;
    }
</style>

<script>
    import { fade, scale } from 'svelte/transition';
    import { quintOut, cubicInOut } from 'svelte/easing';

    export let showModal = false;
    export let selectedDay = null;
    export let closeModal;
    export let getWeatherIcon;
</script>

{#if showModal}
    <div 
        class="modal-backdrop"
        on:click={closeModal}
        transition:fade={{duration: 300}}
    >
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
                            <p class="modal-forecast">{selectedDay.shortForecast}</p>
                        </div>
                    </div>
                    <div class="modal-details">
                        <div class="detail-item">
                            <span class="detail-label">Precipitation Chance</span>
                            <span class="detail-value">{selectedDay.probabilityOfPrecipitation?.value || 0}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Humidity</span>
                            <span class="detail-value">{selectedDay.relativeHumidity?.value || 0}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Wind</span>
                            <span class="detail-value">{selectedDay.windSpeed} {selectedDay.windDirection}</span>
                        </div>
                    </div>
                    <div class="detailed-forecast">
                        <h3>Detailed Forecast</h3>
                        <p>{selectedDay.detailedForecast}</p>
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
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        border-radius: 15px;
        padding: 2rem;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    }

    .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        font-size: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    .close-button:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .modal-content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .modal-weather-info {
        display: flex;
        align-items: center;
        margin: 1rem 0;
        gap: 1rem;
    }

    .modal-icon {
        font-size: 4rem;
    }

    .modal-main-info {
        text-align: center;
    }

    .modal-temp {
        font-size: 2rem;
        font-weight: bold;
    }

    .modal-details {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin: 1rem 0;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .detail-label {
        opacity: 0.7;
        margin-bottom: 0.5rem;
    }

    .detailed-forecast {
        width: 100%;
        text-align: center;
    }
</style>

<script>
    import Chart from 'chart.js/auto';
    import { onMount } from 'svelte';
    import { extractWindSpeed, getPrediction } from '$lib/utils';

    export let solarData = {};
    export let selectedDate = new Date().toISOString().slice(0, 10);
    export let loadingIrradiance = false;

    // Add new props for weather data
    export let weatherData = [];

    let chartCanvas;
    let solarChart;
    let interpolatedValue;

    function interpolateSolarValue(date) {
        if (!Object.keys(solarData).length) return 0;
        
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const selectedDate = new Date(date);
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();
        
        const currentMonth = monthNames[month];
        const prevMonth = monthNames[(month - 1 + 12) % 12];
        const nextMonth = monthNames[month + 1];
        
        const currentMonthValue = solarData[currentMonth];
        const prevMonthValue = solarData[prevMonth];
        const nextMonthValue = solarData[nextMonth];
        
        const daysInMonth = new Date(selectedDate.getFullYear(), month + 1, 0).getDate();
        const midPoint = Math.floor(daysInMonth / 2);
        
        if (day === midPoint) {
            return currentMonthValue;
        }
        
        if (day < midPoint) {
            const ratio = (day - 1) / (midPoint - 1);
            return prevMonthValue + (currentMonthValue - prevMonthValue) * ratio;
        } else {
            const ratio = (day - midPoint) / (daysInMonth - midPoint);
            return currentMonthValue + (nextMonthValue - currentMonthValue) * ratio;
        }
    }

    // Add a watch for selectedDate changes to trigger chart update
    $: if (selectedDate || solarData) {
        interpolatedValue = interpolateSolarValue(selectedDate);
    }

    // Sort and filter data before creating chart or displaying table
    $: sortedData = Object.entries(solarData)
        .filter(([key]) => key !== 'Annual Average')
        .sort((a, b) => {
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
            return months.indexOf(a[0]) - months.indexOf(b[0]);
        });

    $: annualAverage = Object.entries(solarData)
        .find(([key]) => key === 'Annual Average');

    function createSolarChart() {
        if (solarChart) {
            solarChart.destroy();
        }

        const ctx = chartCanvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(76, 0, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(76, 0, 255, 0.0)');

        const monthlyData = Object.entries(solarData)
            .filter(([key]) => key !== 'Annual Average')
            .sort((a, b) => {
                const months = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
                return months.indexOf(a[0]) - months.indexOf(b[0]);
            });

        solarChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.map(([month]) => month),
                datasets: [{
                    label: 'Solar Irradiance (kWh/m²/day)',
                    data: monthlyData.map(([, value]) => value),
                    backgroundColor: gradient,
                    borderColor: 'rgba(76, 0, 255, 0.8)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: 'rgba(76, 0, 255, 0.8)',
                    pointHoverRadius: 6,
                    pointHoverBorderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: (context) => `${context.parsed.y.toFixed(2)} kWh/m²/day`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                size: 11
                            },
                            callback: (value) => value.toFixed(1)
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    $: if (solarData && Object.keys(solarData).length > 1 && chartCanvas) {
        createSolarChart();
    }

    // Add this to handle row animations
    onMount(async () => {
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            row.style.setProperty('--index', index);
        });
        modelPrediction = await getPrediction(weatherData[0].temperature, weatherData[0].windSpeed);
    });

    // Add these new variables
    let modelPrediction = null;
    let modelLoading = false;

    // Modify the watch to include more logging
    $: {
        if (interpolatedValue) {
            console.log('Values changed:', {
                interpolatedValue,
            });
            modelPrediction = getPrediction(weatherData[0].temperature, weatherData[0].windSpeed);
        }
    }
</script>

<div class="solar-section glass" in:slide={{duration: 300, delay: 400}}>
    <div class="section-header">
        <div class="title-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <h2>Solar Irradiance</h2>
        </div>
        
        <div class="date-control">
            <input 
                type="date" 
                id="date-input"
                bind:value={selectedDate}
            >
            <div class="estimated-value">
                <span class="estimate-label">Estimated Value</span>
                <span class="estimate-number">{interpolatedValue.toFixed(2)}</span>
                <span class="estimate-unit">kWh/m²/day</span>
            </div>
        </div>
    </div>

    <div class="content-grid" class:loading={loadingIrradiance}>
        {#if loadingIrradiance}
            <div class="loading-overlay">
                <div class="loading-spinner"></div>
            </div>
        {/if}
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>DNI (kWh/m²/day)</th>
                    </tr>
                </thead>
                <tbody>
                    {#if annualAverage}
                        <tr class="annual-average">
                            <td>
                                <div class="month-cell">
                                    <span class="month-name">Annual Avg</span>
                                    <div class="month-bar" style="--value: {(annualAverage[1] / 8) * 100}%"></div>
                                </div>
                            </td>
                            <td>
                                <span class="value-badge">{annualAverage[1].toFixed(2)}</span>
                            </td>
                        </tr>
                    {/if}
                    {#each sortedData as [month, value]}
                        <tr>
                            <td>
                                <div class="month-cell">
                                    <span class="month-name">{month}</span>
                                    <div class="month-bar" style="--value: {(value / 8) * 100}%"></div>
                                </div>
                            </td>
                            <td>
                                <span class="value-badge">{value.toFixed(2)}</span>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        
        <div class="chart-wrapper">
            <canvas bind:this={chartCanvas}></canvas>
        </div>
    </div>

    {#if !isNaN(modelPrediction)}
        <div class="model-prediction">
            <h3>Model Prediction</h3>
            <div class="prediction-value">{modelPrediction.toFixed(2)}</div>
        </div>
    {/if}
</div>

<style>
    .solar-section {
        background: rgba(26, 26, 46, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 1.5rem;
        height: 100%;
        max-height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .title-badge {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: rgba(76, 0, 255, 0.15);
        padding: 0.75rem 1.25rem;
        border-radius: 12px;
        border: 1px solid rgba(76, 0, 255, 0.2);
    }

    .title-badge svg {
        color: rgba(76, 0, 255, 0.9);
    }

    h2 {
        font-size: 1.2rem;
        font-weight: 600;
        color: rgba(76, 0, 255, 0.9);
        margin: 0;
    }

    .date-control {
        display: flex;
        align-items: center;
        gap: 2rem;
        background: rgba(255, 255, 255, 0.03);
        padding: 1rem 1.5rem;
        border-radius: 12px;
    }

    input[type="date"] {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: white;
        padding: 0.5rem 0.75rem;
        font-family: inherit;
    }

    .estimated-value {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .estimate-label {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.5);
    }

    .estimate-number {
        font-size: 1.4rem;
        font-weight: 700;
        background: linear-gradient(90deg, #fff, #a8b1ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .estimate-unit {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
    }

    .content-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 1.5rem;
        overflow: hidden;
        flex: 1;
        min-height: 0; /* Important for nested scroll containers */
        position: relative;
    }

    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(26, 26, 46, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        backdrop-filter: blur(3px);
        border-radius: 12px;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top: 3px solid rgba(76, 0, 255, 0.6);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .content-grid.loading {
        opacity: 0.7;
        pointer-events: none;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .chart-wrapper {
        position: relative;
        height: 400px; /* Fixed height */
        max-height: 100%; /* Prevent infinite growth */
        overflow: hidden; /* Prevent content overflow */
    }

    .data-table {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 15px;
        padding: 1.5rem;
        height: 100%;
        overflow-y: auto;
        scroll-behavior: smooth;
        max-height: 100%;
    }

    .data-table::-webkit-scrollbar {
        width: 8px;
    }

    .data-table::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }

    .data-table::-webkit-scrollbar-thumb {
        background: rgba(76, 0, 255, 0.3);
        border-radius: 4px;
    }

    .data-table::-webkit-scrollbar-thumb:hover {
        background: rgba(76, 0, 255, 0.5);
    }

    canvas {
        width: 100% !important;
        height: 100% !important;
    }

    .date-picker {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    input[type="date"] {
        background: #000;
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 8px 12px;
    }

    ::-webkit-calendar-picker-indicator {
        filter: invert(1);
    }

    table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-size: 0.95rem;
        height: auto;
    }

    th {
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.05em;
        color: rgba(255, 255, 255, 0.7);
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        transition: background-color 0.2s;
    }

    tr:last-child td {
        border-bottom: none;
    }

    tr:hover td {
        background: rgba(255, 255, 255, 0.05);
    }

    .month-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-height: 24px;
    }

    .month-name {
        width: 80px;
        font-size: 0.9rem;
        white-space: nowrap;
    }

    .annual-average .month-name {
        font-size: 0.85rem;
    }

    .month-bar {
        position: relative;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        flex-grow: 1;
        overflow: hidden;
    }

    .month-bar::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: var(--value);
        background: linear-gradient(90deg, rgba(76, 0, 255, 0.6), rgba(76, 0, 255, 0.8));
        border-radius: 3px;
        transition: width 0.3s ease-out;
    }

    .value-badge {
        background: rgba(76, 0, 255, 0.15);
        padding: 0.4rem 0.8rem;
        border-radius: 8px;
        font-family: 'Inter', monospace;
        font-weight: 500;
        color: rgba(76, 0, 255, 0.9);
        transition: all 0.2s;
    }

    tr:hover .value-badge {
        background: rgba(76, 0, 255, 0.25);
        transform: scale(1.05);
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    tbody tr {
        animation: fadeIn 0.3s ease-out forwards;
        animation-delay: calc(var(--index, 0) * 0.05s);
        opacity: 0;
    }

    .model-prediction {
        background: rgba(76, 0, 255, 0.1);
        border: 1px solid rgba(76, 0, 255, 0.2);
        border-radius: 12px;
        padding: 1rem;
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .model-prediction h3 {
        margin: 0;
        color: rgba(76, 0, 255, 0.9);
        font-size: 1rem;
    }

    .prediction-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: rgba(76, 0, 255, 0.9);
    }

    .model-prediction.loading {
        opacity: 0.7;
    }
</style>

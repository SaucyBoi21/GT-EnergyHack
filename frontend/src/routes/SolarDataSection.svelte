<script>
    import Chart from 'chart.js/auto';
    import { onMount } from 'svelte';

    export let solarData = {};
    export let selectedDate = new Date().toISOString().slice(0, 10);

    let chartCanvas;
    let solarChart;

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
        const nextMonth = monthNames[(month + 1) % 12];
        
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

    $: interpolatedValue = interpolateSolarValue(selectedDate);

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
        
        // Create gradient for the fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(76, 0, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(76, 0, 255, 0.0)');

        const monthlyData = Object.entries(solarData)
            .filter(([key]) => key !== 'Annual Average')
            .sort((a, b) => {
                const months = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
                return months.indexOf(a[0]) - months.indexOf(b[0]);
            });

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 20,
                    bottom: 10
                }
            },
            plugins: {
                legend: {
                    display: false
                    // labels: {
                        
                    //     color: '#e9ecef',
                    //     font: {
                    //         family: 'Inter',
                    //         size: 14
                    //     },
                    //     padding: 20,
                    //     usePointStyle: true,
                    //     pointStyle: 'circle'
                    // }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: 'Inter',
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#e9ecef',
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        padding: 10,
                        callback: value => value.toFixed(1)
                    },
                    border: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#e9ecef',
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        padding: 10
                    },
                    border: {
                        display: false
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.4,
                    borderWidth: 3,
                    borderColor: 'rgba(76, 0, 255, 0.8)'
                },
                point: {
                    radius: 4,
                    backgroundColor: 'rgba(76, 0, 255, 1)',
                    borderColor: 'white',
                    borderWidth: 2,
                    hoverRadius: 6,
                    hoverBorderWidth: 3
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        };
        
        solarChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.map(([month]) => month),
                datasets: [{
                    label: 'Solar Irradiance (kWh/m²/day)',
                    data: monthlyData.map(([, value]) => value),
                    backgroundColor: gradient,
                    fill: true,
                    cubicInterpolationMode: 'monotone'
                }]
            },
            options: chartOptions
        });
    }

    $: if (solarData && Object.keys(solarData).length > 1 && chartCanvas) {
        createSolarChart();
    }

    // Add this to handle row animations
    onMount(() => {
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            row.style.setProperty('--index', index);
        });
    });
</script>

<div class="solar-section" in:slide={{duration: 300, delay: 400}}>
    <div class="header">
        <div class="title-container">
            <h2>Solar Irradiance Data</h2>
        </div>
        <div class="interpolator-controls glass">
            <div class="date-picker">
                <label for="date-input">Select Date:</label>
                <input 
                    type="date" 
                    id="date-input"
                    bind:value={selectedDate}
                >
            </div>
            <div class="interpolated-value">
                <span>Estimated Value:</span>
                <strong>{interpolatedValue.toFixed(2)} kWh/m²/day</strong>
            </div>
        </div>
    </div>
    
    <div class="content">
        <div class="table-container">
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
        
        <div class="chart-container" id="chart-container">
            <canvas bind:this={chartCanvas}></canvas>
        </div>
    </div>
</div>

<style>
    .solar-section {
        margin: 2rem 0;
        border-radius: 20px;
        background: rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        padding: 30px;
        width: 100%;
        box-sizing: border-box;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 2rem;
        padding: 0px;
    }

    .title-container {
        background: rgba(76, 0, 255, 0.15);
        padding: 0.6rem 1.2rem;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(76, 0, 255, 0.2);
    }

    h2 {
        font-size: 1.2rem;
        margin: 0;
        white-space: nowrap;
        color: rgba(76, 0, 255, 0.9);
        font-weight: 600;
    }

    .interpolator-controls {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 25px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        margin: 0;
    }

    .content {
        display: grid;
        grid-template-columns: 360px 1fr; /* Changed from 300px to 330px */
        gap: 2rem;
        align-items: start;
    }

    .chart-container {
        position: relative;
        height: 600px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        padding: 1.5rem;
    }

    .table-container {
        /* Remove the margin-top */
        margin-top: 0;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 15px;
        padding: 1.5rem;
        /* Ensure full height and proper overflow */
        height: 600px;
        overflow-y: auto;
        /* Add smooth scrolling */
        scroll-behavior: smooth;
    }

    /* Update scrollbar for table container */
    .table-container::-webkit-scrollbar {
        width: 8px;
    }

    .table-container::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }

    .table-container::-webkit-scrollbar-thumb {
        background: rgba(76, 0, 255, 0.3);
        border-radius: 4px;
    }

    .table-container::-webkit-scrollbar-thumb:hover {
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
        /* Reduce min-height if needed */
        min-height: 24px;
    }

    .month-name {
        width: 80px; /* Fixed width for all month names */
        font-size: 0.9rem;
        white-space: nowrap;
    }

    .annual-average .month-name {
        font-size: 0.85rem; /* Slightly smaller font for annual average */
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

    /* Optional: Add animation for rows */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    tbody tr {
        animation: fadeIn 0.3s ease-out forwards;
        animation-delay: calc(var(--index, 0) * 0.05s);
        opacity: 0;
    }
</style>

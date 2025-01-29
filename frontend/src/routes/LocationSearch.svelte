<script>
    import { fade, slide } from 'svelte/transition';

    export let searchLocation = '';
    export let handleSearch;
</script>

<form class="search-container" on:submit={handleSearch}>
    <input 
        type="text" 
        bind:value={searchLocation} 
        placeholder="Enter location (e.g., New York, NY)"
    >
    <button type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    </button>
</form>

<style>
    .search-container {
        width: 100%;
        max-width: 800px;
        margin: 2rem auto;
        display: flex;
        gap: 0.5rem;
        background: rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 0.5rem;
    }

    input {
        flex: 1;
        background: transparent;
        border: none;
        color: #fff;
        font-size: 1.1rem;
        padding: 0.75rem 1rem;
        outline: none;
    }

    input::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }

    button {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s;
    }

    button:hover {
        transform: scale(1.05);
    }
</style>

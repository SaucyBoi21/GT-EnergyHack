<script>
    import { fade, slide } from 'svelte/transition';

    export let searchLocation = '';
    export let handleSearch;
</script>

<form class="search-container" on:submit={handleSearch}>
    <div class="search-wrapper">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
            type="text" 
            bind:value={searchLocation} 
            placeholder="Search any location..."
        >
    </div>
    <button type="submit">
        Search
    </button>
</form>

<style>
    .search-container {
        width: 100%;
        max-width: 600px;
        margin: 2rem auto;
        display: flex;
        gap: 1rem;
    }

    .search-wrapper {
        flex: 1;
        position: relative;
        background: rgba(26, 26, 46, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 0.25rem;
        display: flex;
        align-items: center;
    }

    .search-icon {
        margin-left: 1rem;
        color: rgba(255, 255, 255, 0.4);
    }

    input {
        flex: 1;
        background: transparent;
        border: none;
        color: #fff;
        font-size: 1rem;
        padding: 0.75rem;
        outline: none;
    }

    input::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }

    button {
        background: linear-gradient(135deg, #4C00FF, #884DFF);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 0 1.5rem;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(76, 0, 255, 0.3);
    }
</style>

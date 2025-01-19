<script>
    import { fade, slide } from 'svelte/transition';

    export let searchLocation = '';
    export let handleSearch;
    export let isEditing = false;
    export let locationName = '';

    function handleClick() {
        isEditing = true;
    }

    function handleKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(e);
            isEditing = false;
        }
        if (e.key === 'Escape') {
            isEditing = false;
        }
    }

    function handleBlur() {
        isEditing = false;
    }
</script>

{#if isEditing}
    <div class="location-edit glass" transition:fade>
        <input
            type="text"
            bind:value={searchLocation}
            on:keydown={handleKeydown}
            on:blur={handleBlur}
            placeholder="Enter location..."
            autofocus
        />
    </div>
{:else}
    <h2 class="location-title" on:click={handleClick}>
        Weather for <span class="location-name">{locationName}</span>
    </h2>
{/if}

<style>
    .location-title {
        font-size: 2rem;
        font-weight: 600;
        color: #fff;
        margin: 0;
        padding: 1rem 0;
        cursor: pointer;
        transition: all 0.2s;
    }

    .location-name {
        color: rgba(76, 0, 255, 0.9);
        text-decoration: underline;
        text-decoration-style: dotted;
        text-decoration-thickness: 2px;
        text-underline-offset: 4px;
    }

    .location-title:hover .location-name {
        color: rgba(76, 0, 255, 1);
    }

    .location-edit {
        margin: 1rem 0;
        transition: all 0.3s;
    }

    .location-edit input {
        width: 100%;
        background: rgba(76, 0, 255, 0.1);
        border: 2px solid rgba(76, 0, 255, 0.2);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        font-size: 1.5rem;
        color: #fff;
        outline: none;
        transition: all 0.2s;
    }

    .location-edit input:focus {
        background: rgba(76, 0, 255, 0.15);
        border-color: rgba(76, 0, 255, 0.3);
        box-shadow: 0 0 0 4px rgba(76, 0, 255, 0.1);
    }

    .location-edit input::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }
</style>

<script>
    import { onMount } from 'svelte';
    import 'leaflet/dist/leaflet.css';
    import { browser } from '$app/environment';
    
    export let lat = 33.7490;
    export let lon = -84.3880;
    export let onLocationChange = () => {}; // Add this line
    
    let map;
    let mapElement;
    let marker;
    let pulseMarker;
    let currentZoom = 13; // Add this to track zoom level
    
    onMount(async () => {
        if (browser) {
            const L = await import('leaflet');
            
            // Initialize map with stored zoom level
            map = L.map(mapElement).setView([lat, lon], currentZoom);
            
            // Add dark theme tiles
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);
            
            // Add marker
            marker = L.marker([lat, lon], {
                title: 'Selected Location',
                draggable: true // Make marker draggable
            }).addTo(map);
            
            // Add pulse effect
            const pulsingIcon = L.divIcon({
                className: 'pulse-icon',
                html: '<div class="pulse-dot"></div>',
                iconSize: [20, 20]
            });
            
            pulseMarker = L.marker([lat, lon], { icon: pulsingIcon }).addTo(map);

            // Handle map clicks
            map.on('click', (e) => {
                updateLocation(e.latlng.lat, e.latlng.lng);
            });

            // Handle marker drags
            marker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                updateLocation(pos.lat, pos.lng);
            });

            // Track zoom level changes
            map.on('zoomend', () => {
                currentZoom = map.getZoom();
            });
        }
        
        return () => {
            if (map) {
                map.remove();
            }
        };
    });
    
    function updateLocation(newLat, newLng) {
        lat = newLat;
        lon = newLng;
        if (marker && pulseMarker) {
            marker.setLatLng([lat, lon]);
            pulseMarker.setLatLng([lat, lon]);
            map.panTo([lat, lon]); // Pan instead of setView to preserve zoom
        }
        onLocationChange({ lat, lon });
    }
    
    $: if (map && lat && lon) {
        map.panTo([lat, lon]); // Pan instead of setView to preserve zoom
        if (marker && pulseMarker) {
            marker.setLatLng([lat, lon]);
            pulseMarker.setLatLng([lat, lon]);
        }
    }
</script>

<div class="map-container glass">
    <div bind:this={mapElement} class="map"></div>
</div>

<style>
    .map-container {
        height: 300px;
        margin: 2rem 0;
        border-radius: 20px;
        overflow: hidden;
        position: relative;
    }
    
    .map {
        height: 100%;
        width: 100%;
        border-radius: 20px;
    }
    
    :global(.pulse-icon) {
        position: relative;
    }
    
    :global(.pulse-dot) {
        width: 16px;
        height: 16px;
        background: rgba(76, 0, 255, 0.8);
        border-radius: 50%;
        position: relative;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(76, 0, 255, 0.4);
        }
        70% {
            box-shadow: 0 0 0 20px rgba(76, 0, 255, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(76, 0, 255, 0);
        }
    }

    :global(.leaflet-container) {
        cursor: crosshair !important;
    }
    
    :global(.leaflet-marker-icon) {
        cursor: grab !important;
    }
    
    :global(.leaflet-marker-dragging) {
        cursor: grabbing !important;
    }

    :global(.leaflet-control-attribution) {
        display: none !important;
    }
</style>

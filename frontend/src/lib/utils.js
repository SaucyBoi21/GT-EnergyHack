export function extractWindSpeed(windData) {
    if (!windData) return 0;
    
    if (windData.includes("to")) {
        // Handle the "10 to 20 mph" case
        const parts = windData.split("to");
        const low = parseInt(parts[0].trim(), 10);
        const high = parseInt(parts[1].trim().split(" ")[0], 10); // Remove "mph"
        return (low + high) / 2; // Return the average
    } else {
        // Handle the "15 mph" case
        return parseInt(windData.split(" ")[0], 10); // Extract the single number
    }
}

export async function getPrediction(tempFahrenheit, windSpeedMPHAdjacent) {
    try {
        const tempCelsius = (tempFahrenheit - 32) * 5/9;
        const windSpeedMS = extractWindSpeed(windSpeedMPHAdjacent) * 0.44704;
        
        const payload = {
            inputs: [[
                tempCelsius,
                0.1,
                0.1,
                windSpeedMS
            ]]
        };

        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();

        try {
            const data = JSON.parse(responseText);
            if (data.predictions) {
                return data.predictions[0];
            } else {
                throw new Error('No predictions in response');
            }
        } catch (parseError) {
            console.error('Failed to parse JSON:', parseError);
            throw parseError;
        }

    } catch (err) {
        console.error('Failed to get model prediction:', err);
        return null;
    }
}

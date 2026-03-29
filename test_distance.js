
// Mock data and functions to test the logic
let userKM = 0;
let userSteps = 0;
let lastPosition = null;
const dailyGoal = 10000;

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function updatePosition(position) {
    // 1. Accuracy Filter
    const accuracy = position.coords.accuracy || 100;
    if (accuracy > 30) {
        console.log(`[TEST] Ignoring low accuracy: ${accuracy}m`);
        return;
    }

    const current = { 
        lat: position.coords.latitude, 
        lng: position.coords.longitude,
        timestamp: position.timestamp || Date.now()
    };

    if (lastPosition) {
        const dist = calculateDistance(lastPosition.lat, lastPosition.lng, current.lat, current.lng);
        
        // 2. Speed Filter
        const timeDiff = (current.timestamp - lastPosition.timestamp) / 1000;
        if (timeDiff > 0) {
            const speed = (dist * 1000) / timeDiff;
            if (speed > 15) {
                console.log(`[TEST] Ignoring speed: ${speed.toFixed(1)} m/s`);
                return;
            }
        }

        // 3. Threshold
        if (dist > 0.002) { 
            userKM += dist;
            userSteps += dist * 1250; 
            console.log(`[TEST] Distance added: ${dist.toFixed(4)} km, Total: ${userKM.toFixed(4)} km, Steps: ${Math.floor(userSteps)}`);
            lastPosition = current; 
        } else {
            console.log(`[TEST] Threshold not met: ${dist.toFixed(4)} km`);
        }
    } else {
        lastPosition = current;
        console.log(`[TEST] Initial position set`);
    }
}

// --- Test Suite ---

console.log("--- TEST START ---");

// 1. Initial Position
updatePosition({ coords: { latitude: 24.7136, longitude: 46.6753, accuracy: 10 }, timestamp: 1000 });

// 2. Accurate small move (5 meters)
updatePosition({ coords: { latitude: 24.713645, longitude: 46.6753, accuracy: 5 }, timestamp: 2000 });

// 3. Inaccurate move (should be ignored)
updatePosition({ coords: { latitude: 24.7137, longitude: 46.6754, accuracy: 50 }, timestamp: 3000 });

// 4. Large impossible jump (1 km in 1 second)
updatePosition({ coords: { latitude: 24.7226, longitude: 46.6753, accuracy: 10 }, timestamp: 4000 });

// 5. Normal move (10 meters)
updatePosition({ coords: { latitude: 24.713735, longitude: 46.6753, accuracy: 5 }, timestamp: 5000 });

// 6. Very small move (1 meter - below threshold)
updatePosition({ coords: { latitude: 24.713744, longitude: 46.6753, accuracy: 5 }, timestamp: 6000 });

console.log(`--- FINAL STATS ---`);
console.log(`Total Distance: ${userKM.toFixed(4)} km`);
console.log(`Total Steps: ${Math.floor(userSteps)}`);

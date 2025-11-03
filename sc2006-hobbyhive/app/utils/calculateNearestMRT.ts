interface MRTStation {
  name: string;
  latitude: number;
  longitude: number;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function findNearestMRT(
  latitude: number,
  longitude: number
): Promise<{ name: string; distance: number } | null> {
  try {
    const response = await fetch('/api/mrt-stations');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.stations) {
      throw new Error('Invalid MRT data format');
    }

    const stations: MRTStation[] = data.stations;

    // Find nearest station
    let nearestStation: { name: string; distance: number } | null = null;
    let minDistance = Infinity;

    stations.forEach((station) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        station.latitude,
        station.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestStation = {
          name: station.name,
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        };
      }
    });

    return nearestStation;
  } catch (error) {
    console.error('Error finding nearest MRT:', error);
    return null;
  }
}

export async function findNearestMRT(
  latitude: number,
  longitude: number
): Promise<{ name: string; distance: number } | null> {
  try {
    const response = await fetch('/api/nearest-mrt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: latitude,
        lng: longitude,
      }),
    });
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const nearest = data[0];
      
      return {
        name: nearest.name?.replace(/ MRT STATION/gi, '').replace(/ LRT STATION/gi, '').trim() || nearest.name,
        distance: Math.round((nearest.distance || 0) * 100) / 100
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

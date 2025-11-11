export async function findNearestMRT(
  latitude: number,
  longitude: number
): Promise<{ name: string; distance: number } | null> {
  try {
    // Get token from environment variable instead of hardcoding
    const token = process.env.ONEMAP_TOKEN || '';
    
    if (!token) {
      console.error('❌ ONEMAP_TOKEN not configured');
      return null;
    }
    
    console.log('🚇 Calling server API for MRT');

    const response = await fetch('/api/nearest-mrt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: latitude,
        lng: longitude,
        token: token,
      }),
    });
    
    if (!response.ok) {
      console.error('❌ Server API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    console.log('✅ Server response:', data);

    if (Array.isArray(data) && data.length > 0) {
      const nearest = data[0];
      
      return {
        name: nearest.name?.replace(/ MRT STATION/gi, '').replace(/ LRT STATION/gi, '').trim() || nearest.name,
        distance: Math.round((nearest.distance || 0) * 100) / 100
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Error finding nearest MRT:', error);
    return null;
  }
}

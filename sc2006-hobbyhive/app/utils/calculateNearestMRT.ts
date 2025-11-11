export async function findNearestMRT(
  latitude: number,
  longitude: number
): Promise<{ name: string; distance: number } | null> {
  try {
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDAzNSwiZm9yZXZlciI6ZmFsc2UsImlzcyI6Ik9uZU1hcCIsImlhdCI6MTc2Mjg2NjQxNCwibmJmIjoxNzYyODY2NDE0LCJleHAiOjE3NjMxMjU2MTQsImp0aSI6ImMxNWI3NjcxLTk1NGYtNDA0OS1hYjNkLWY1OTNkNTMzMjk4OSJ9.nYgmR19tmUN7eyZy4WWlwRC7hFTWqHQGjgzJbEm7jTujlULgwrHPwYpZU6k1K6NbSqJP_IVmKW4E52ilB-JUA9DVNhPg7J8nnJG_UVpcrblc2Nj36m1_zzKhGckt9pFKqhiL-wvri7Zs7WLYI4iDwUepmXWtDxZHwC3gRecLd85ibtNlamF5lK02gIAIRZ0f7sNiwXTGI6TrIyi0wyOwbx-w4l1qm4bK2PlCiB32QkgM6NR8jxIiY5vL32gl0QFb5wZHrIMJL6XSyRQDHPGtiDc-n-GfNgkXWqCdYqBbubwptThAIJo7Iwat0-ydehM89Cf4UeZGecn70uX7Q02lRg'; // Replace with your actual token
    
    console.log('🚇 Calling server API for MRT');

    // Use POST to send token in body instead of URL
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

    console.log('⚠️ No MRT stations found');
    return null;
  } catch (error) {
    console.error('❌ Error finding nearest MRT:', error);
    return null;
  }
}

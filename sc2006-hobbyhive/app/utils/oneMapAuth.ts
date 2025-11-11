let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getOneMapToken(): Promise<string | null> {
  // TEMPORARY DEBUG - Remove after testing
  console.log('🔍 ENV CHECK:', {
    email: process.env.ONEMAP_EMAIL ? 'SET' : 'NOT SET',
    password: process.env.ONEMAP_PASSWORD ? 'SET' : 'NOT SET'
  });
  
  // ... rest of your code


  // Return cached token if still valid (with 1 hour buffer before expiry)
  if (cachedToken && Date.now() < tokenExpiry - 3600000) {
    return cachedToken;
  }

  try {
    const email = process.env.ONEMAP_EMAIL;
    const password = process.env.ONEMAP_PASSWORD;

    if (!email || !password) {
      console.error('OneMap credentials not configured');
      return null;
    }

    console.log('🔑 Fetching new OneMap token...');

    const response = await fetch('https://www.onemap.gov.sg/api/auth/post/getToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.access_token && data.expiry_timestamp) {
      cachedToken = data.access_token;
      tokenExpiry = data.expiry_timestamp;
      
      console.log('✅ OneMap token obtained, expires:', new Date(tokenExpiry).toLocaleString());
      
      return cachedToken;
    }

    return null;
  } catch (error) {
    console.error('Error getting OneMap token:', error);
    return null;
  }
}

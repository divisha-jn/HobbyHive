let inMemoryToken: string | null = null;
let tokenExpiry: number = 0;

export const setAccessToken = (token: string, expiryTimestamp: number) => {
  inMemoryToken = token;
  tokenExpiry = expiryTimestamp;
};

export const getInMemoryAccessToken = () => {
  if (inMemoryToken && Date.now() < tokenExpiry - 3600000) {
    return inMemoryToken;
  }
  return null;
};

export const getAccessToken = async (): Promise<string> => {
  try {
    const cachedToken = getInMemoryAccessToken();
    if (cachedToken) {
      return cachedToken;
    }

    const response = await fetch(
      `${process.env.ONEMAP_BASE_URL}/api/auth/post/getToken`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: process.env.ONEMAP_EMAIL,
          password: process.env.ONEMAP_PASSWORD,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.access_token && data.expiry_timestamp) {
      setAccessToken(data.access_token, data.expiry_timestamp);
      return data.access_token;
    }

    throw new Error('Invalid token response');
  } catch (error) {
    console.error('Error getting OneMap token:', error);
    throw error;
  }
};

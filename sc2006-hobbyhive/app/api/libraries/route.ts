import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Libraries dataset ID
    const datasetId = 'd_27b8dae65d9ca1539e14d09578b17cbf';
    const url = `https://api-open.data.gov.sg/v1/public/api/datasets/${datasetId}/poll-download`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const jsonData = await response.json();

    if (jsonData.code !== 0) {
      throw new Error(jsonData.errMsg || 'Failed to fetch data');
    }

    // Get the download URL
    const downloadUrl = jsonData.data.url;
    
    // Fetch the actual GeoJSON data
    const dataResponse = await fetch(downloadUrl);
    
    if (!dataResponse.ok) {
      throw new Error(`Failed to download data: ${dataResponse.status}`);
    }

    const geoJsonData = await dataResponse.json();

    // Transform GeoJSON to simple format
    const libraries = geoJsonData.features.map((feature: any) => {
      const coordinates = feature.geometry.coordinates;
      const description = feature.properties.Description || '';
      
      // Extract NAME from the HTML description
      const nameMatch = description.match(/<th>Name<\/th>\s*<td>(.*?)<\/td>/i);
      const name = nameMatch ? nameMatch[1] : 'Public Library';
      
      // Extract address from the HTML description (if available)
      const addressMatch = description.match(/<th>Description<\/th>\s*<td>(.*?)<\/td>/i);
      const address = addressMatch ? addressMatch[1] : '';
      
      return {
        name: name,
        address: address,
        latitude: coordinates[1],  // GeoJSON is [lng, lat]
        longitude: coordinates[0],
      };
    });

    return NextResponse.json({ 
      success: true, 
      libraries,
      count: libraries.length 
    });

  } catch (error: any) {
    console.error('Error fetching libraries data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch libraries data' 
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Using the new data.gov.sg API format
    const datasetId = 'd_0542d48f0991541706b58059381a6eca';
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

    // Get the download URL from the response
    const downloadUrl = jsonData.data.url;
    
    // Fetch the actual GeoJSON data
    const dataResponse = await fetch(downloadUrl);
    
    if (!dataResponse.ok) {
      throw new Error(`Failed to download data: ${dataResponse.status}`);
    }

    const geoJsonData = await dataResponse.json();

    // Transform GeoJSON to simple park format
    const parks = geoJsonData.features.map((feature: any) => {
      const coordinates = feature.geometry.coordinates;
      const properties = feature.properties;
      
      return {
        name: properties.NAME || 'Unknown Park',
        latitude: coordinates[1],  // GeoJSON is [lng, lat]
        longitude: coordinates[0],
      };
    });

    return NextResponse.json({ 
      success: true, 
      parks,
      count: parks.length 
    });

  } catch (error: any) {
    console.error('Error fetching parks data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch parks data' 
      },
      { status: 500 }
    );
  }
}

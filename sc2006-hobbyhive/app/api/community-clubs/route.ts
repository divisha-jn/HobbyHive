import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Community Clubs dataset ID
    const datasetId = 'd_f706de1427279e61fe41e89e24d440fa';
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
    const clubs = geoJsonData.features.map((feature: any) => {
      const coordinates = feature.geometry.coordinates;
      const description = feature.properties.Description || '';
      
      // Extract NAME from the HTML description
      const nameMatch = description.match(/<th>NAME<\/th>\s*<td>(.*?)<\/td>/);
      const name = nameMatch ? nameMatch[1] : 'Community Club';
      
      // Extract ADDRESSPOSTALCODE from the HTML description
      const postalMatch = description.match(/<th>ADDRESSPOSTALCODE<\/th>\s*<td>(.*?)<\/td>/);
      const addressMatch = description.match(/<th>ADDRESSSTREETNAME<\/th>\s*<td>(.*?)<\/td>/);
      const blockMatch = description.match(/<th>ADDRESSBLOCKHOUSENUMBER<\/th>\s*<td>(.*?)<\/td>/);
      
      const address = [blockMatch?.[1], addressMatch?.[1], postalMatch?.[1]]
        .filter(Boolean)
        .join(' ') || '';
      
      return {
        name: name,
        address: address,
        latitude: coordinates[1],  // GeoJSON is [lng, lat]
        longitude: coordinates[0],
      };
    });

    return NextResponse.json({ 
      success: true, 
      clubs,
      count: clubs.length 
    });

  } catch (error: any) {
    console.error('Error fetching community clubs data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch community clubs data' 
      },
      { status: 500 }
    );
  }
}

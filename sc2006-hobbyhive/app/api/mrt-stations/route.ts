import { NextResponse } from 'next/server';

let cachedStations: any[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function fetchMRTStations() {
  // Return cached data if still valid
  if (cachedStations && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedStations;
  }

  try {
    const datasetId = 'd_b39d3a0871985372d7e1637193335da5';
    const url = `https://api-open.data.gov.sg/v1/public/api/datasets/${datasetId}/poll-download`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const jsonData = await response.json();

    if (jsonData.code !== 0) {
      throw new Error(jsonData.errMsg || 'Failed to fetch data');
    }

    const downloadUrl = jsonData.data.url;
    const dataResponse = await fetch(downloadUrl);
    
    if (!dataResponse.ok) {
      throw new Error(`Failed to download data: ${dataResponse.status}`);
    }

    const geoJsonData = await dataResponse.json();
    const stationsMap = new Map();
    
    geoJsonData.features.forEach((feature: any) => {
      const description = feature.properties.Description || '';
      const coordinates = feature.geometry.coordinates;
      
      const stationMatch = description.match(/<th>STATION_NA<\/th>\s*<td>(.*?)<\/td>/);
      const exitMatch = description.match(/<th>EXIT_CODE<\/th>\s*<td>(.*?)<\/td>/);
      
      if (stationMatch) {
        const stationName = stationMatch[1]
          .replace(/ MRT STATION/gi, '')
          .replace(/ LRT STATION/gi, '')
          .trim();
        
        if (!stationsMap.has(stationName)) {
          stationsMap.set(stationName, {
            name: stationName,
            latitude: coordinates[1],
            longitude: coordinates[0],
            exits: [exitMatch ? exitMatch[1] : '']
          });
        } else {
          const station = stationsMap.get(stationName);
          if (exitMatch) {
            station.exits.push(exitMatch[1]);
          }
        }
      }
    });

    const stations = Array.from(stationsMap.values()).map((station: any) => ({
      name: station.name,
      latitude: station.latitude,
      longitude: station.longitude,
      exitCount: station.exits.filter((e: any) => e).length
    }));

    // Cache the result
    cachedStations = stations;
    cacheTime = Date.now();

    return stations;
  } catch (error: any) {
    console.error('Error fetching MRT stations:', error);
    // If cache exists but is stale, return it as fallback
    if (cachedStations) {
      return cachedStations;
    }
    throw error;
  }
}

export async function GET() {
  try {
    const stations = await fetchMRTStations();

    return NextResponse.json({
      success: true,
      stations,
      count: stations.length
    }, {
      headers: {
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      }
    });

  } catch (error: any) {
    console.error('Error in MRT API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch MRT stations data',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

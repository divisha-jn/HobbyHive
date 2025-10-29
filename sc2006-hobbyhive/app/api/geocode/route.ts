import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // OneMap Search API (FREE, no API key needed!)
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OneMap API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Transform the results
    const results = data.results?.map((result: any) => ({
      name: result.SEARCHVAL || result.BUILDING || result.ADDRESS,
      address: result.ADDRESS,
      postalCode: result.POSTAL !== 'NIL' ? result.POSTAL : null,
      latitude: parseFloat(result.LATITUDE),
      longitude: parseFloat(result.LONGITUDE),
      building: result.BUILDING,
      roadName: result.ROAD_NAME,
      blockNo: result.BLK_NO,
    })) || [];

    return NextResponse.json({
      success: true,
      found: data.found || 0,
      totalPages: data.totalNumPages || 0,
      results,
    });

  } catch (error: any) {
    console.error('Error in geocoding:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to geocode address',
      },
      { status: 500 }
    );
  }
}

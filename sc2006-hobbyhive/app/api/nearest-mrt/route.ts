import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get token from environment variable (server-side only)
    const token = process.env.ONEMAP_TOKEN;

    if (!token) {
      console.error('❌ ONEMAP_TOKEN not configured in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('🚇 Calling OneMap API with token');

    const url = `https://www.onemap.gov.sg/api/public/nearbysvc/getNearestMrtStops?latitude=${lat}&longitude=${lng}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OneMap error:', errorText);
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Success:', data.length, 'stations');

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Server error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

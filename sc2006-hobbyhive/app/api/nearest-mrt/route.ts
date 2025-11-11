import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng, token } = body;

    if (!lat || !lng || !token) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('🚇 Calling OneMap with:', lat, lng);

    // Use the exact parameter names from OneMap API docs
    const url = `https://www.onemap.gov.sg/api/public/nearbysvc/getNearestMrtStops?latitude=${lat}&longitude=${lng}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': token, // Try without Bearer first
      },
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', errorText);
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Success:', data.length, 'stations');

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

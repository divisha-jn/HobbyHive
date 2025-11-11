import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/app/utils/oneMapTokenManager';

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

    let token: string;
    try {
      token = await getAccessToken();
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }

    const url = `https://www.onemap.gov.sg/api/public/nearbysvc/getNearestMrtStops?latitude=${lat}&longitude=${lng}`;
    
    let response = await fetch(url, {
      headers: {
        'Authorization': token,
      },
    });

    // Retry with fresh token if expired
    if (response.status === 401) {
      token = await getAccessToken();
      response = await fetch(url, {
        headers: {
          'Authorization': token,
        },
      });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch MRT data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

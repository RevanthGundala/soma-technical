import { NextResponse } from 'next/server';
import { createClient } from 'pexels';

const client = createClient(process.env.PEXELS_API_KEY!);

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const response = await client.photos.search({ query, per_page: 1 });
    
    if ('photos' in response && response.photos.length > 0) {
      return NextResponse.json({ imageUrl: response.photos[0].src.medium });
    } else {
      return NextResponse.json({ imageUrl: null });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching image from Pexels' }, { status: 500 });
  }
} 
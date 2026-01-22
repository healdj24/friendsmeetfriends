import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // First fetch the forecast time
    const fcstTimeRes = await fetch(
      'https://www.wpc.ncep.noaa.gov/Prob_Precip/hourly-data/latest/fcst_time.txt?' + Date.now()
    );
    const fcstTime = (await fcstTimeRes.text()).trim();

    // Then fetch the image
    const imageUrl = `https://www.wpc.ncep.noaa.gov/Prob_Precip/idss-map/mapgen.php?office=OKX&summary=true&pointpreferences=OKX&ptype=prob_sn&product=expected&${fcstTime}`;

    const imageRes = await fetch(imageUrl);
    const imageBuffer = await imageRes.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error fetching snowfall image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}

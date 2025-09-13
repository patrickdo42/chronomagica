import { NextRequest, NextResponse } from 'next/server';
import * as Astronomy from '../../../components/astronomy';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bodyName = searchParams.get('body');
    const dateString = searchParams.get('date');

    if (!bodyName || !dateString) {
      return NextResponse.json({ error: 'Missing required parameters: body, date' }, { status: 400 });
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const body = Astronomy.Body[bodyName as keyof typeof Astronomy.Body];

    if (!body || body === Astronomy.Body.Sun || body === Astronomy.Body.Moon || body === Astronomy.Body.Earth) {
      return NextResponse.json({ error: `Invalid body for retrograde calculation: ${bodyName}` }, { status: 400 });
    }

    const time = Astronomy.MakeTime(date);
    const dt = 1; // 1 day time step for checking longitude change

    // Function to get geocentric ecliptic longitude
    const getGeocentricEclipticLongitude = (t: Astronomy.AstroTime) => {
      const geoVector = Astronomy.GeoVector(body, t, true); // true for aberration correction
      const eclipticCoords = Astronomy.Ecliptic(geoVector);
      return eclipticCoords.elon;
    };

    // Calculate geocentric ecliptic longitude at three points: t-dt, t, t+dt
    const lon1 = getGeocentricEclipticLongitude(time.AddDays(-dt));
    const lon2 = getGeocentricEclipticLongitude(time);
    const lon3 = getGeocentricEclipticLongitude(time.AddDays(dt));

    // Determine if the planet is in retrograde motion
    // Retrograde motion means the apparent longitude is decreasing.
    // We need to handle the 0/360 degree wrap-around.
    let isRetrograde = false;

    // Calculate the change in longitude from t-dt to t, and from t to t+dt
    let diff1 = lon2 - lon1;
    let diff2 = lon3 - lon2;

    // Normalize differences to handle 0/360 degree wrap-around
    // A positive value means increasing longitude, negative means decreasing.
    if (diff1 > 180) diff1 -= 360;
    if (diff1 < -180) diff1 += 360;
    if (diff2 > 180) diff2 -= 360;
    if (diff2 < -180) diff2 += 360;


    // If the longitude is decreasing (diff2 is negative), it's retrograde
    if (diff2 < 0) {
        isRetrograde = true;
    } else {
        isRetrograde = false;
    }

    return NextResponse.json({
      body: bodyName,
      date: dateString,
      isRetrograde: isRetrograde,
    });
  } catch (error: any) {
    console.error('Error in planet-retrograde API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

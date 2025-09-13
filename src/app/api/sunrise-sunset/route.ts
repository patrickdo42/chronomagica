import { NextRequest, NextResponse } from 'next/server';
import * as Astronomy from '../../../components/astronomy';
import { Body } from '../../../components/astronomy';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const height = parseFloat(searchParams.get('height') || '0');
    const bodyName = searchParams.get('body');
    const dateString = searchParams.get('date');
    const direction = parseInt(searchParams.get('direction') || '1');

    if (!bodyName || !dateString) {
      return NextResponse.json({ error: 'Missing required parameters: body, date' }, { status: 400 });
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const observer = new Astronomy.Observer(latitude, longitude, height);
    let body: Body;
    if (bodyName === "Sol") {
      body = Astronomy.Body.Sun;
    } else {
      const bodyEnumMember = Astronomy.Body[bodyName as keyof typeof Astronomy.Body];
      if (bodyEnumMember === undefined) {
        return NextResponse.json({ error: `Invalid body name: ${bodyName}` }, { status: 400 });
      }
      body = bodyEnumMember;
    }

    const searchDate = Astronomy.MakeTime(date);
    const result = Astronomy.SearchRiseSet(body, observer, direction, searchDate, 365); // Search within 365 days

    let timeString: string | null = null;
    if (result) {
      // Assert that result is indeed an AstroTime object and its date property is not null/undefined.
      // This is safe because SearchRiseSet returns AstroTime | null, and we've checked for null.
      // The AstroTime constructor guarantees the 'date' property is set.
      timeString = (result as Astronomy.AstroTime).date!.toISOString();
    }

    return NextResponse.json({
      time: timeString,
    });
  } catch (error: any) {
    console.error('Error in sunrise-sunset API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

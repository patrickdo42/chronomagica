import {
    Body,
    Observer,
    SearchRiseSet,
    MoonPhase,
    EclipticLongitude,
    MakeTime
} from 'astronomy-engine';

export type PlanetStatus = {
    name: string;
    symbol: string;
    sign: string;
    signSymbol: string;
    isRetrograde: boolean;
    color: string;
    darkModeColor: string;
    status?: string;
};

export type PlanetaryHour = {
    start: Date;
    end: Date;
    planet: string;
    symbol: string;
};

const PLANETS = [
    { name: 'Sol', symbol: '☉', body: Body.Sun, color: '#ffd071', darkColor: '#ac7403' },
    { name: 'Luna', symbol: '☽︎', body: Body.Moon, color: '#d1d1d1', darkColor: '#919191' },
    { name: 'Mercury', symbol: '☿', body: Body.Mercury, color: '#fff59c', darkColor: '#918308' },
    { name: 'Venus', symbol: '♀', body: Body.Venus, color: '#95f3ad', darkColor: '#004812' },
    { name: 'Mars', symbol: '♂', body: Body.Mars, color: '#ffc5c5', darkColor: '#7a0000' },
    { name: 'Jupiter', symbol: '♃', body: Body.Jupiter, color: '#9fdcff', darkColor: '#00467f' },
    { name: 'Saturn', symbol: '♄', body: Body.Saturn, color: '#a5a5a5', darkColor: '#1d1d1d' },
    { name: 'Uranus', symbol: '♅', body: Body.Uranus, color: '#c9bcff', darkColor: '#250076' },
    { name: 'Neptune', symbol: '♆', body: Body.Neptune, color: '#f9b6ff', darkColor: '#7b0085' },
    { name: 'Pluto', symbol: '⯓', body: Body.Pluto, color: '#e5baa5', darkColor: '#4f2916' },
];

const ZODIAC = [
    { name: 'Aries', symbol: '♈︎' },
    { name: 'Taurus', symbol: '♉︎' },
    { name: 'Gemini', symbol: '♊︎' },
    { name: 'Cancer', symbol: '♋︎' },
    { name: 'Leo', symbol: '♌︎' },
    { name: 'Virgo', symbol: '♍︎' },
    { name: 'Libra', symbol: '♎︎' },
    { name: 'Scorpio', symbol: '♏︎' },
    { name: 'Sagittarius', symbol: '♐︎' },
    { name: 'Capricorn', symbol: '♑︎' },
    { name: 'Aquarius', symbol: '♒︎' },
    { name: 'Pisces', symbol: '♓︎' },
];

const MOON_PHASES = [
    { name: 'New Moon', symbol: '🌑︎' },
    { name: 'Waxing Crescent', symbol: '🌒︎' },
    { name: 'First Quarter', symbol: '🌓︎' },
    { name: 'Waxing Gibbous', symbol: '🌔︎' },
    { name: 'Full Moon', symbol: '🌕︎' },
    { name: 'Waning Gibbous', symbol: '🌖︎' },
    { name: 'Last Quarter', symbol: '🌗︎' },
    { name: 'Waning Crescent', symbol: '🌘︎' },
];

function getZodiacSign(longitude: number) {
    const index = Math.floor(longitude / 30) % 12;
    return ZODIAC[index];
}

function getMoonPhaseData(date: Date) {
    const phase = MoonPhase(date);
    const segment = Math.round(phase / 45) % 8;
    return MOON_PHASES[segment];
}

function isRetrograde(body: Body, date: Date): boolean {
    if (body === Body.Sun || body === Body.Moon) return false;

    const t1 = MakeTime(date);
    const t0 = MakeTime(new Date(date.getTime() - 86400000));

    const lon1 = EclipticLongitude(body, t1);
    const lon0 = EclipticLongitude(body, t0);

    let diff = lon1 - lon0;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;

    return diff < 0;
}

export function getPlanetaryData(date: Date, _observer: Observer): PlanetStatus[] {
    const astroTime = MakeTime(date);

    return PLANETS.map(planet => {
        let longitude: number;

        if (planet.body === Body.Sun) {
            longitude = EclipticLongitude(Body.Earth, astroTime) + 180;
            if (longitude >= 360) longitude -= 360;
        } else {
            longitude = EclipticLongitude(planet.body, astroTime);
        }

        const zodiac = getZodiacSign(longitude);

        let status = '';
        let isRetro = false;

        if (planet.name === 'Luna') {
            const moonPhase = getMoonPhaseData(date);
            status = moonPhase.name + ' ' + moonPhase.symbol;
        } else if (planet.name === 'Sol') {
            // Eclipse detection would go here
        } else {
            isRetro = isRetrograde(planet.body, date);
        }

        return {
            name: planet.name,
            symbol: planet.symbol,
            sign: zodiac.name,
            signSymbol: zodiac.symbol,
            isRetrograde: isRetro,
            color: planet.color,
            darkModeColor: planet.darkColor,
            status: status
        };
    });
}

export function getLuckStatus(date: Date): { text: string; color: string } {
    const phase = MoonPhase(date);
    const age = (phase / 360) * 29.53059;
    const day = Math.floor(age) + 1;

    let status = 'neutral';
    let color = '#000';

    if ([1, 2, 7, 14, 17].includes(day)) {
        status = 'lucky';
        color = '#009626';
    } else if ([5, 15, 25].includes(day)) {
        status = 'unlucky';
        color = '#ff0036';
    }

    return { text: `Today is ${status}.`, color };
}

const CHALDEAN_BODIES = [Body.Saturn, Body.Jupiter, Body.Mars, Body.Sun, Body.Venus, Body.Mercury, Body.Moon];

function getDayRuler(date: Date): number {
    const dayOfWeek = date.getDay();
    const rulerIndices = [3, 6, 2, 4, 1, 5, 0];
    return rulerIndices[dayOfWeek];
}

export function getPlanetaryHours(date: Date, observer: Observer): PlanetaryHour[] {
    const astroTime = MakeTime(date);
    const sunrise = SearchRiseSet(Body.Sun, observer, +1, astroTime, 1);
    const sunset = SearchRiseSet(Body.Sun, observer, -1, astroTime, 1);

    if (!sunrise || !sunset) return [];

    const riseTime = sunrise.date;
    const setTime = sunset.date;

    const dayLength = setTime.getTime() - riseTime.getTime();
    const dayHourLength = dayLength / 12;

    const nextDay = MakeTime(new Date(date.getTime() + 24 * 3600000));
    const nextSunrise = SearchRiseSet(Body.Sun, observer, +1, nextDay, 1);
    const nextRiseTime = nextSunrise ? nextSunrise.date : new Date(riseTime.getTime() + 24 * 3600000);
    const nightLength = nextRiseTime.getTime() - setTime.getTime();
    const nightHourLength = nightLength / 12;

    let rulerIndex = getDayRuler(date);
    const hours: PlanetaryHour[] = [];

    for (let i = 0; i < 12; i++) {
        const start = new Date(riseTime.getTime() + i * dayHourLength);
        const end = new Date(riseTime.getTime() + (i + 1) * dayHourLength);
        const planetInfo = PLANETS.find(p => p.body === CHALDEAN_BODIES[rulerIndex % 7])!;

        hours.push({
            start,
            end,
            planet: planetInfo.name,
            symbol: planetInfo.symbol
        });
        rulerIndex++;
    }

    for (let i = 0; i < 12; i++) {
        const start = new Date(setTime.getTime() + i * nightHourLength);
        const end = new Date(setTime.getTime() + (i + 1) * nightHourLength);
        const planetInfo = PLANETS.find(p => p.body === CHALDEAN_BODIES[rulerIndex % 7])!;

        hours.push({
            start,
            end,
            planet: planetInfo.name,
            symbol: planetInfo.symbol
        });
        rulerIndex++;
    }

    return hours;
}

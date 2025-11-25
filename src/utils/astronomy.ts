import {
    Body,
    Observer,
    SearchRiseSet,
    MoonPhase,
    Ecliptic,
    MakeTime,
    Equator
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
    { name: 'Sol', symbol: '☉', body: 'Sun', color: '#ffd071', darkColor: '#ac7403' },
    { name: 'Luna', symbol: '☽︎', body: 'Moon', color: '#d1d1d1', darkColor: '#919191' },
    { name: 'Mercury', symbol: '☿', body: 'Mercury', color: '#fff59c', darkColor: '#918308' },
    { name: 'Venus', symbol: '♀', body: 'Venus', color: '#95f3ad', darkColor: '#004812' },
    { name: 'Mars', symbol: '♂', body: 'Mars', color: '#ffc5c5', darkColor: '#7a0000' },
    { name: 'Jupiter', symbol: '♃', body: 'Jupiter', color: '#9fdcff', darkColor: '#00467f' },
    { name: 'Saturn', symbol: '♄', body: 'Saturn', color: '#a5a5a5', darkColor: '#1d1d1d' },
    { name: 'Uranus', symbol: '♅', body: 'Uranus', color: '#c9bcff', darkColor: '#250076' },
    { name: 'Neptune', symbol: '♆', body: 'Neptune', color: '#f9b6ff', darkColor: '#7b0085' },
    { name: 'Pluto', symbol: '⯓', body: 'Pluto', color: '#e5baa5', darkColor: '#4f2916' },
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

function isRetrograde(body: string, date: Date): boolean {
    if (body === 'Sun' || body === 'Moon') return false;

    const t1 = date;
    const t0 = new Date(date.getTime() - 86400000); // 1 day ago

    const equ1 = Equator(body, t1, null as any, false, true);
    const equ0 = Equator(body, t0, null as any, false, true);

    let diff = equ1.ra - equ0.ra;
    if (diff < -12) diff += 24;
    if (diff > 12) diff -= 24;

    return diff < 0;
}

export function getPlanetaryData(date: Date, _observer: Observer): PlanetStatus[] {
    return PLANETS.map(planet => {
        const equ = Equator(planet.body, date, null as any, false, true);
        const ecl = Ecliptic(planet.body, date);
        const zodiac = getZodiacSign(ecl.elon);

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

const CHALDEAN_ORDER = [
    Body.Saturn, Body.Jupiter, Body.Mars, Body.Sun, Body.Venus, Body.Mercury, Body.Moon
];

const CHALDEAN_NAMES = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

function getDayRuler(date: Date): string {
    const dayOfWeek = date.getDay();
    const rulers = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    return rulers[dayOfWeek];
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

    const dayRuler = getDayRuler(date);
    let rulerIndex = CHALDEAN_NAMES.indexOf(dayRuler);

    const hours: PlanetaryHour[] = [];

    for (let i = 0; i < 12; i++) {
        const start = new Date(riseTime.getTime() + i * dayHourLength);
        const end = new Date(riseTime.getTime() + (i + 1) * dayHourLength);
        const planetName = CHALDEAN_NAMES[rulerIndex % 7];
        const planetInfo = PLANETS.find(p => p.body === planetName)!;

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
        const planetName = CHALDEAN_NAMES[rulerIndex % 7];
        const planetInfo = PLANETS.find(p => p.body === planetName)!;

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

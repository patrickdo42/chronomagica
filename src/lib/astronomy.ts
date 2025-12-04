import {
	Body,
	MoonPhase,
	MakeTime,
	Ecliptic,
	GeoVector,
	SearchGlobalSolarEclipse,
	SearchLunarEclipse,
} from 'astronomy-engine'

type Planet = {
	name: string
	body: Body
	symbol: string
	color: string
	darkColor: string
}

export const PLANETS: Planet[] = [
	{
		name: 'Sol',
		symbol: '☉',
		body: Body.Sun,
		color: '#ffd071',
		darkColor: '#ac7403',
	},
	{
		name: 'Luna',
		symbol: '☽︎',
		body: Body.Moon,
		color: '#d1d1d1',
		darkColor: '#919191',
	},
	{
		name: 'Mercury',
		symbol: '☿',
		body: Body.Mercury,
		color: '#fff59c',
		darkColor: '#918308',
	},
	{
		name: 'Venus',
		symbol: '♀',
		body: Body.Venus,
		color: '#95f3ad',
		darkColor: '#004812',
	},
	{
		name: 'Mars',
		symbol: '♂',
		body: Body.Mars,
		color: '#ffc5c5',
		darkColor: '#7a0000',
	},
	{
		name: 'Jupiter',
		symbol: '♃',
		body: Body.Jupiter,
		color: '#9fdcff',
		darkColor: '#00467f',
	},
	{
		name: 'Saturn',
		symbol: '♄',
		body: Body.Saturn,
		color: '#a5a5a5',
		darkColor: '#1d1d1d',
	},
	{
		name: 'Uranus',
		symbol: '♅',
		body: Body.Uranus,
		color: '#c9bcff',
		darkColor: '#250076',
	},
	{
		name: 'Neptune',
		symbol: '♆',
		body: Body.Neptune,
		color: '#f9b6ff',
		darkColor: '#7b0085',
	},
	{
		name: 'Pluto',
		symbol: '♇',
		body: Body.Pluto,
		color: '#e5baa5',
		darkColor: '#4f2916',
	},
]

type Zodiac = {
	name: string
	symbol: string
}

export const ZODIAC: Zodiac[] = [
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
]

type MoonPhase = {
	name: string
	symbol: string
}

export const MOON_PHASES: MoonPhase[] = [
	{ name: 'New Moon', symbol: '🌑︎' },
	{ name: 'Waxing Crescent', symbol: '🌒︎' },
	{ name: 'First Quarter', symbol: '🌓︎' },
	{ name: 'Waxing Gibbous', symbol: '🌔︎' },
	{ name: 'Full Moon', symbol: '🌕︎' },
	{ name: 'Waning Gibbous', symbol: '🌖︎' },
	{ name: 'Last Quarter', symbol: '🌗︎' },
	{ name: 'Waning Crescent', symbol: '🌘︎' },
]

export function isRetrograde(body: Body, date: Date): boolean {
	if (body === Body.Sun || body === Body.Moon) return false

	const time1 = MakeTime(date)
	const time0 = MakeTime(new Date(date.getTime() - 3600000)) // 1 hour ago

	const vec1 = GeoVector(body, time1, true)
	const vec0 = GeoVector(body, time0, true)

	const ecl1 = Ecliptic(vec1)
	const ecl0 = Ecliptic(vec0)

	let diff = ecl1.elon - ecl0.elon
	// Handle wrap around 360
	if (diff < -180) diff += 360
	if (diff > 180) diff -= 360

	return diff < 0
}

export function getLuckStatus(date: Date): {
	status: 'neutral' | 'lucky' | 'unlucky'
	color: string
} {
	const phase = MoonPhase(MakeTime(date))
	const age = (phase / 360) * 29.53059
	const day = Math.floor(age) + 1

	if ([1, 2, 7, 14, 17].includes(day)) {
		return {
			status: 'lucky',
			color: '#009626',
		}
	} else if ([5, 15, 25].includes(day)) {
		return {
			status: 'unlucky',
			color: '#ff0036',
		}
	} else {
		return {
			status: 'neutral',
			color: '#000',
		}
	}
}

export function getPlanetaryStatus(
	planet: Planet,
	date: Date,
): MoonPhase | 'Solar Eclipse' | 'Lunar Eclipse' | '℞ Retrograde' | undefined {
	const t = MakeTime(date)

	const isSameDay = (d1: Date, d2: Date) =>
		d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate()

	if (planet.name === 'Luna') {
		const moonPhase = getMoonPhase(date)
		return moonPhase
	} else if (planet.name === 'Sol') {
		const solarEclipse = SearchGlobalSolarEclipse(t)
		if (isSameDay(date, solarEclipse.peak.date)) {
			return 'Solar Eclipse'
		}

		const lunarEclipse = SearchLunarEclipse(t)
		if (isSameDay(date, lunarEclipse.peak.date)) {
			return 'Lunar Eclipse'
		}
	} else if (isRetrograde(planet.body, date)) {
		return '℞ Retrograde'
	}

	return undefined
}

export function getZodiacSign(planet: Planet, date: Date): Zodiac {
	const time = MakeTime(date)
	const vec = GeoVector(planet.body, time, true)
	const ecl = Ecliptic(vec)
	const index = Math.floor(ecl.elon / 30) % 12
	return ZODIAC[index]
}

function getMoonPhase(date: Date): MoonPhase {
	const phase = MoonPhase(MakeTime(date))
	const segment = Math.round(phase / 45) % 8
	return MOON_PHASES[segment]
}

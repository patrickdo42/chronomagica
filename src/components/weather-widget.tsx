import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface WeatherData {
	location: string
	temp: number
	high: number
	low: number
	condition: string
	conditionEmoji: string
	humidity: number
	windSpeed: number
}

interface GeolocationPositionError {
	code: number
	message: string
}

export function WeatherWidget() {
	const [weather, setWeather] = useState<WeatherData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [hasLocation, setHasLocation] = useState(false)
	const [currentTime, setCurrentTime] = useState(new Date())

	// Update time every second
	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000)
		return () => clearInterval(timer)
	}, [])

	const formattedTime = currentTime.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit',
	})

	const formattedDate = currentTime.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	})

	const getWeatherEmoji = (condition: string): string => {
		const c = condition.toLowerCase()
		if (c.includes('clear') || c.includes('sunny')) return '☀️'
		if (c.includes('cloud')) return '☁️'
		if (c.includes('rain')) return '🌧️'
		if (c.includes('snow')) return '❄️'
		if (c.includes('thunder') || c.includes('storm')) return '⛈️'
		if (c.includes('fog') || c.includes('mist')) return '🌫️'
		return '🌤️'
	}

	useEffect(() => {
		const getLocationAndWeather = async () => {
			try {
				setLoading(true)
				setError(null)

				const position = await new Promise<GeolocationPosition>(
					(resolve, reject) => {
						if (!navigator.geolocation) {
							reject(new Error('Geolocation is not supported'))
							return
						}
						navigator.geolocation.getCurrentPosition(resolve, reject, {
							enableHighAccuracy: true,
							timeout: 10000,
							maximumAge: 300000,
						})
					},
				)

				const { latitude, longitude } = position.coords
				setHasLocation(true)

				const weatherResponse = await fetch(
					`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
				)

				if (!weatherResponse.ok) throw new Error('Failed to fetch weather')

				const weatherData = await weatherResponse.json()

				const weatherCodes: Record<number, string> = {
					0: 'Clear sky',
					1: 'Mainly clear',
					2: 'Partly cloudy',
					3: 'Overcast',
					45: 'Fog',
					48: 'Rime fog',
					51: 'Light drizzle',
					53: 'Drizzle',
					55: 'Dense drizzle',
					61: 'Light rain',
					63: 'Rain',
					65: 'Heavy rain',
					71: 'Light snow',
					73: 'Snow',
					75: 'Heavy snow',
					80: 'Rain showers',
					95: 'Thunderstorm',
				}

				const condition =
					weatherCodes[weatherData.current.weather_code] || 'Unknown'
				const temp = Math.round(weatherData.current.temperature_2m)
				const high = Math.round(weatherData.daily.temperature_2m_max[0])
				const low = Math.round(weatherData.daily.temperature_2m_min[0])

				let location = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
				try {
					const geoResponse = await fetch(
						`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
					)
					if (geoResponse.ok) {
						const geoData = await geoResponse.json()
						location = geoData.city
							? `${geoData.city}, ${geoData.countryCode || ''}`.trim()
							: location
					}
				} catch {
					// Keep coordinates if geocoding fails
				}

				setWeather({
					location,
					temp,
					high,
					low,
					condition,
					conditionEmoji: getWeatherEmoji(condition),
					humidity: weatherData.current.relative_humidity_2m,
					windSpeed: Math.round(weatherData.current.wind_speed_10m),
				})
			} catch (err) {
				const error = err as GeolocationPositionError | Error
				if ('code' in error) {
					const messages: Record<number, string> = {
						1: 'Location access denied',
						2: 'Location unavailable',
						3: 'Location request timed out',
					}
					setError(messages[error.code] || 'Failed to get location')
				} else {
					setError(error.message || 'Failed to fetch weather')
				}
				setHasLocation(false)
			} finally {
				setLoading(false)
			}
		}

		getLocationAndWeather()
	}, [])

	const TimeDisplay = () => (
		<div className="text-center">
			<div className="font-mono text-4xl font-light tracking-tight">
				{formattedTime}
			</div>
			<div className="text-muted-foreground mt-1 text-sm">{formattedDate}</div>
		</div>
	)

	if (loading) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center gap-6 p-6">
					<TimeDisplay />
					<div className="flex items-center gap-2">
						<div className="border-muted-foreground h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
						<span className="text-muted-foreground text-xs">
							Fetching weather...
						</span>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (error || !hasLocation || !weather) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center gap-6 p-6">
					<TimeDisplay />
					<div className="text-muted-foreground text-center text-xs">
						{error || 'Enable location for weather'}
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardContent className="flex flex-col items-center gap-6 p-6">
				<TimeDisplay />
				<div className="flex items-center gap-8">
					<div className="flex items-center gap-3">
						<span className="text-5xl">{weather.conditionEmoji}</span>
						<div>
							<div className="text-3xl font-semibold">{weather.temp}°</div>
							<div className="text-muted-foreground text-xs">
								{weather.high}° / {weather.low}°
							</div>
						</div>
					</div>
					<div className="text-muted-foreground space-y-0.5 text-xs">
						<div className="text-foreground text-lg font-medium">
							{weather.location}
						</div>
						<div>{weather.condition}</div>
						<div>
							{weather.humidity}% humidity · {weather.windSpeed} mph
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

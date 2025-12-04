import { useEffect, useState } from 'react'
import { Lightbulb } from 'lucide-react'

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

	const [currentTime, setCurrentTime] = useState(new Date())

	// Update time every second
	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000)
		return () => clearInterval(timer)
	}, [])

	const formattedTime = currentTime.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
	})

	const formattedDate = currentTime.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})

	const weatherCodeMap: Record<number, { description: string; emoji: string }> = {
		0: { description: 'Clear sky', emoji: '☀️' },
		1: { description: 'Mainly clear', emoji: '🌤️' },
		2: { description: 'Partly cloudy', emoji: '⛅' },
		3: { description: 'Overcast', emoji: '☁️' },
		45: { description: 'Fog', emoji: '🌫️' },
		48: { description: 'Rime fog', emoji: '🌫️' },
		51: { description: 'Light drizzle', emoji: '🌧️' },
		53: { description: 'Drizzle', emoji: '🌧️' },
		55: { description: 'Dense drizzle', emoji: '🌧️' },
		61: { description: 'Light rain', emoji: '🌧️' },
		63: { description: 'Rain', emoji: '🌧️' },
		65: { description: 'Heavy rain', emoji: '🌧️' },
		71: { description: 'Light snow', emoji: '❄️' },
		73: { description: 'Snow', emoji: '❄️' },
		75: { description: 'Heavy snow', emoji: '❄️' },
		80: { description: 'Rain showers', emoji: '🌧️' },
		81: { description: 'Rain showers', emoji: '🌧️' },
		82: { description: 'Heavy rain showers', emoji: '🌧️' },
		85: { description: 'Light snow showers', emoji: '❄️' },
		86: { description: 'Heavy snow showers', emoji: '❄️' },
		95: { description: 'Thunderstorm', emoji: '⛈️' },
		96: { description: 'Thunderstorm with light hail', emoji: '⛈️' },
		99: { description: 'Thunderstorm with heavy hail', emoji: '⛈️' },
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

				const weatherResponse = await fetch(
					`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=fahrenheit`,
				)

				if (!weatherResponse.ok) throw new Error('Failed to fetch weather')

				const weatherData = await weatherResponse.json()

				const weatherCode = weatherData.current.weather_code
				const weatherInfo = weatherCodeMap[weatherCode]
				
				if (!weatherInfo) {
					throw new Error(`Missing weather code mapping for code: ${weatherCode}`)
				}

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
							? `${geoData.city}, ${geoData.principalSubdivisionCode || ''}`.trim()
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
					condition: weatherInfo.description,
					conditionEmoji: weatherInfo.emoji,
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
			} finally {
				setLoading(false)
			}
		}

		getLocationAndWeather()
	}, [])

	return (
		<div className="w-full max-w-2xl bg-white p-4 text-black font-serif">
			<div className="relative mb-6 text-center">
				<Lightbulb className="absolute -top-2 right-0 h-8 w-8 text-yellow-900" strokeWidth={1.5} />
				
				<div className="flex items-center justify-center gap-4">
					<span className="text-4xl text-[#4a042e]">◀</span>
					<h1 className="text-5xl text-[#4a042e] font-decorative leading-tight">
						Today's Energies
					</h1>
					<span className="text-4xl text-[#4a042e]">▶</span>
				</div>

				<div className="mt-2 flex justify-between text-lg font-serif text-gray-800">
					<div className="text-left">
						<div>{formattedDate}</div>
						<div>{weather?.location || (loading ? 'Locating...' : 'Location Unavailable')}</div>
					</div>
					<div className="text-right">
						<div>{formattedTime}</div>
						<div className="flex items-center justify-end gap-1">
							{loading ? (
								<span>Loading weather...</span>
							) : weather ? (
								<>
									{weather.temp}° F, {weather.condition} <span className="text-xl">{weather.conditionEmoji}</span>
								</>
							) : (
								<span>{error || 'Weather Unavailable'}</span>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PlanetaryTable } from '@/components/planetary-table'
import { WeatherWidget } from '@/components/weather-widget'
import { PlanetaryHours } from '@/components/planetary-hours'

export const Route = createFileRoute('/')({
	component: Home,
})

function Home() {
	const [date, setDate] = React.useState(new Date())
	const [location, setLocation] = React.useState<{
		lat: number
		lon: number
	} | null>(null)

	// Update time every second
	React.useEffect(() => {
		const timer = setInterval(() => setDate(new Date()), 1000)
		return () => clearInterval(timer)
	}, [])

	// Get location
	React.useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setLocation({
						lat: position.coords.latitude,
						lon: position.coords.longitude,
					})
				},
				(error) => {
					console.error('Error getting location:', error)
				},
			)
		}
	}, [])

	return (
		<>
			{/* Content */}
			<div className="flex w-full flex-col items-center gap-4 p-4">
				<WeatherWidget location={location} />
				<PlanetaryTable date={date} />
				<PlanetaryHours date={date} location={location} />
			</div>
		</>
	)
}

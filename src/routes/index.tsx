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

	// Update time every second
	React.useEffect(() => {
		const timer = setInterval(() => setDate(new Date()), 1000)
		return () => clearInterval(timer)
	}, [])

	return (
		<>
			{/* Content */}
			<div className="flex w-full flex-col items-center gap-4 p-4">
				<WeatherWidget />
				<PlanetaryTable date={date} />
				<PlanetaryHours />
			</div>
			
			{/* Footer */}
			<div className="mt-6 text-center">
				<p className="text-2xl font-bold text-[#228b22]">Today is lucky.</p>
			</div>
		</>
	)
}

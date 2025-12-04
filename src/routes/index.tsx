import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PlanetaryTable } from '@/components/planetary-table'
import { WeatherWidget } from '@/components/weather-widget'
import { getLuckStatus } from '@/lib/astronomy'
import { cn } from '@/lib/utils'

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

	const luck = getLuckStatus(date)

	return (
		<>
			{/* Header */}
			<div className="flex flex-col gap-2 border-b pt-4 pb-2 text-center">
				<h1 className="text-3xl font-bold tracking-tight">Today's Energies</h1>

				{/* Luck Status */}
				<h2
					className={cn('text-lg font-bold', {
						'text-green-500': luck.status === 'lucky',
						'text-red-500': luck.status === 'unlucky',
						'text-gray-500': luck.status === 'neutral',
					})}
				>
					{luck.status}
				</h2>
			</div>

			{/* Content */}
			<div className="flex w-full flex-col items-center gap-4 p-4">
				<WeatherWidget />
				<PlanetaryTable date={date} />
			</div>
		</>
	)
}

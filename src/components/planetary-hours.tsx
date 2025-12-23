import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Sun, Moon } from 'lucide-react'
import { getPlanetaryHours, getLuckStatus } from '@/lib/astronomy'

interface PlanetaryHoursProps {
	date: Date
	location: { lat: number; lon: number } | null
}

export function PlanetaryHours({ date, location }: PlanetaryHoursProps) {
	const todayHours = location
		? getPlanetaryHours(date, location.lat, location.lon)
		: []

	// Determine if we should show today's sequence or yesterday's (if before sunrise)
	const getEffectiveHours = () => {
		if (!location || todayHours.length === 0) return []

		// If current time is before today's first hour (sunrise),
		// we are still in the previous planetary day's night hours.
		if (date < todayHours[0].startTime) {
			const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000)
			return getPlanetaryHours(yesterday, location.lat, location.lon)
		}

		return todayHours
	}

	const allHours = getEffectiveHours()

	const formatTime = (d: Date) =>
		d.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
		})

	const now = date.getTime()
	const currentHour = allHours.find(
		(h) => now >= h.startTime.getTime() && now < h.endTime.getTime(),
	)

	// If currently in an hour > 12, show 13-24. Otherwise 1-12.
	const showNight = currentHour
		? currentHour.number > 12
		: allHours.length > 0 && now >= allHours[12]?.startTime.getTime()

	const displayHours =
		allHours.length > 0
			? showNight
				? allHours.slice(12, 24)
				: allHours.slice(0, 12)
			: []

	const hours = displayHours.map((h) => ({
		number: h.number,
		time: `${formatTime(h.startTime)} - ${formatTime(h.endTime)}`,
		name: h.name,
		symbol: h.symbol,
		color: h.isCurrent ? h.color : '#f0f0f0',
		className: h.isCurrent ? 'font-bold' : '',
	}))

	const luck = getLuckStatus(date)

	return (
		<div className="w-full max-w-2xl bg-white p-4 font-serif text-black">
			<div className="overflow-hidden rounded-lg">
				{/* Day/Night Icon Header */}
				<div className="flex items-center justify-center bg-[#f0f0f0] py-1">
					{showNight ? (
						<Moon className="h-5 w-5 fill-black text-black" />
					) : (
						<Sun className="h-5 w-5 fill-black text-black" />
					)}
				</div>

				<div className="bg-white">
					<Table>
						<TableBody>
							{hours.map((hour) => (
								<TableRow
									key={hour.number}
									className={cn('border-0 hover:bg-[initial]', hour.className)}
									style={{ backgroundColor: hour.color }}
								>
									{/* Hour Number */}
									<TableCell className="w-1/4 border-0 py-1 pl-4 text-left text-base text-black">
										{hour.number}
									</TableCell>

									{/* Time Range */}
									<TableCell className="w-2/4 border-0 py-1 text-center text-base whitespace-nowrap text-black">
										{hour.time}
									</TableCell>

									{/* Ruler */}
									<TableCell className="w-1/4 border-0 py-1 pr-4 text-right text-base text-black">
										<div className="flex items-center justify-end gap-2">
											<span>{hour.name}</span>
											<span className="">{hour.symbol}</span>
										</div>
									</TableCell>
								</TableRow>
							))}
							{hours.length === 0 && !location && (
								<TableRow>
									<TableCell colSpan={3} className="py-4 text-center">
										Waiting for location...
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<div
				className="mt-2 text-center text-lg font-bold"
				style={{ color: luck.color }}
			>
				Today is {luck.status}.
			</div>
		</div>
	)
}

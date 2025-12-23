import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

export function PlanetaryHours() {
	const hours = [
		{
			number: 1,
			time: '6:01 AM - 7:12 AM',
			name: 'Mercury',
			symbol: '☿',
			bg: 'bg-transparent',
		},
		{
			number: 2,
			time: '7:12 AM - 8:22 AM',
			name: 'Luna',
			symbol: '☽',
			bg: 'bg-gray-100/50',
		},
		{
			number: 3,
			time: '8:22 AM - 9:32 AM',
			name: 'Saturn',
			symbol: '♄',
			bg: 'bg-transparent',
		},
		{
			number: 4,
			time: '9:32 AM - 10:43 AM',
			name: 'Jupiter',
			symbol: '♃',
			bg: 'bg-gray-100/50',
		},
		{
			number: 5,
			time: '10:43 AM - 11:53 AM',
			name: 'Mars',
			symbol: '♂',
			bg: 'bg-transparent',
		},
		{
			number: 6,
			time: '11:53 AM - 1:03 PM',
			name: 'Sol',
			symbol: '☉',
			bg: 'bg-gray-100/50',
		},
		{
			number: 7,
			time: '1:03 PM - 2:14 PM',
			name: 'Venus',
			symbol: '♀',
			bg: 'bg-[#98fba4] font-bold',
		},
		{
			number: 8,
			time: '2:14 PM - 3:24 PM',
			name: 'Mercury',
			symbol: '☿',
			bg: 'bg-transparent',
		},
		{
			number: 9,
			time: '3:24 PM - 4:35 PM',
			name: 'Luna',
			symbol: '☽',
			bg: 'bg-gray-100/50',
		},
		{
			number: 10,
			time: '4:35 PM - 5:45 PM',
			name: 'Saturn',
			symbol: '♄',
			bg: 'bg-transparent',
		},
		{
			number: 11,
			time: '5:45 PM - 6:55 PM',
			name: 'Jupiter',
			symbol: '♃',
			bg: 'bg-gray-100/50',
		},
		{
			number: 12,
			time: '6:55 PM - 8:06 PM',
			name: 'Mars',
			symbol: '♂',
			bg: 'bg-transparent',
		},
	]

	return (
		<div className="w-full max-w-md font-serif text-black">
			{/* Day/Night Icon Header */}
			<div className="flex justify-center py-2 text-2xl">☀️</div>

			<div className="overflow-hidden rounded-lg bg-gray-50/50">
				<Table>
					<TableBody>
						{hours.map((hour) => (
							<TableRow
								key={hour.number}
								className={`border-0 hover:bg-transparent ${hour.bg}`}
							>
								{/* Hour Number */}
								<TableCell className="w-12 border-0 py-1 pl-4 text-left text-lg text-black">
									{hour.number}
								</TableCell>

								{/* Time Range */}
								<TableCell className="border-0 py-1 text-center text-lg text-black">
									{hour.time}
								</TableCell>

								{/* Ruler */}
								<TableCell className="border-0 py-1 pr-4 text-right text-lg text-black">
									<div className="flex items-center justify-end gap-2">
										<span>{hour.name}</span>
										<span className="text-xl">{hour.symbol}</span>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Footer */}
			<div className="mt-6 text-center">
				<p className="text-2xl font-bold text-[#228b22]">Today is lucky.</p>
			</div>
		</div>
	)
}

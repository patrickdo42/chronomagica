import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Sun } from 'lucide-react'

export function PlanetaryHours() {
	const hours = [
		{
			number: 1,
			time: '6:01 AM - 7:12 AM',
			name: 'Mercury',
			symbol: '☿',
			color: '#f0f0f0',
			className: '',
		},
		{
			number: 2,
			time: '7:12 AM - 8:22 AM',
			name: 'Luna',
			symbol: '☽',
			color: '#f0f0f0',
			className: '',
		},
		{
			number: 3,
			time: '8:22 AM - 9:32 AM',
			name: 'Saturn',
			symbol: '♄',
			color: '#f0f0f0',
			className: '',
		},
		{
			number: 4,
			time: '9:32 AM - 10:43 AM',
			name: 'Jupiter',
			symbol: '♃',
			color: '#f0f0f0',
			className: '',
		},
		{
			number: 5,
			time: '10:43 AM - 11:53 AM',
			name: 'Mars',
			symbol: '♂',
			color: '#f0f0f0',
			className: '',
		},
		{
			number: 6,
			time: '11:43 AM - 1:03 PM',
			name: 'Sol',
			symbol: '☉',
			color: '#f0f0f0',
			className: '',
		},
		{
			number: 7,
			time: '1:03 PM - 2:14 PM',
			name: 'Venus',
			symbol: '♀',
			color: '#98fba4',
			className: 'font-bold',
		},
		{
			number: 8,
			time: '2:14 PM - 3:24 PM',
			name: 'Mercury',
			symbol: '☿',
			color: '#f0f0f0',
			className: '',
		},
		{
			number: 9,
			time: '3:24 PM - 4:35 PM',
			name: 'Luna',
			symbol: '☽',
			color: '#f0f0f0',
			className: '',
		},
		{
			number: 10,
			time: '4:35 PM - 5:45 PM',
			name: 'Saturn',
			symbol: '♄',
			color: '#f0f0f0',
			className: '',
		},
		{
			number: 11,
			time: '5:45 PM - 6:55 PM',
			name: 'Jupiter',
			symbol: '♃',
			color: '#f0f0f0',
			className: '',
		},
		{
			number: 12,
			time: '6:55 PM - 8:06 PM',
			name: 'Mars',
			symbol: '♂',
			color: '#f0f0f0',
			className: '',
		},
	]

	return (
		<div className="w-full max-w-2xl bg-white p-4 font-serif text-black">
			<div className="overflow-hidden rounded-lg">
				{/* Day/Night Icon Header */}
				<div className="flex items-center justify-center bg-[#f0f0f0] py-1">
					<Sun className="h-5 w-5 fill-black text-black" />
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
						</TableBody>
					</Table>
				</div>
			</div>

			<div className="mt-2 text-center text-lg font-bold text-[#228b22]">
				Today is lucky.
			</div>
		</div>
	)
}

import {
	getLuckStatus,
	getPlanetaryStatus,
	getZodiacSign,
	PLANETS,
} from '@/lib/astronomy'
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from '@/components/ui/table'

export function PlanetaryTable({ date }: { date: Date }) {
	const luck = getLuckStatus(date)

	return (
		<div className="w-full max-w-2xl bg-white p-4 text-black font-serif">
			{/* Planetary Table */}
			<div className="overflow-hidden rounded-lg">
				<Table>
					<TableBody>
						{PLANETS.map((planet) => {
							const status = getPlanetaryStatus(planet, date)
							const zodiacSign = getZodiacSign(planet, date)
							
							return (
								<TableRow
									key={planet.name}
									className="border-0 hover:bg-transparent"
									style={{ backgroundColor: planet.color }}
								>
									{/* Planet Name */}
									<TableCell className="py-1 pl-3 text-xl font-bold text-black border-0">
										{planet.name} <span className="font-normal">{planet.symbol}</span>
									</TableCell>

									{/* Status */}
									<TableCell className="py-1 text-center text-lg text-black border-0">
										{typeof status === 'object' ? (
											<div className="flex items-center justify-center gap-2">
												<span>{status.name}</span>
												<span className="text-2xl">{status.symbol}</span>
											</div>
										) : status === '℞ Retrograde' ? (
											<span className="font-bold text-red-600">
												Retrograde <span className="font-serif">℞</span>
											</span>
										) : (
											status
										)}
									</TableCell>

									{/* Zodiac Sign */}
									<TableCell className="py-1 pr-1 text-right text-xl font-bold text-black border-0">
										<div className="flex items-center justify-end gap-2">
											<span>{zodiacSign.name}</span>
											<span className="flex h-8 w-8 items-center justify-center rounded bg-[#9d7ad2] text-white">
												{zodiacSign.symbol}
											</span>
										</div>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</div>

			{/* Footer */}
			<div className="mt-6 text-center">
				<p 
					className="text-2xl font-bold"
					style={{ color: luck.color }}
				>
					Today is {luck.status}.
				</p>
			</div>
		</div>
	)
}

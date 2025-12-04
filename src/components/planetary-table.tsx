import { getPlanetaryStatus, getZodiacSign, PLANETS } from '@/lib/astronomy'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function PlanetaryTable({ date }: { date: Date }) {
	return (
		<Card className="w-full max-w-lg text-xl">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl">Planetary Table</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Planet</TableHead>
							<TableHead className="text-center">Status</TableHead>
							<TableHead>Zodiac Sign</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{PLANETS.map((planet) => {
							const status = getPlanetaryStatus(planet, date)
							const zodiacSign = getZodiacSign(planet, date)
							return (
								<TableRow
									key={planet.name}
									style={{ backgroundColor: planet.color }}
								>
									<TableCell>
										{planet.symbol} {planet.name}
									</TableCell>

									<TableCell className="text-center">
										{typeof status === 'object' ? (
											<Badge>
												{status.symbol} {status.name}
											</Badge>
										) : status === '℞ Retrograde' ? (
											<Badge className="bg-red-500">{status}</Badge>
										) : (
											status && <Badge>{status}</Badge>
										)}
									</TableCell>

									<TableCell>
										{zodiacSign.symbol} {zodiacSign.name}
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}

import { PlanetStatus } from '../utils/astronomy';
import { cn } from '../lib/utils';

interface PlanetaryTableProps {
    planets: PlanetStatus[];
    isDark: boolean;
}

export function PlanetaryTable({ planets, isDark }: PlanetaryTableProps) {
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="flex flex-col w-full">
                {planets.map((planet) => (
                    <div
                        key={planet.name}
                        className="flex items-center justify-between px-2 py-1 text-sm sm:text-base font-serif font-bold h-8"
                        style={{
                            backgroundColor: isDark ? planet.darkModeColor : planet.color,
                            color: isDark ? '#fff' : '#000'
                        }}
                    >
                        <div className="flex items-center w-1/3">
                            <span>{planet.name} {planet.symbol}</span>
                        </div>

                        <div className="flex items-center justify-center w-1/3 text-center">
                            {planet.status && (
                                <span className={cn(
                                    "whitespace-nowrap",
                                    planet.isRetrograde && "text-[#ff0036]" // Red if retrograde
                                )}>
                                    {planet.status}
                                </span>
                            )}
                            {planet.isRetrograde && !planet.status && (
                                <span className="text-[#ff0036]">Retrograde ℞</span>
                            )}
                        </div>

                        <div className="flex items-center justify-end w-1/3">
                            <span>{planet.sign}</span>
                            <span className="ml-1 bg-purple-400/20 px-1 rounded text-xs sm:text-sm">
                                {planet.signSymbol}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

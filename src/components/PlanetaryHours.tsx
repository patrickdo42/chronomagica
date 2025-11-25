import { PlanetaryHour } from '../utils/astronomy';
import { cn } from '../lib/utils';

interface PlanetaryHoursProps {
    hours: PlanetaryHour[];
    currentDate: Date;
    isDark: boolean;
}

export function PlanetaryHours({ hours, currentDate, isDark }: PlanetaryHoursProps) {
    // Find current hour index
    const currentHourIndex = hours.findIndex(h =>
        currentDate >= h.start && currentDate < h.end
    );

    // Split into day (0-11) and night (12-23)
    const dayHours = hours.slice(0, 12);
    const nightHours = hours.slice(12, 24);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const HourRow = ({ hour, index, offset }: { hour: PlanetaryHour, index: number, offset: number }) => {
        const isCurrent = (index + offset) === currentHourIndex;
        const rowNum = index + offset + 1;

        return (
            <div
                className={cn(
                    "flex items-center justify-between px-4 py-1 text-sm sm:text-base font-serif border-b border-gray-100 dark:border-gray-800",
                    isCurrent ? "bg-[#95f3ad] dark:bg-[#004812]" : "bg-white dark:bg-black",
                    isCurrent && isDark && "text-white", // Ensure text is visible on green in dark mode
                    !isCurrent && "text-black dark:text-white"
                )}
            >
                <div className="w-8 font-bold">{rowNum}</div>
                <div className="flex-1 text-center font-bold">
                    {formatTime(hour.start)} - {formatTime(hour.end)}
                </div>
                <div className="w-24 text-right font-bold">
                    {hour.planet} {hour.symbol}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-md mx-auto mt-4">
            {/* Day Header */}
            <div className="flex justify-center items-center py-1 bg-gray-100 dark:bg-gray-900">
                <span className="text-2xl">☀</span>
            </div>

            {dayHours.map((hour, i) => (
                <HourRow key={i} hour={hour} index={i} offset={0} />
            ))}

            {/* Night Header */}
            <div className="flex justify-center items-center py-1 bg-gray-100 dark:bg-gray-900 mt-2">
                <span className="text-2xl">☾</span>
                {/* Prompt says "Sunset hours unicode: ☾" (U+263E). Image shows crescent. */}
            </div>

            {nightHours.map((hour, i) => (
                <HourRow key={i} hour={hour} index={i} offset={12} />
            ))}
        </div>
    );
}

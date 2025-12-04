import { PlanetaryHour } from '../utils/astronomy';
import { cn } from '../lib/utils';

interface PlanetaryHoursProps {
    hours: PlanetaryHour[];
    currentDate: Date;
    isDark: boolean;
}

// Planet colors from the spec
const PLANET_COLORS: Record<string, { light: string; dark: string }> = {
    'Sol': { light: '#ffd071', dark: '#ac7403' },
    'Luna': { light: '#d1d1d1', dark: '#919191' },
    'Mercury': { light: '#fff59c', dark: '#918308' },
    'Venus': { light: '#95f3ad', dark: '#004812' },
    'Mars': { light: '#ffc5c5', dark: '#7a0000' },
    'Jupiter': { light: '#9fdcff', dark: '#00467f' },
    'Saturn': { light: '#a5a5a5', dark: '#1d1d1d' },
    'Uranus': { light: '#c9bcff', dark: '#250076' },
    'Neptune': { light: '#f9b6ff', dark: '#7b0085' },
    'Pluto': { light: '#e5baa5', dark: '#4f2916' },
};

export function PlanetaryHours({ hours, currentDate, isDark }: PlanetaryHoursProps) {
    // Find current hour index using getTime() for proper comparison
    const currentHourIndex = hours.findIndex(h => {
        const currentTime = currentDate.getTime();
        const startTime = h.start.getTime();
        const endTime = h.end.getTime();
        return currentTime >= startTime && currentTime < endTime;
    });

    // Determine if we're in day (0-11) or night (12-23) hours
    let isNightTime = false;
    if (currentHourIndex >= 0) {
        isNightTime = currentHourIndex >= 12;
    } else if (hours.length > 0) {
        // Fallback: check if current time is after the start of night hours
        const nightStart = hours[12]?.start;
        if (nightStart) {
            isNightTime = currentDate.getTime() >= nightStart.getTime();
        }
    }

    // Split into day (0-11) and night (12-23)
    const dayHours = hours.slice(0, 12);
    const nightHours = hours.slice(12, 24);

    // Show only the relevant 12-hour block
    const visibleHours = isNightTime ? nightHours : dayHours;
    const offset = isNightTime ? 12 : 0;

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const HourRow = ({ hour, index, offset }: { hour: PlanetaryHour, index: number, offset: number }) => {
        const isCurrent = (index + offset) === currentHourIndex;
        const rowNum = index + offset + 1;

        // Get planet color
        const planetColor = PLANET_COLORS[hour.planet];
        const bgColor = isCurrent
            ? (isDark ? planetColor.dark : planetColor.light)
            : (isDark ? '#000' : '#fff');

        return (
            <div
                className={cn(
                    "flex items-center justify-between px-4 py-1 text-sm sm:text-base font-serif border-b border-gray-100 dark:border-gray-800",
                    isCurrent && isDark && "text-white",
                    !isCurrent && "text-black dark:text-white"
                )}
                style={{
                    backgroundColor: bgColor
                }}
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
            {/* Header - Day or Night */}
            <div className="flex justify-center items-center py-1 bg-gray-100 dark:bg-gray-900">
                <span className="text-2xl">{isNightTime ? '☾' : '☀'}</span>
            </div>

            {visibleHours.map((hour, i) => (
                <HourRow key={i} hour={hour} index={i} offset={offset} />
            ))}
        </div>
    );
}

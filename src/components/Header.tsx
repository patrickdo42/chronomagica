import * as React from 'react';
import { Lightbulb } from 'lucide-react';

interface HeaderProps {
  date: Date;
  locationName: string;
  weather: {
    temp: number;
    condition: string;
    symbol: string;
  };
  toggleTheme: () => void;
  isDark: boolean;
}

export function Header({ date, locationName, weather, toggleTheme, isDark }: HeaderProps) {
  // Format date: Wednesday, June 26, 2025
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Format time: 1:09 PM
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="w-full max-w-md mx-auto p-4 pb-2">
      <div className="flex justify-end mb-2">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
          <Lightbulb className={isDark ? "text-white" : "text-black"} size={24} />
        </button>
      </div>

      <div className="flex items-center justify-center mb-4">
        <span className="text-2xl mr-2">◀</span>
        <h1 className="text-4xl font-serif text-center mx-2" style={{ fontFamily: 'serif' }}>
          Today's Energies
        </h1>
        <span className="text-2xl ml-2">▶</span>
      </div>

      <div className="flex justify-between items-end text-sm sm:text-base font-serif">
        <div className="flex flex-col">
          <span>{dateStr}</span>
          <span>{locationName}</span>
        </div>
        <div className="flex flex-col items-end">
          <span>{timeStr}</span>
          <span>
            {Math.round(weather.temp)}° F, {weather.condition} {weather.symbol}
          </span>
        </div>
      </div>
    </div>
  );
}

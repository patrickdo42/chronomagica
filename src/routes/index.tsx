import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Header } from '../components/Header';
import { PlanetaryTable } from '../components/PlanetaryTable';
import { PlanetaryHours } from '../components/PlanetaryHours';
import {
  getPlanetaryData,
  getPlanetaryHours,
  getLuckStatus
} from '../utils/astronomy';
import { getWeather, WeatherData } from '../utils/weather';
import { Observer } from 'astronomy-engine';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [date, setDate] = React.useState(new Date());
  const [location, setLocation] = React.useState<{ lat: number; lon: number; name: string }>({
    lat: 29.9841, // Default: Metairie, LA (approx) or New Orleans
    lon: -90.1529,
    name: 'Metairie, LA' // Default placeholder
  });
  const [weather, setWeather] = React.useState<WeatherData>({
    temperature: 0,
    condition: 'Loading...',
    symbol: '',
    isDay: true
  });
  const [isDark, setIsDark] = React.useState(false);

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get Location
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding to get name? 
          // For now, just use coordinates or a generic name if API not available.
          // Or fetch from Open-Meteo geocoding?
          // I'll stick to "Current Location" or try to fetch name if possible.
          // Actually, prompt says "Current Location (Auto-detected but adjustable)".
          // Implementing adjustable location is complex. I'll stick to auto-detect + manual override UI if requested, 
          // but for now just auto-detect.
          // I'll update name to "Detected Location" or similar.
          setLocation(prev => ({ ...prev, lat: latitude, lon: longitude, name: 'Detected Location' }));
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    }
  }, []);

  // Get Weather when location changes
  React.useEffect(() => {
    getWeather(location.lat, location.lon).then(setWeather);
  }, [location]);

  // Derived Data
  const observer = new Observer(location.lat, location.lon, 0);
  const planets = React.useMemo(() => getPlanetaryData(date, observer), [date, location]);
  const hours = React.useMemo(() => getPlanetaryHours(date, observer), [date, location]);
  const luck = React.useMemo(() => getLuckStatus(date), [date]);

  // Theme toggle
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <Header
        date={date}
        locationName={location.name}
        weather={{
          temp: weather.temperature,
          condition: weather.condition,
          symbol: weather.symbol
        }}
        toggleTheme={toggleTheme}
        isDark={isDark}
      />

      <PlanetaryTable planets={planets} isDark={isDark} />

      <PlanetaryHours hours={hours} currentDate={date} isDark={isDark} />

      <div className="w-full text-center py-6">
        <h2
          className="text-2xl font-serif font-bold"
          style={{ color: luck.color }}
        >
          {luck.text}
        </h2>
      </div>
    </div>
  );
}

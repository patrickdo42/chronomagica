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

  // Update time every second for accurate current hour detection
  React.useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get Location
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Try to get city name from reverse geocoding
          try {
            const response = await fetch(
              `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}`
            );
            const data = await response.json();
            const cityName = data.results?.[0]?.name || 'Current Location';
            setLocation({ lat: latitude, lon: longitude, name: cityName });
          } catch (error) {
            console.error('Error getting city name:', error);
            setLocation({ lat: latitude, lon: longitude, name: 'Current Location' });
          }
        },
        (error) => {
          console.error("Error getting location", error);
          // Keep default location if geolocation fails
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

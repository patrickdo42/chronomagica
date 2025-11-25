export type WeatherData = {
    temperature: number;
    condition: string;
    symbol: string;
    isDay: boolean;
};

// WMO Weather interpretation codes (WW)
const WEATHER_CODES: Record<number, { label: string; symbol: string }> = {
    0: { label: 'Clear sky', symbol: '☀' },
    1: { label: 'Mainly clear', symbol: '☀' },
    2: { label: 'Partly cloudy', symbol: '⛅' }, // Using closest match to :white_sun_small_cloud:
    3: { label: 'Overcast', symbol: '☁' },
    45: { label: 'Fog', symbol: '🌫' }, // :fog:
    48: { label: 'Depositing rime fog', symbol: '🌫' },
    51: { label: 'Drizzle: Light', symbol: '🌧' }, // :cloud_rain:
    53: { label: 'Drizzle: Moderate', symbol: '🌧' },
    55: { label: 'Drizzle: Dense', symbol: '🌧' },
    56: { label: 'Freezing Drizzle: Light', symbol: '🌧' },
    57: { label: 'Freezing Drizzle: Dense', symbol: '🌧' },
    61: { label: 'Rain: Slight', symbol: '🌧' },
    63: { label: 'Rain: Moderate', symbol: '🌧' },
    65: { label: 'Rain: Heavy', symbol: '🌧' },
    66: { label: 'Freezing Rain: Light', symbol: '🌧' },
    67: { label: 'Freezing Rain: Heavy', symbol: '🌧' },
    71: { label: 'Snow fall: Slight', symbol: '🌨' }, // :cloud_snow:
    73: { label: 'Snow fall: Moderate', symbol: '🌨' },
    75: { label: 'Snow fall: Heavy', symbol: '🌨' },
    77: { label: 'Snow grains', symbol: '🌨' },
    80: { label: 'Rain showers: Slight', symbol: '🌧' },
    81: { label: 'Rain showers: Moderate', symbol: '🌧' },
    82: { label: 'Rain showers: Violent', symbol: '🌧' },
    85: { label: 'Snow showers: Slight', symbol: '🌨' },
    86: { label: 'Snow showers: Heavy', symbol: '🌨' },
    95: { label: 'Thunderstorm: Slight or moderate', symbol: '🌩' }, // :cloud_lightning:
    96: { label: 'Thunderstorm with slight hail', symbol: '🌩' },
    99: { label: 'Thunderstorm with heavy hail', symbol: '🌩' },
};

// Custom symbols from prompt:
// ☀ - Sunny or Clear
// ☁ - Cloudy
// ⛅ - Partly Cloudy (using unicode closest match)
// 🌩 - Thunderstorm
// 🌧 - Raining
// 🌨 - Snowing
// 🌫 - Foggy

export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code&temperature_unit=fahrenheit`
        );
        const data = await response.json();

        if (!data.current) {
            throw new Error('No weather data');
        }

        const code = data.current.weather_code;
        const info = WEATHER_CODES[code] || { label: 'Unknown', symbol: '?' };

        // Map to specific symbols requested if possible
        let symbol = info.symbol;
        // Adjust symbol based on prompt requirements if needed
        // Prompt:
        // ☀ - Sunny or Clear
        // ☁ - Cloudy
        // :white_sun_small_cloud: - Partly Cloudy -> ⛅
        // :cloud_lightning: - Thunderstorm -> 🌩
        // :cloud_rain: - Raining -> 🌧
        // :cloud_snow: - Snowing -> 🌨
        // :fog: - Foggy -> 🌫

        return {
            temperature: data.current.temperature_2m,
            condition: info.label,
            symbol: symbol,
            isDay: data.current.is_day === 1
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        return {
            temperature: 0,
            condition: 'Unavailable',
            symbol: '?',
            isDay: true
        };
    }
}

import * as Location from 'expo-location';

export interface WeatherData {
    temperature: number; // Celsius
    weatherCode: number;
    isDay: boolean;
    condition: string; // "Sunny", "Cloudy", "Rainy", "Snowy"
    description: string; // Human readable
}

export const WeatherService = {
    /**
     * Request permissions and get current position.
     */
    getLocation: async (): Promise<{ lat: number; lon: number } | null> => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('[WeatherService] Location permission denied');
                return null;
            }

            const location = await Location.getCurrentPositionAsync({});
            return {
                lat: location.coords.latitude,
                lon: location.coords.longitude
            };
        } catch (error) {
            console.error('[WeatherService] Error getting location:', error);
            return null;
        }
    },

    /**
     * Fetch current weather from OpenMeteo (Free API, no key required).
     */
    getCurrentWeather: async (lat: number, lon: number): Promise<WeatherData | null> => {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`
            );
            const data = await response.json();

            if (!data.current_weather) {
                throw new Error('No weather data received');
            }

            const { temperature, weathercode, is_day } = data.current_weather;

            return {
                temperature,
                weatherCode: weathercode,
                isDay: !!is_day,
                condition: getWeatherCondition(weathercode),
                description: getWeatherDescription(weathercode)
            };
        } catch (error) {
            console.error('[WeatherService] Error fetching weather:', error);
            return null;
        }
    }
};

/**
 * Maps WMO Weather codes to simplified conditions.
 */
const getWeatherCondition = (code: number): string => {
    if (code === 0) return 'Sunny';
    if (code <= 3) return 'Cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snowy';
    if (code <= 82) return 'Rainy'; // Showers
    if (code <= 86) return 'Snowy';
    if (code <= 99) return 'Stormy';
    return 'Unknown';
};

const getWeatherDescription = (code: number): string => {
    // Sourced from OpenMeteo docs
    const codes: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
    };
    return codes[code] || 'Unknown weather';
};

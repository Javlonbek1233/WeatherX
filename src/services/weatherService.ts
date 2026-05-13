export interface WeatherData {
  temp: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  daily: {
    time: string[];
    maxTemp: number[];
    minTemp: number[];
    conditionCode: number[];
  };
  hourly: {
    time: string[];
    temp: number[];
  };
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure,visibility&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
  
  const response = await fetch(url);
  const data = await response.json();

  return {
    temp: Math.round(data.current.temperature_2m),
    condition: getWeatherCondition(data.current.weather_code),
    conditionCode: data.current.weather_code,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    uvIndex: 0, // Not available in simple forecast without more params
    visibility: data.current.visibility / 1000,
    pressure: data.current.surface_pressure,
    daily: {
      time: data.daily.time,
      maxTemp: data.daily.temperature_2m_max,
      minTemp: data.daily.temperature_2m_min,
      conditionCode: data.daily.weather_code,
    },
    hourly: {
      time: data.hourly.time.slice(0, 24),
      temp: data.hourly.temperature_2m.slice(0, 24),
    }
  };
}

export async function searchCities(query: string) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results || [];
}

export function getWeatherCondition(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain Showers";
  if (code <= 86) return "Snow Showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

export function getWeatherTheme(code: number) {
  if (code === 0) return "clear";
  if (code <= 3) return "cloudy";
  if (code <= 48) return "fog";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 99) return "thunder";
  return "clear";
}

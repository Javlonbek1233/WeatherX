import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wind, 
  Droplets, 
  Eye, 
  ArrowUp, 
  ArrowDown, 
  Sun, 
  Moon, 
  Clock, 
  Map as MapIcon,
  Bell,
  Star,
  Settings,
  Activity
} from 'lucide-react';
import { fetchWeather, WeatherData, getWeatherTheme } from './services/weatherService';
import { getWeatherInsights, AppRecommendation, processVoiceCommand } from './services/aiService';
import { WeatherBackground } from './components/WeatherBackground';
import { GlassContainer } from './components/GlassContainer';
import { CitySearch } from './components/CitySearch';
import { RadarMap } from './components/RadarMap';
import { AIInsights } from './components/AIInsights';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function App() {
  const [city, setCity] = useState({ name: 'Tokyo', lat: 35.6895, lon: 139.6917 });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [insights, setInsights] = useState<AppRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [favorites, setFavorites] = useState<{name: string, lat: number, lon: number}[]>([]);

  const loadWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const data = await fetchWeather(lat, lon);
      setWeather(data);
      setLoading(false);
      
      setAiLoading(true);
      const aiData = await getWeatherInsights(data);
      setInsights(aiData);
      setAiLoading(false);
    } catch (error) {
      console.error("Failed to load weather:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Try to get user location on start
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCity({ name: 'Current Location', lat: pos.coords.latitude, lon: pos.coords.longitude });
        loadWeather(pos.coords.latitude, pos.coords.longitude);
      },
      () => loadWeather(city.lat, city.lon)
    );
  }, [loadWeather]);

  const handleCitySelect = (selectedCity: any) => {
    const newCity = { name: selectedCity.name, lat: selectedCity.latitude, lon: selectedCity.longitude };
    setCity(newCity);
    loadWeather(newCity.lat, newCity.lon);
  };

  const handleVoiceCommand = async (text: string) => {
    const response = await processVoiceCommand(text);
    // In a real app we'd trigger UI actions based on intent. For now we just acknowledge.
    console.log("Nova:", response);
  };

  const toggleFavorite = () => {
    const exists = favorites.find(f => f.name === city.name);
    if (exists) {
      setFavorites(favorites.filter(f => f.name !== city.name));
    } else {
      setFavorites([...favorites, city]);
    }
  };

  if (!weather && loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-deep-space">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-2xl font-display text-neon-blue uppercase tracking-[0.2em]"
        >
          Initializing WeatherX Systems...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-12 overflow-x-hidden">
      {weather && <WeatherBackground condition={weather.condition} />}
      
      {/* Header / Global Search */}
      <header className="px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto w-full relative z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-neon-blue rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)]">
            <Activity className="text-deep-space" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tighter">WEATHER<span className="text-neon-blue">X</span></h1>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Atmospheric OS v3.1</div>
          </div>
        </div>

        <CitySearch onSelect={handleCitySelect} />

        <div className="flex items-center gap-3">
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors relative">
            <Bell size={20} />
            <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-deep-space" />
          </button>
          <button 
            onClick={toggleFavorite}
            className={`p-3 rounded-full transition-colors ${favorites.find(f => f.name === city.name) ? 'bg-neon-blue text-deep-space' : 'bg-white/5 hover:bg-white/10'}`}
          >
            <Star size={20} />
          </button>
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Current Weather Focus */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <GlassContainer className="py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Clock size={16} />
                  <span className="text-xs uppercase tracking-widest">{format(new Date(), 'EEEE, dd MMMM HH:mm')}</span>
                </div>
                <h2 className="text-6xl font-display font-bold mb-1">{city.name}</h2>
                <div className="text-lg text-neon-blue font-medium uppercase tracking-[0.3em]">{weather?.condition}</div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-9xl font-display font-bold leading-none tracking-tighter">
                  {weather?.temp}°
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-red-500">
                    <ArrowUp size={18} />
                    <span className="text-xl font-bold">{weather?.daily.maxTemp[0]}°</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-500">
                    <ArrowDown size={18} />
                    <span className="text-xl font-bold">{weather?.daily.minTemp[0]}°</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/5">
              <Metric icon={<Wind size={20}/>} label="Wind Speed" value={`${weather?.windSpeed} km/h`} />
              <Metric icon={<Droplets size={20}/>} label="Humidity" value={`${weather?.humidity}%`} />
              <Metric icon={<Eye size={20}/>} label="Visibility" value={`${weather?.visibility} km`} />
              <Metric icon={<Sun size={20}/>} label="Air Pressure" value={`${weather?.pressure} hPa`} />
            </div>
          </GlassContainer>

          {/* Hourly Forecast */}
          <GlassContainer>
            <h3 className="text-sm font-display uppercase tracking-widest text-slate-500 mb-8">Hourly Forecast</h3>
            <div className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide">
              {weather?.hourly.time.map((time, i) => (
                <div key={i} className="flex flex-col items-center gap-4 min-w-[60px]">
                  <div className="text-xs text-slate-500">{format(new Date(time), 'HH:mm')}</div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    {/* Simplified icon map */}
                    <Sun size={14} className={i % 3 === 0 ? 'text-neon-blue' : 'text-slate-500'} />
                  </div>
                  <div className="text-sm font-bold">{Math.round(weather.hourly.temp[i])}°</div>
                </div>
              ))}
            </div>
          </GlassContainer>

          {/* Interactive Radar (Simplified) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassContainer className="p-0">
               {weather && <RadarMap conditionCode={weather.conditionCode} />}
            </GlassContainer>
            
            {/* Sunrise / Sunset */}
            <GlassContainer>
              <h3 className="text-sm font-display uppercase tracking-widest text-slate-500 mb-8">Light Cycle</h3>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400">
                      <Sun size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Sunrise</div>
                      <div className="text-xl font-bold">06:12 AM</div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">4h ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                      <Moon size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Sunset</div>
                      <div className="text-xl font-bold">07:45 PM</div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">In 9h</span>
                </div>
              </div>
            </GlassContainer>
          </div>
        </div>

        {/* Sidebar Components */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <AIInsights insights={insights} loading={aiLoading} onVoiceCommand={handleVoiceCommand} />

          {/* 7-Day Forecast */}
          <GlassContainer>
            <h3 className="text-sm font-display uppercase tracking-widest text-slate-500 mb-8">7-Day Forecast</h3>
            <div className="space-y-6">
              {weather?.daily.time.map((time, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="w-16 text-xs text-slate-400">{i === 0 ? 'Today' : format(new Date(time), 'EEE')}</div>
                  <div className="flex-1 flex justify-center">
                    <Sun size={18} className="text-neon-blue" />
                  </div>
                  <div className="w-20 flex justify-end gap-3">
                    <span className="text-sm font-bold">{Math.round(weather.daily.maxTemp[i])}°</span>
                    <span className="text-sm text-slate-600">{Math.round(weather.daily.minTemp[i])}°</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassContainer>

          {/* Favorites List */}
          <AnimatePresence>
            {favorites.length > 0 && (
              <GlassContainer>
                <div className="flex items-center gap-2 mb-8">
                  <Star className="text-neon-blue" size={16} />
                  <h3 className="text-sm font-display uppercase tracking-widest text-slate-500">Fav City Nodes</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {favorites.map((fav, i) => (
                    <button
                      key={i}
                      onClick={() => { setCity(fav); loadWeather(fav.lat, fav.lon); }}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
                    >
                      <span className="font-medium group-hover:text-neon-blue transition-colors">{fav.name}</span>
                      <MapIcon size={16} className="text-slate-600 group-hover:text-neon-blue transition-colors" />
                    </button>
                  ))}
                </div>
              </GlassContainer>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* Footer Branding */}
      <footer className="mt-24 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.5em]">Powered by Gemini-3 Intelligence & Satellite Data Networks</p>
      </footer>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-slate-500 font-display">
        <div className="text-neon-blue/80">{icon}</div>
        <span className="text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
    </div>
  );
}

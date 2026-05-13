import React, { useState, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { searchCities } from '../services/weatherService';
import { motion, AnimatePresence } from 'motion/react';

interface CitySearchProps {
  onSelect: (city: any) => void;
}

export const CitySearch: React.FC<CitySearchProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        const cities = await searchCities(query);
        setResults(cities);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative w-full max-w-md mx-auto z-50">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-neon-blue transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search city systems..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-full py-3 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue transition-all"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (results.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full left-0 right-0 mt-3 glass-morphism overflow-hidden rounded-2xl z-50"
          >
            <div className="p-2">
              {loading ? (
                <div className="p-4 text-center text-slate-400">Scanning satellite data...</div>
              ) : (
                results.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      onSelect(city);
                      setQuery('');
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-4 hover:bg-white/5 rounded-xl transition-all flex items-center gap-3 group"
                  >
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-neon-blue/20 transition-colors">
                      <MapPin size={16} className="text-neon-blue" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{city.name}</div>
                      <div className="text-xs text-slate-500">{city.admin1}, {city.country}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

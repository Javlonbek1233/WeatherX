import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Shirt, Wind, Droplets, Eye, Activity } from 'lucide-react';
import { GlassContainer } from './GlassContainer';
import { AppRecommendation } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';

interface AIInsightsProps {
  insights: AppRecommendation | null;
  loading: boolean;
  onVoiceCommand: (text: string) => void;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ insights, loading, onVoiceCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice recognition not supported in this environment.");
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        onVoiceCommand(text);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  return (
    <GlassContainer className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-neon-purple" size={20} />
          <h3 className="text-lg font-display uppercase tracking-widest text-slate-300">Nova Intelligence</h3>
        </div>
        <button
          onClick={toggleListening}
          className={`p-3 rounded-full transition-all ${isListening ? 'bg-neon-purple text-white animate-pulse' : 'bg-white/5 text-slate-400 hover:text-white'}`}
        >
          {isListening ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/5 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-full" />
            <div className="h-20 bg-white/5 rounded w-full" />
          </div>
        ) : insights ? (
          <>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-slate-300 leading-relaxed italic text-sm"
            >
              "{insights.summary}"
            </motion.p>

            <div>
              <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-tighter text-slate-500">
                <Shirt size={14} />
                <span>Protocol: Optimal Attire</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {insights.clothing.map((item, i) => (
                  <span key={i} className="text-xs bg-neon-blue/10 border border-neon-blue/20 text-neon-blue px-3 py-1.5 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-[10px] uppercase text-slate-500 mb-1">Explorer Rating</div>
                <div className="text-2xl font-display text-white">{insights.activityRating}<span className="text-sm text-slate-600">/10</span></div>
              </div>
              {insights.specialNote && (
                <div className="bg-neon-purple/10 p-4 rounded-2xl border border-neon-purple/20">
                  <div className="text-[10px] uppercase text-neon-purple mb-1">Tactical Note</div>
                  <div className="text-xs text-white leading-tight">{insights.specialNote}</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-slate-500 text-sm">Synchronizing with environmental datastreams...</p>
        )}
      </div>

      {transcript && isListening && (
        <div className="absolute bottom-4 left-6 right-6 p-2 bg-neon-purple/20 rounded-lg border border-neon-purple/30 text-[10px] text-white">
          Voice Detected: {transcript}
        </div>
      )}
    </GlassContainer>
  );
};

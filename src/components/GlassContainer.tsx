import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({ children, className, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn("glass-morphism rounded-3xl p-6 relative overflow-hidden group", className)}
    >
      {/* Inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Interactive hover highlight */}
      <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 blur-xl pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

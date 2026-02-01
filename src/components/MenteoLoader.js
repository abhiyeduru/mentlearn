import React from 'react';
import { motion } from 'framer-motion';
import MenteoLogo from './MenteoLogo';

const MenteoLoader = ({ fullScreen = false, message = 'Loading...' }) => {
  const loader = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Animated Menteo Logo Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-8 rounded-full border-2 border-transparent border-t-blue-600 border-r-indigo-500"
        />

        {/* Inner pulsing ring */}
        <motion.div
          animate={{ rotate: -360, scale: [0.8, 1.1, 0.8] }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute -inset-4 rounded-full border-2 border-transparent border-t-indigo-400 border-r-purple-500 opacity-50"
        />

        {/* Logo */}
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full shadow-lg border-2 border-blue-200"
        >
          <MenteoLogo size="large" />
        </motion.div>
      </motion.div>

      {/* Loading Text with animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <motion.h3
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-lg font-bold text-gray-900 mb-2"
        >
          {message}
        </motion.h3>
        
        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut'
              }}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm"
      >
        {loader}
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {loader}
    </div>
  );
};

export default MenteoLoader;

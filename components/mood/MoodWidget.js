import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const moods = [
  { emoji: "😊", name: "Happy", color: "from-yellow-500/30 to-yellow-600/20", hoverColor: "from-yellow-500/40 to-yellow-600/30", textColor: "text-yellow-300" },
  { emoji: "😴", name: "Tired", color: "from-blue-500/30 to-blue-600/20", hoverColor: "from-blue-500/40 to-blue-600/30", textColor: "text-blue-300" },
  { emoji: "😎", name: "Chill", color: "from-green-500/30 to-green-600/20", hoverColor: "from-green-500/40 to-green-600/30", textColor: "text-green-300" },
  { emoji: "🤔", name: "Curious", color: "from-purple-500/30 to-purple-600/20", hoverColor: "from-purple-500/40 to-purple-600/30", textColor: "text-purple-300" },
  { emoji: "🎉", name: "Excited", color: "from-pink-500/30 to-pink-600/20", hoverColor: "from-pink-500/40 to-pink-600/30", textColor: "text-pink-300" },
  { emoji: "📚", name: "Focused", color: "from-indigo-500/30 to-indigo-600/20", hoverColor: "from-indigo-500/40 to-indigo-600/30", textColor: "text-indigo-300" }
];

// Background particle component
const FloatingParticle = ({ index }) => {
  const size = Math.floor(Math.random() * 4) + 2;
  const duration = Math.floor(Math.random() * 20) + 10;
  const delay = Math.random() * 5;
  
  return (
    <motion.div
      className="absolute rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/10"
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        bottom: `-${size}px`
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ 
        y: -200 - Math.random() * 100, 
        opacity: [0, 0.4, 0],
        x: Math.random() * 40 - 20
      }}
      transition={{ 
        repeat: Infinity, 
        duration,
        delay,
        ease: "linear"
      }}
    />
  );
};

export default function MoodWidget({ currentMood, onMoodUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMood, setSelectedMood] = useState(currentMood || moods[0]);
  const [lastUpdated, setLastUpdated] = useState(currentMood ? new Date().toLocaleString() : "Never");
  
  // Background particles array
  const particles = Array.from({ length: 15 }, (_, i) => i);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setLastUpdated(new Date().toLocaleString());
    if (onMoodUpdate) onMoodUpdate(mood);
    setIsExpanded(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative bg-black rounded-xl border border-gray-800 shadow-lg overflow-hidden"
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((i) => (
          <FloatingParticle key={i} index={i} />
        ))}
      </div>
      
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-pink-900/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10 p-4">
        {/* Header with gradient text */}
        <div className="text-center mb-3">
          <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
            Your Current Mood
          </h3>
        </div>
        
        {/* Current mood selector */}
        <motion.div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`cursor-pointer rounded-lg flex items-center justify-between mb-4 
                    border border-gray-700/50 transition-all duration-300 backdrop-blur-sm
                    bg-gradient-to-r ${selectedMood.color} hover:shadow-glow-sm`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center p-4 gap-3">
            <span className="text-2xl">{selectedMood.emoji}</span>
            <span className={`font-medium ${selectedMood.textColor}`}>{selectedMood.name}</span>
          </div>
          
          <div className="pr-4">
            <motion.span 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800/50 text-gray-300 text-sm"
              whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              {isExpanded ? "×" : "↓"}
            </motion.span>
          </div>
        </motion.div>
        
        {/* Expanded mood options */}
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-3 gap-2 mb-4"
          >
            {moods.map((mood, index) => (
              <motion.div
                key={index}
                onClick={() => handleMoodSelect(mood)}
                className={`bg-gradient-to-br ${mood.color} hover:${mood.hoverColor} 
                          transition-all duration-200 p-3 rounded-lg flex flex-col items-center 
                          justify-center backdrop-blur-sm border border-gray-700/50
                          ${selectedMood.name === mood.name ? 'ring-2 ring-pink-500 ring-offset-1 ring-offset-black' : ''}`}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 0 15px rgba(236, 72, 153, 0.2)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl mb-1">{mood.emoji}</span>
                <span className={`text-sm font-medium ${mood.textColor}`}>{mood.name}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Last updated info */}
        <div className="text-xs text-gray-400 mt-2 flex justify-between items-center">
          <span>Last updated: {lastUpdated}</span>
          
          {!isExpanded && (
            <motion.button
              onClick={() => setIsExpanded(true)}
              className="text-xs font-medium relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                Update Your Mood
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
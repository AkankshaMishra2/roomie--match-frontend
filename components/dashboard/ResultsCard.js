// components/dashboard/ResultsCard.js
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ResultsCard() {
  // Sample data - would come from API
  const potentialRoommates = [
    { id: 1, name: 'Alex Chen', compatibility: 95, message: 'Hi there! Looking for a roommate too.' },
    { id: 2, name: 'Jordan Taylor', compatibility: 87, message: 'Hey! I think we might be good roommates.' },
    { id: 3, name: 'Sam Rodriguez', compatibility: 82, message: 'Looking for someone clean and quiet.' },
  ];

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">Recent Messages</h3>
      <div className="space-y-3">
        {potentialRoommates.map((roommate, index) => (
          <motion.div
            key={roommate.id}
            className="p-3 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-pink-500 transition-all duration-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(236, 72, 153, 0.15)" }}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {roommate.name.charAt(0)}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{roommate.name}</span>
                  <span className="text-xs text-pink-400 font-medium">{roommate.compatibility}% match</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 truncate">{roommate.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.button
        className="mt-4 w-full text-sm text-pink-400 hover:text-pink-300 transition-colors duration-300 text-center py-2 border-t border-gray-700"
        whileHover={{ y: -2 }}
      >
        View all messages
      </motion.button>
    </div>
  );
}
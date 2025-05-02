import { motion } from 'framer-motion';

export default function CompatibilityChart() {
  // Sample data - these would come from real user data
  const compatibilityFactors = [
    { factor: 'Cleanliness', score: 85 },
    { factor: 'Noise Level', score: 70 },
    { factor: 'Social Style', score: 90 },
    { factor: 'Sleep Schedule', score: 65 },
  ];

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">Your Compatibility Factors</h3>
      <div className="space-y-4">
        {compatibilityFactors.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{item.factor}</span>
              <span className="text-white font-medium">{item.score}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
                style={{ width: `${item.score}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <p className="text-sm text-gray-300">
          Based on your preferences, you're most compatible with roommates who value cleanliness and have similar social habits.
        </p>
      </div>
    </div>
  );
}
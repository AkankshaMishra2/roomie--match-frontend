// pages/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import QuizComponent from '../components/quiz/QuizComponent';
import MoodWidget from '../components/mood/MoodWidget';
import CompatibilityChart from '../components/dashboard/CompatibilityChart';
import ResultsCard from '../components/dashboard/ResultsCard';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { userData } = useAuth();
  const [showQuiz, setShowQuiz] = useState(false);
  const router = useRouter();

  // Check if user has completed the quiz
  useEffect(() => {
    if (userData) {
      setShowQuiz(!userData.hasCompletedQuiz);
    }
  }, [userData]);

  // Animated gradient particles background effect
  const FloatingParticles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-pink-500/10 to-purple-600/10 blur-xl"
            style={{ 
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
            }}
            animate={{
              x: [Math.random() * 100, Math.random() * 100 - 50],
              y: [Math.random() * 100, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  };

  // If user hasn't completed the quiz, show the quiz component
  if (showQuiz) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black bg-gradient-to-t from-purple-900/20 to-black text-white flex flex-col relative">
          <FloatingParticles />
          <Navbar />
          <main className="flex-grow pt-16 relative z-10">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <QuizComponent />
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black bg-gradient-to-t from-purple-900/20 to-black text-white flex flex-col relative">
        <FloatingParticles />
        <Navbar />
        <main className="flex-grow pt-16 relative z-10">
          <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            {/* Welcome message */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                Welcome back, {userData?.name || 'User'}!
              </h1>
              <p className="mt-2 text-gray-300">
                Find compatible roommates at {userData?.university || 'your university'}.
              </p>
            </motion.div>
            
            {/* Dashboard grid - responsive layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Mood tracking widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="col-span-1"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-gray-800 h-full">
                  <MoodWidget />
                </div>
              </motion.div>
              
              {/* Roommate compatibility section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="col-span-1"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-gray-800 h-full">
                  <CompatibilityChart />
                </div>
              </motion.div>
              
              {/* Recent conversations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="col-span-1 lg:col-span-1 md:col-span-2 lg:col-start-auto"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-gray-800 h-full">
                  <ResultsCard />
                </div>
              </motion.div>
            </div>
            
            {/* Action buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap justify-center mt-12 gap-6"
            >
              <motion.button
                onClick={() => router.push('/chat')}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg transition-all duration-300"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 0 15px rgba(236, 72, 153, 0.5)" 
                }}
                whileTap={{ scale: 0.98 }}
              >
                My Chats
              </motion.button>
              
              <motion.button
                onClick={() => setShowQuiz(true)}
                className="px-6 py-3 bg-transparent border border-pink-500 text-pink-400 rounded-lg shadow-lg transition-all duration-300"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 0 15px rgba(236, 72, 153, 0.3)",
                  backgroundColor: "rgba(236, 72, 153, 0.1)" 
                }}
                whileTap={{ scale: 0.98 }}
              >
                Update Preferences
              </motion.button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
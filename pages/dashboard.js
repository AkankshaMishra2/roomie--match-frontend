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
import { 
  subscribeToDashboardStats, 
  subscribeToCompatibility, 
  subscribeToRecentActivity,
  subscribeToMood,
  saveQuizAnswers
} from '../lib/firestore';
import MatchRequestsModal from '../components/matches/MatchRequestsModal';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Dashboard() {
  const { userData, user } = useAuth();
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMatchRequests, setShowMatchRequests] = useState(false);
  const [userCompatibility, setUserCompatibility] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    activeMatches: 0,
    messageCount: 0,
    profileViews: 0,
    matchRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const router = useRouter();

  // Set up real-time listeners
  useEffect(() => {
    if (!user) return;

    // Real-time match requests count
    const requestsQuery = query(
      collection(db, 'roomie-users', user.uid, 'match-requests'),
      where('status', '==', 'pending')
    );
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      setDashboardStats((prev) => ({
        ...prev,
        matchRequests: snapshot.docs.length
      }));
    });

    // Real-time unread messages count (per-message, cross-user)
    let messageUnsubscribers = [];
    const chatsQuery = query(
      collection(db, 'roomie-users', user.uid, 'chats')
    );
    const unsubscribeChats = onSnapshot(chatsQuery, async (snapshot) => {
      // Unsubscribe previous listeners
      messageUnsubscribers.forEach(unsub => unsub());
      messageUnsubscribers = [];
      let totalUnread = 0;
      const chatDocs = snapshot.docs;
      if (chatDocs.length === 0) {
        setDashboardStats((prev) => ({ ...prev, messageCount: 0 }));
        return;
      }
      let processed = 0;
      chatDocs.forEach(chatDoc => {
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants.find(id => id !== user.uid);
        if (!otherUserId) {
          processed++;
          if (processed === chatDocs.length) {
            setDashboardStats((prev) => ({ ...prev, messageCount: totalUnread }));
          }
          return;
        }
        const messagesQuery = query(
          collection(db, 'roomie-users', otherUserId, 'chats', chatDoc.id, 'messages'),
          where('receiverId', '==', user.uid),
          where('read', '==', false)
        );
        const unsub = onSnapshot(messagesQuery, (messagesSnapshot) => {
          // For each chat, count unread messages for this user
          totalUnread += messagesSnapshot.size;
          processed++;
          if (processed === chatDocs.length) {
            setDashboardStats((prev) => ({ ...prev, messageCount: totalUnread }));
          }
        });
        messageUnsubscribers.push(unsub);
      });
    });

    const unsubscribeStats = subscribeToDashboardStats(user.uid, (stats) => {
      setDashboardStats((prev) => ({ ...prev, ...stats }));
      setIsLoading(false);
    });

    const unsubscribeCompatibility = subscribeToCompatibility(user.uid, (compatibility) => {
      setUserCompatibility(compatibility);
    });

    const unsubscribeActivity = subscribeToRecentActivity(user.uid, (activities) => {
      setRecentActivity(activities);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeRequests();
      unsubscribeChats();
      messageUnsubscribers.forEach(unsub => unsub());
      unsubscribeStats();
      unsubscribeCompatibility();
      unsubscribeActivity();
    };
  }, [user]);

  // Handle quiz completion
  const handleQuizComplete = async (answers) => {
    if (!user) return;
    
    try {
      await saveQuizAnswers(user.uid, answers);
      setShowQuiz(false);
    } catch (error) {
      console.error('Error saving quiz answers:', error);
    }
  };

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

  // Stats Card Component
  const StatCard = ({ title, value, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-gray-800"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  // Recent Activity Component
  const ActivityItem = ({ activity }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg"
    >
      <div className={`w-10 h-10 rounded-full ${activity.iconBg} flex items-center justify-center`}>
        {activity.icon}
      </div>
      <div>
        <p className="text-sm text-gray-300">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
    </motion.div>
  );

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
                Welcome back, {userData?.name || user?.displayName || 'User'}!
              </h1>
              <p className="mt-2 text-gray-300">
                {userData?.university ? 
                  `Find compatible roommates at ${userData.university}` :
                  'Complete your profile to find your perfect roommate match!'}
              </p>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="rounded-2xl bg-gray-900 border-2 border-blue-600/30 shadow-lg p-6 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-xl">
                <span className="text-4xl mb-2 text-blue-400">👥</span>
                <span className="text-3xl font-bold text-white">{dashboardStats.activeMatches}</span>
                <span className="text-base text-white mt-1">Active Matches</span>
              </div>
              <div
                onClick={() => router.push('/messages')}
                style={{ cursor: 'pointer' }}
                className="rounded-2xl bg-gray-900 border-2 border-green-500/30 shadow-lg p-6 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-xl"
              >
                <span className="text-4xl mb-2 text-green-400">💬</span>
                <span className="text-3xl font-bold text-white">{dashboardStats.messageCount}</span>
                <span className="text-base text-white mt-1">New Messages</span>
              </div>
              <div
                onClick={() => setShowMatchRequests(true)}
                style={{ cursor: 'pointer' }}
                className="rounded-2xl bg-gray-900 border-2 border-pink-500/30 shadow-lg p-6 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-xl"
              >
                <span className="text-4xl mb-2 text-pink-400">🤝</span>
                <span className="text-3xl font-bold text-white">{dashboardStats.matchRequests}</span>
                <span className="text-base text-white mt-1">Match Requests</span>
              </div>
            </div>
            
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
                  <MoodWidget currentMood={userData?.currentMood} onMoodUpdate={(mood) => {
                    if (userData) {
                      userData.currentMood = mood;
                    }
                  }} />
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
                  <ResultsCard userId={user?.uid} />
                </div>
              </motion.div>
              {/* Roommate Tip of the Day */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="col-span-1 flex items-center justify-center"
              >
                <div className="bg-gradient-to-br from-purple-900/80 to-pink-800/60 border border-pink-600/30 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center w-full">
                  <span className="text-4xl mb-4 text-pink-400 drop-shadow-glow">💡</span>
                  <h3 className="text-xl font-bold mb-2 text-white">Roommate Tip</h3>
                  <p className="text-pink-100 mb-2 italic">
                    "Communication is key! Set clear expectations with your roommate from the start."
                  </p>
                  <span className="text-xs text-pink-300">Tip of the Day</span>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mt-8"
            >
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            </motion.div>
            
            {/* Action buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap justify-center mt-12 gap-6"
            >
              {/* <motion.button
                onClick={() => router.push('/chat')}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg transition-all duration-300"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 0 15px rgba(236, 72, 153, 0.5)" 
                }}
                whileTap={{ scale: 0.98 }}
              >
                My Chats
              </motion.button> */}
              
              <motion.button
                onClick={() => router.push('/quiz')}
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
      {showQuiz && (
        <QuizComponent />
      )}
      <MatchRequestsModal 
        isOpen={showMatchRequests}
        onClose={() => setShowMatchRequests(false)}
      />
    </ProtectedRoute>
  );
}
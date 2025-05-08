import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { findMatches } from '../lib/firebase';

export const useQuiz = () => {
  const { user } = useAuth();
  const [quizResults, setQuizResults] = useState({});
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample quiz questions - can be moved to a separate config file
  const quizQuestions = [
    {
      id: 'sleepSchedule',
      question: 'What is your typical sleep schedule?',
      options: [
        { value: 'early', label: 'Early bird (sleep early, wake early)' },
        { value: 'late', label: 'Night owl (sleep late, wake late)' },
        { value: 'mixed', label: 'Mixed/Flexible' }
      ]
    },
    {
      id: 'cleanliness',
      question: 'How would you describe your cleanliness level?',
      options: [
        { value: 'very_clean', label: 'Very organized and clean' },
        { value: 'moderately_clean', label: 'Moderately clean' },
        { value: 'messy', label: 'Comfortable with some mess' }
      ]
    },
    {
      id: 'noise',
      question: 'What is your noise preference?',
      options: [
        { value: 'quiet', label: 'I prefer quiet environments' },
        { value: 'moderate', label: 'Some background noise is fine' },
        { value: 'lively', label: 'I enjoy music and lively environments' }
      ]
    },
    {
      id: 'guests',
      question: 'How often do you plan to have guests over?',
      options: [
        { value: 'rarely', label: 'Rarely or never' },
        { value: 'occasionally', label: 'Occasionally' },
        { value: 'frequently', label: 'Frequently' }
      ]
    },
    {
      id: 'sharing',
      question: 'How do you feel about sharing items (food, appliances, etc.)?',
      options: [
        { value: 'separate', label: 'I prefer keeping things separate' },
        { value: 'some_sharing', label: 'Some sharing is fine' },
        { value: 'communal', label: 'I prefer a communal approach' }
      ]
    }
  ];

  // Save quiz answers and find matches
  const submitQuiz = async (answers) => {
    if (!user) {
      throw new Error('You must be logged in to submit the quiz');
    }

    try {
      setLoading(true);
      
      // Save quiz results to Firestore
      const userRef = doc(db, 'roomie-users', user.uid);
      await setDoc(userRef, {
        quizAnswers: answers,
        quizCompleted: true,
        quizCompletedAt: new Date()
      }, { merge: true });

      setQuizResults(answers);
      
      // Find potential matches
      const potentialMatches = await findMatches(user.uid);
      setMatches(potentialMatches);
      
      return potentialMatches;
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Find matches based on quiz answers
  const findMatches = async (userId) => {
    try {
      // Get current user's quiz data
      const userRef = doc(db, 'roomie-users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      
      if (!userData.quizAnswers) {
        throw new Error('Quiz answers not found');
      }

      // Get all users who have completed the quiz
      const usersRef = collection(db, 'roomie-users');
      const q = query(
        usersRef,
        where('quizCompleted', '==', true),
        where('uid', '!=', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const matches = [];
      
      querySnapshot.forEach((doc) => {
        const potentialMatch = doc.data();
        if (potentialMatch.quizAnswers) {
          const compatibilityScore = calculateCompatibility(
            userData.quizAnswers,
            potentialMatch.quizAnswers
          );
          
          matches.push({
            userId: doc.id,
            name: potentialMatch.name || 'Anonymous',
            compatibility: compatibilityScore,
            gender: potentialMatch.gender
          });
        }
      });
      
      return matches.sort((a, b) => b.compatibility - a.compatibility);
    } catch (err) {
      console.error('Error finding matches:', err);
      throw err;
    }
  };

  // Helper function to calculate compatibility between two users
  const calculateCompatibility = (user1Answers, user2Answers) => {
    if (!user1Answers || !user2Answers) return 0;
    
    let score = 0;
    let totalQuestions = 0;
    
    for (const question in user1Answers) {
      if (user2Answers[question]) {
        totalQuestions++;
        if (user1Answers[question] === user2Answers[question]) {
          score++;
        }
      }
    }
    
    return totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
  };

  return {
    quizQuestions,
    quizResults,
    matches,
    loading,
    error,
    submitQuiz
  };
};
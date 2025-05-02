// components/quiz/QuizComponent.js
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const questions = [
  {
    id: 1,
    question: "Do you prefer to...",
    options: ["Wake up early", "Stay up late"],
    images: ["☀️", "🌙"]
  },
  {
    id: 2,
    question: "Your ideal living space is...",
    options: ["Neat and organized", "Comfortable and lived-in"],
    images: ["🧹", "🛋️"]
  },
  {
    id: 3,
    question: "On weekends, you'd rather...",
    options: ["Go out and socialize", "Stay in and relax"],
    images: ["🎉", "📺"]
  },
  {
    id: 4,
    question: "When it comes to noise levels...",
    options: ["I prefer quiet", "I don't mind some noise"],
    images: ["🤫", "🔊"]
  },
  {
    id: 5,
    question: "With shared spaces, you're...",
    options: ["Very respectful of boundaries", "Happy to share everything"],
    images: ["🚪", "🤝"]
  }
];

export default function QuizComponent({ onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    setProgress((currentQuestionIndex / questions.length) * 100);
  }, [currentQuestionIndex]);

  const handleAnswer = (optionIndex) => {
    const newAnswers = { ...answers, [currentQuestionIndex]: optionIndex };
    setAnswers(newAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setDirection(1);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (onComplete) onComplete(newAnswers);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden"
    >
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200">
        <motion.div 
          className="h-full bg-purple-600" 
          initial={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Roommate Quiz</h3>
          <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</span>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestionIndex}
            initial={{ x: direction * 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">{currentQuestion.question}</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAnswer(index)}
                  className={`py-4 px-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200
                    ${answers[currentQuestionIndex] === index 
                      ? 'border-purple-600 bg-purple-50 text-purple-800' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'}
                  `}
                >
                  <span className="text-3xl mb-2">{currentQuestion.images[index]}</span>
                  <span className="text-center">{option}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex justify-between">
          <button
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${currentQuestionIndex === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-purple-600 hover:text-purple-800'}
            `}
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {questions.map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 rounded-full ${
                  index === currentQuestionIndex ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="w-20"></div> {/* Empty div for balanced layout */}
        </div>
      </div>
    </motion.div>
  );
}
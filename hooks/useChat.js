import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export function useChat(chatId) {
  const { user, userData } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatInfo, setChatInfo] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  
  const messagesListener = useRef(null);

  // Load chat information and messages
  useEffect(() => {
    if (!chatId || !user) return;

    const loadChatInfo = async () => {
      try {
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);
        
        if (!chatSnap.exists()) {
          setError("Chat not found");
          setLoading(false);
          return;
        }
        
        const chatData = chatSnap.data();
        setChatInfo(chatData);
        
        // Find the other user in the chat
        const otherUserId = chatData.participants.find(id => id !== user.uid);
        if (otherUserId) {
          const otherUserRef = doc(db, 'users', otherUserId);
          const otherUserSnap = await getDoc(otherUserRef);
          if (otherUserSnap.exists()) {
            setOtherUser(otherUserSnap.data());
          }
        }

        // Set up messages listener
        const q = query(
          collection(db, 'messages'),
          where('chatId', '==', chatId),
          orderBy('timestamp', 'asc')
        );

        messagesListener.current = onSnapshot(q, (querySnapshot) => {
          const messageList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
          }));
          
          setMessages(messageList);
          setLoading(false);
        }, (err) => {
          setError(err.message);
          setLoading(false);
        });
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadChatInfo();

    return () => {
      if (messagesListener.current) {
        messagesListener.current();
      }
    };
  }, [chatId, user]);

  // Send message function
  const sendMessage = async (text) => {
    if (!chatId || !user || !text.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        chatId,
        senderId: user.uid,
        senderName: userData?.name || user.email,
        text,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    chatInfo,
    otherUser
  };
}
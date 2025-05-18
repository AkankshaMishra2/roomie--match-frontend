import { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const notificationsRef = collection(db, 'roomie-users', user.uid, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
      setUnreadNotificationCount(notifs.length);
    });
    return () => unsubscribe();
  }, [user]);

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    const notificationsRef = collection(db, 'roomie-users', user.uid, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadNotificationCount,
      markAllNotificationsAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext); 
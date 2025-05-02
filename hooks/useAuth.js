// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase'; // Changed from firestore to db
import { signInUser, signUpUser, signOutUser, getCurrentUser, updateUserProfile } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        
        // Fetch user data from Firestore
        try {
          // Using the standardized db reference
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // If user doc doesn't exist yet (first login), create it with basic info
            const basicUserData = {
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName || '',
              photoURL: authUser.photoURL || '',
              createdAt: new Date()
            };
            
            await setDoc(userDocRef, basicUserData);
            setUserData(basicUserData);
          }
          
          // Fetch user data from backend
          try {
            const backendUser = await getCurrentUser();
            setBackendData(backendUser);
          } catch (backendError) {
            console.error("Error fetching backend user data:", backendError);
            // If backend fetch fails, we still have Firebase data
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // User is signed out
        setUser(null);
        setUserData(null);
        setBackendData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Enhanced sign up function
  const signup = async (email, password, userData) => {
    setLoading(true);
    try {
      const result = await signUpUser(email, password, userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sign in function
  const signin = async (email, password) => {
    setLoading(true);
    try {
      const result = await signInUser(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sign out function
  const signout = async () => {
    setLoading(true);
    try {
      await signOutUser();
    } finally {
      setLoading(false);
    }
  };

  // Update user profile data
  const updateProfile = async (newData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...userData,
        ...newData,
        updatedAt: new Date()
      }, { merge: true });
      
      // Update in backend
      await updateUserProfile(newData);
      
      // Update local state
      setUserData(prevData => ({
        ...prevData,
        ...newData,
        updatedAt: new Date()
      }));
      
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userData,
    backendData,
    loading,
    signup,
    signin,
    signout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
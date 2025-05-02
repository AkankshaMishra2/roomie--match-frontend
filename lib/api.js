// frontend/lib/api-auth.js
import apiClient from './api';
import { auth, firestore } from './firebase';
import { 
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseSignUp,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Helper function to store token in localStorage
const storeAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Helper function to remove token from localStorage
const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Sign in user with email and password
 * This function handles both Firebase Auth and backend API authentication
 */
export const signInUser = async (email, password) => {
  try {
    // First, authenticate with Firebase
    const userCredential = await firebaseSignIn(auth, email, password);
    
    // Then authenticate with our backend API
    const response = await apiClient.post('/auth/signin', {
      email,
      password
    });
    
    // Store the JWT token returned from our backend
    if (response.data.token) {
      storeAuthToken(response.data.token);
    }
    
    return {
      user: userCredential.user,
      userData: response.data.user
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

/**
 * Sign up a new user
 * This function handles both Firebase Auth and backend API user creation
 */
export const signUpUser = async (email, password, userData) => {
  try {
    // First, create user in Firebase Auth
    const userCredential = await firebaseSignUp(auth, email, password);
    
    // Update display name in Firebase Auth
    await updateProfile(userCredential.user, {
      displayName: userData.name
    });
    
    // Create user document in Firestore
    await setDoc(doc(firestore, 'users', userCredential.user.uid), {
      ...userData,
      email,
      createdAt: new Date(),
      quizCompleted: false,
      moodStatus: {
        emoji: '😊',
        color: '#FFE66D',
        status: 'Just joined!',
        lastUpdated: new Date(),
      }
    });
    
    // Then register with our backend API
    const response = await apiClient.post('/auth/signup', {
      name: userData.name,
      email,
      password
    });
    
    // Store the JWT token returned from our backend
    if (response.data.token) {
      storeAuthToken(response.data.token);
    }
    
    return {
      user: userCredential.user,
      userData: response.data.user
    };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Sign out user
 * This function handles both Firebase Auth sign out and backend cleanup
 */
export const signOutUser = async () => {
  try {
    // Sign out from Firebase
    await signOut(auth);
    
    // Remove JWT token
    removeAuthToken();
    
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Get the current user's profile from the backend API
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
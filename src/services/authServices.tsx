// authService.js
import {
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';

const loginAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
  } catch (error) {
    console.error('Error logging in anonymously:', error);
  }
};

const registerWithEmailPassword = async (email: any, password: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error registering with email:', error);
  }
};

const loginWithEmailPassword = async (email: any, password: any) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error logging in with email:', error);
  }
};

export { loginAnonymously, registerWithEmailPassword, loginWithEmailPassword };

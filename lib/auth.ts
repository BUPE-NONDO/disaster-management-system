import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'COORDINATOR' | 'RESPONDER' | 'REPORTER';
  createdAt: Date;
  updatedAt: Date;
}

export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  // Sign up with email and password
  async signUp(email: string, password: string, name: string, role: UserProfile['role'] = 'REPORTER') {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    const userProfile: Omit<UserProfile, 'uid'> = {
      email,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'users', result.user.uid), userProfile);
    
    return result.user;
  },

  // Sign out
  async signOut() {
    await signOut(auth);
  },

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() } as UserProfile;
    }
    return null;
  },

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>) {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    }, { merge: true });
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Get ID token for API calls
  async getIdToken() {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
};
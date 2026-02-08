import { auth } from "./config"
import {
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth"

const googleProvider = new GoogleAuthProvider()

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error("Error signing in with Google:", error)
    throw error
  }
}

export const logout = async () => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

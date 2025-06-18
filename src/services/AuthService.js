import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

class AuthService {
  async signUp(email, password, username) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await this.registerUser(user.uid, email, username);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async registerUser(userId, email, username) {
    try {
      await setDoc(doc(db, "users", userId), {
        email: email,
        username: username,
        userId: userId,
        createdAt: new Date(),
        favorites: []
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService(); 
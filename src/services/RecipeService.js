import { db } from '../config/firebase';
import { collection, addDoc, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';

class RecipeService {
  async addRecipe(title, ingredients, instructions, userId, imageURL = '') {
    try {
      const recipeRef = await addDoc(collection(db, 'recipes'), {
        title,
        ingredients,
        instructions,
        userId,
        imageURL,
        timestamp: new Date()
      });
      return recipeRef.id;
    } catch (error) {
      throw error;
    }
  }

  async addToFavorites(userId, recipeId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        favorites: arrayUnion(recipeId)
      });
    } catch (error) {
      throw error;
    }
  }

  async removeFromFavorites(userId, recipeId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        favorites: arrayRemove(recipeId)
      });
    } catch (error) {
      throw error;
    }
  }

  async addComment(recipeId, text, userId) {
    try {
      const commentRef = await addDoc(collection(db, 'recipes', recipeId, 'comments'), {
        text,
        userId,
        timestamp: new Date()
      });
      return commentRef.id;
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(recipeId, commentId) {
    try {
      const commentRef = doc(db, 'recipes', recipeId, 'comments', commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      throw error;
    }
  }
}

export default new RecipeService(); 
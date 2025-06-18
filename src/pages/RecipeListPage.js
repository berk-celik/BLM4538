import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { List, Text, IconButton, ActivityIndicator } from 'react-native-paper';
import { db, auth } from '../config/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import recipeService from '../services/RecipeService';

const RecipeListPage = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setError('Kullanıcı girişi yapılmamış');
      return;
    }

    try {
      // Fetch user's favorites
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setFavorites(doc.data().favorites || []);
        }
      }, (error) => {
        console.error('Favorites fetch error:', error);
        setError('Favoriler yüklenirken hata oluştu');
        setLoading(false);
      });

      // Fetch recipes
      const q = query(collection(db, 'recipes'), orderBy('timestamp', 'desc'));
      const unsubscribeRecipes = onSnapshot(q, async (snapshot) => {
        try {
          const recipeList = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const recipeData = docSnap.data();
              const userDoc = await getDoc(doc(db, 'users', recipeData.userId));
              const username = userDoc.exists() ? userDoc.data().username : 'Unknown';
              
              return {
                id: docSnap.id,
                ...recipeData,
                username,
              };
            })
          );
          setRecipes(recipeList);
          setLoading(false);
        } catch (error) {
          console.error('Recipe fetch error:', error);
          setError('Tarifler yüklenirken hata oluştu');
          setLoading(false);
        }
      }, (error) => {
        console.error('Recipes snapshot error:', error);
        setError('Tarifler yüklenirken hata oluştu');
        setLoading(false);
      });

      return () => {
        unsubscribeUser();
        unsubscribeRecipes();
      };
    } catch (error) {
      console.error('Initial setup error:', error);
      setError('Bir hata oluştu');
      setLoading(false);
    }
  }, []);

  const handleFavorite = async (recipeId) => {
    const user = auth.currentUser;
    if (!user) return;

    if (favorites.includes(recipeId)) {
      await recipeService.removeFromFavorites(user.uid, recipeId);
    } else {
      await recipeService.addToFavorites(user.uid, recipeId);
    }
  };

  const renderRecipe = ({ item }) => (
    <List.Item
      title={item.title}
      description={`Yazar: ${item.username}`}
      left={props => (
        item.imageURL ? (
          <Image
            source={{ uri: item.imageURL }}
            style={styles.image}
          />
        ) : (
          <List.Icon {...props} icon="image-off" />
        )
      )}
      right={props => (
        <IconButton
          {...props}
          icon={favorites.includes(item.id) ? 'heart' : 'heart-outline'}
          iconColor={favorites.includes(item.id) ? 'red' : undefined}
          onPress={() => handleFavorite(item.id)}
        />
      )}
      onPress={() => navigation.navigate('RecipeDetail', {
        title: item.title,
        ingredients: item.ingredients,
        instructions: item.instructions,
        userId: item.userId,
        imageURL: item.imageURL,
      })}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {recipes.length === 0 ? (
        <Text style={styles.emptyText}>Henüz tarif eklenmemiş.</Text>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default RecipeListPage; 
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { List, Text, ActivityIndicator } from 'react-native-paper';
import { db, auth } from '../config/firebase';
import { doc, onSnapshot, collection, query, where, getDocs, getDoc } from 'firebase/firestore';

const FavoritesPage = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setError('Kullanıcı girişi yapılmamış');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, async (userDocSnap) => {
        try {
          if (userDocSnap.exists()) {
            const favoriteIds = userDocSnap.data().favorites || [];
            
            if (favoriteIds.length === 0) {
              setFavorites([]);
              setLoading(false);
              return;
            }

            const recipesRef = collection(db, 'recipes');
            const q = query(recipesRef, where('__name__', 'in', favoriteIds));
            const querySnapshot = await getDocs(q);
            
            const recipeList = await Promise.all(
              querySnapshot.docs.map(async (docSnap) => {
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
            
            setFavorites(recipeList);
            setLoading(false);
          } else {
            setError('Kullanıcı bilgileri bulunamadı');
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching favorites:', error);
          setError('Favoriler yüklenirken hata oluştu');
          setLoading(false);
        }
      }, (error) => {
        console.error('Snapshot error:', error);
        setError('Favoriler yüklenirken hata oluştu');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Initial setup error:', error);
      setError('Bir hata oluştu');
      setLoading(false);
    }
  }, []);

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
      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>Favorileriniz boş</Text>
      ) : (
        <FlatList
          data={favorites}
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

export default FavoritesPage; 
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, FlatList } from 'react-native';
import { Text, IconButton, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { db, auth } from '../config/firebase';
import { doc, onSnapshot, collection, query, orderBy, getDoc, where, getDocs } from 'firebase/firestore';
import recipeService from '../services/RecipeService';

const RecipeDetailPage = ({ route }) => {
  const { title, ingredients, instructions, imageURL } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recipeId, setRecipeId] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setError('Kullanıcı girişi yapılmamış');
      return;
    }

    try {
      // Find recipe ID
      const findRecipeId = async () => {
        try {
          const recipesRef = collection(db, 'recipes');
          const q = query(recipesRef, where('title', '==', title));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            setError('Tarif bulunamadı');
            setLoading(false);
            return;
          }

          const recipeDoc = querySnapshot.docs[0];
          setRecipeId(recipeDoc.id);
          
          // Listen for favorites
          const userDocRef = doc(db, 'users', user.uid);
          const unsubscribeUser = onSnapshot(userDocRef, (userDoc) => {
            if (userDoc.exists()) {
              const favorites = userDoc.data().favorites || [];
              setIsFavorite(favorites.includes(recipeDoc.id));
            }
          }, (error) => {
            console.error('Favorites snapshot error:', error);
            setError('Favori bilgileri yüklenirken hata oluştu');
            setLoading(false);
          });

          // Listen for comments
          const commentsRef = collection(db, 'recipes', recipeDoc.id, 'comments');
          const commentsQuery = query(commentsRef, orderBy('timestamp', 'desc'));
          const unsubscribeComments = onSnapshot(commentsQuery, async (snapshot) => {
            try {
              const commentList = await Promise.all(
                snapshot.docs.map(async (commentDoc) => {
                  const commentData = commentDoc.data();
                  const userDoc = await getDoc(doc(db, 'users', commentData.userId));
                  const username = userDoc.exists() ? userDoc.data().username : 'Unknown';
                  
                  return {
                    id: commentDoc.id,
                    ...commentData,
                    username,
                  };
                })
              );
              setComments(commentList);
              setLoading(false);
            } catch (error) {
              console.error('Error fetching comments:', error);
              setError('Yorumlar yüklenirken hata oluştu');
              setLoading(false);
            }
          }, (error) => {
            console.error('Comments snapshot error:', error);
            setError('Yorumlar yüklenirken hata oluştu');
            setLoading(false);
          });

          return () => {
            unsubscribeUser();
            unsubscribeComments();
          };
        } catch (error) {
          console.error('Error finding recipe:', error);
          setError('Tarif bilgileri yüklenirken hata oluştu');
          setLoading(false);
        }
      };

      findRecipeId();
    } catch (error) {
      console.error('Initial setup error:', error);
      setError('Bir hata oluştu');
      setLoading(false);
    }
  }, [title]);

  const handleFavorite = async () => {
    const user = auth.currentUser;
    if (!user || !recipeId) return;

    try {
      if (isFavorite) {
        await recipeService.removeFromFavorites(user.uid, recipeId);
      } else {
        await recipeService.addToFavorites(user.uid, recipeId);
      }
    } catch (error) {
      console.error('Error handling favorite:', error);
      setError('Favori işlemi sırasında hata oluştu');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !recipeId) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      await recipeService.addComment(recipeId, commentText.trim(), user.uid);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Yorum eklenirken hata oluştu');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!recipeId) return;

    try {
      await recipeService.deleteComment(recipeId, commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Yorum silinirken hata oluştu');
    }
  };

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
    <ScrollView style={styles.container}>
      {imageURL && (
        <Image
          source={{ uri: imageURL }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.sectionTitle}>Malzemeler:</Text>
        <Text style={styles.text}>{ingredients}</Text>

        <Text style={styles.sectionTitle}>Açıklamalar:</Text>
        <Text style={styles.text}>{instructions}</Text>

        <View style={styles.favoriteContainer}>
          <IconButton
            icon={isFavorite ? 'heart' : 'heart-outline'}
            iconColor={isFavorite ? 'red' : undefined}
            size={36}
            onPress={handleFavorite}
          />
          <Text style={styles.favoriteText}>
            {isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Yorumlar:</Text>
        {comments.length === 0 ? (
          <Text style={styles.emptyText}>Daha Yorum Yapılmamış.</Text>
        ) : (
          <FlatList
            data={comments}
            renderItem={({ item }) => (
              <View style={styles.commentContainer}>
                <Text style={styles.commentText}>{item.text}</Text>
                <Text style={styles.commentAuthor}>
                  Tarafından: {item.username}
                </Text>
                {item.userId === auth.currentUser?.uid && (
                  <IconButton
                    icon="delete"
                    onPress={() => handleDeleteComment(item.id)}
                  />
                )}
              </View>
            )}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}

        <View style={styles.commentInputContainer}>
          <TextInput
            label="Yorum Yazın..."
            value={commentText}
            onChangeText={setCommentText}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.commentInput}
          />
          <Button
            mode="contained"
            onPress={handleAddComment}
            style={styles.commentButton}
          >
            Gönder
          </Button>
        </View>
      </View>
    </ScrollView>
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
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  favoriteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  favoriteText: {
    fontSize: 18,
    marginLeft: 8,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  commentContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 16,
  },
  commentAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  commentInputContainer: {
    marginTop: 16,
  },
  commentInput: {
    marginBottom: 8,
  },
  commentButton: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default RecipeDetailPage; 
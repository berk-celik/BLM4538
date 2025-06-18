import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { auth } from '../config/firebase';
import recipeService from '../services/RecipeService';

const AddRecipePage = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  const handleSubmit = async () => {
    if (!title || !ingredients || !instructions) {
      setError('Lütfen eksik yerleri doldurun.');
      setVisible(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Kullanıcı oturumu kapalı.');
      }

      await recipeService.addRecipe(
        title.trim(),
        ingredients.trim(),
        instructions.trim(),
        user.uid,
        imageURL.trim()
      );

      navigation.goBack();
    } catch (error) {
      setError(`Hata: ${error.message}`);
      setVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <TextInput
            label="Tarif adı"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Malzemeler"
            value={ingredients}
            onChangeText={setIngredients}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={4}
          />

          <TextInput
            label="Açıklama"
            value={instructions}
            onChangeText={setInstructions}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={4}
          />

          <TextInput
            label="Resim URL'si (Opsiyonel)"
            value={imageURL}
            onChangeText={setImageURL}
            style={styles.input}
            mode="outlined"
          />

          {isSubmitting ? (
            <Text style={styles.loading}>Gönderiliyor...</Text>
          ) : (
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
            >
              Gönder
            </Button>
          )}
        </View>
      </ScrollView>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  loading: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  snackbar: {
    backgroundColor: '#ff4444',
  },
});

export default AddRecipePage; 
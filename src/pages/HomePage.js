import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

const HomePage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ana Sayfa</Text>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('RecipeList')}
          style={styles.button}
        >
          Tarifler
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('AddRecipe')}
          style={styles.button}
        >
          Tarif Ekle
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('Favorites')}
          style={styles.button}
        >
          Favoriler
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    marginVertical: 8,
    paddingVertical: 8,
  },
});

export default HomePage; 
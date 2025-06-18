import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import RecipeListPage from '../pages/RecipeListPage';
import RecipeDetailPage from '../pages/RecipeDetailPage';
import AddRecipePage from '../pages/AddRecipePage';
import FavoritesPage from '../pages/FavoritesPage';
import { Provider as PaperProvider } from 'react-native-paper';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
          name="Login" 
          component={LoginPage} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomePage} 
          options={{ headerShown: false }}
        />
          <Stack.Screen 
            name="RecipeList" 
            component={RecipeListPage} 
            options={{ title: 'Tarifler' }}
          />
          <Stack.Screen 
            name="RecipeDetail" 
            component={RecipeDetailPage} 
            options={{ title: 'Tarif Detayı' }}
          />
          <Stack.Screen 
            name="AddRecipe" 
            component={AddRecipePage} 
            options={{ title: 'Yeni Tarif Ekle' }}
          />
          <Stack.Screen 
            name="Favorites" 
            component={FavoritesPage} 
            options={{ title: 'Favorilerim' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default AppNavigator; 
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import authService from '../services/AuthService';

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignInMode, setIsSignInMode] = useState(true);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  const handleAuth = async () => {
    try {
      if (isSignInMode) {
        await authService.signIn(email, password);
      } else {
        if (!username) {
          setError('Lütfen kullanıcı adınızı girin');
          setVisible(true);
          return;
        }
        await authService.signUp(email, password, username);
      }
      navigation.replace('Home');
    } catch (error) {
      setError(error.message);
      setVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isSignInMode ? 'Hoş Geldiniz!' : 'Hesap Oluşturun'}
          </Text>

          {!isSignInMode && (
            <TextInput
              label="Kullanıcı Adı"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              mode="outlined"
            />
          )}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
          />

          <Button
            mode="contained"
            onPress={handleAuth}
            style={styles.button}
          >
            {isSignInMode ? 'Giriş Yap' : 'Üye Ol'}
          </Button>

          <Button
            mode="text"
            onPress={() => setIsSignInMode(!isSignInMode)}
            style={styles.switchButton}
          >
            {isSignInMode
              ? 'Hesabınız Yok mu? Yeni Hesap Oluşturun!'
              : 'Hesabınız Var mı? Giriş Yapın!'}
          </Button>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  switchButton: {
    marginTop: 16,
  },
  snackbar: {
    backgroundColor: '#ff4444',
  },
});

export default LoginPage; 
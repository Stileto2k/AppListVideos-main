import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../firebaseconfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import Toast from 'react-native-toast-message';

export default function AuthScreen({ navigation }) {
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuthAction = async () => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, userEmail, userPassword);
      } else {
        await signInWithEmailAndPassword(auth, userEmail, userPassword);
      }
      
    } catch (err) {
      const errorMsg = err.message;

      if (errorMsg.includes('auth/weak-password')) {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Weak Password',
          text2: 'Your password must have at least 6 characters.',
          visibilityTime: 3500,
        });
      } else if (errorMsg.includes('auth/invalid-email')) {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Invalid Email',
          text2: 'Please provide a valid email address.',
          visibilityTime: 3500,
        });
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Authentication Failed',
          text2: errorMsg,
          visibilityTime: 3500,
        });
      }
    }
  };

  return (
    <View style={authStyles.wrapper}>
      <Text style={authStyles.heading}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>

      <TextInput
        placeholder="Enter Email"
        value={userEmail}
        onChangeText={setUserEmail}
        style={authStyles.textField}
      />

      <TextInput
        placeholder="Enter Password"
        value={userPassword}
        onChangeText={setUserPassword}
        secureTextEntry
        style={authStyles.textField}
      />

      <TouchableOpacity style={authStyles.authButton} onPress={handleAuthAction}>
        <Text style={authStyles.authButtonText}>
          {isSignUp ? 'Sign Up' : 'Log In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={authStyles.switchLink}>
          {isSignUp ? 'Already have an account? Log In' : 'Don’t have an account? Sign Up'}
        </Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
}

const authStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#e8f5e9', // Soft green background
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 25,
    color: '#1b5e20', // Deep green for the heading
    textAlign: 'center',
  },
  textField: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#a5d6a7', // Light green for input borders
    backgroundColor: '#ffffff',
    fontSize: 15,
    color: '#2e7d32', // Text inside inputs
  },
  authButton: {
    backgroundColor: '#4caf50', // Bright green button
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  authButtonText: {
    color: '#ffffff', // White text for the button
    fontSize: 18,
    fontWeight: '600',
  },
  switchLink: {
    fontSize: 14,
    color: '#388e3c', // Subtle green for the switch link
    textAlign: 'center',
    marginTop: 10,
  },
});

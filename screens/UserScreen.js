import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';

const UserScreen = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Information</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Email: {user ? user.email : 'Not available'}</Text>
        <Text style={styles.infoText}>Password: {'******'}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#d0f0c0', // Light green background
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#004d40', // Dark green for title
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#ffffff', // White background for info container
    borderRadius: 12,
    padding: 25,
    width: '100%',
    marginBottom: 25,
    borderColor: '#4caf50', // Green border color
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Android shadow effect
  },
  infoText: {
    fontSize: 18,
    color: '#004d40', // Dark green color for info text
    marginBottom: 12,
  },
  logoutButton: {
    width: '100%',
    padding: 15,
    backgroundColor: '#388e3c', // Dark green for logout button
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2, // Button shadow
  },
  logoutText: {
    color: '#ffffff', // White text for logout button
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UserScreen;

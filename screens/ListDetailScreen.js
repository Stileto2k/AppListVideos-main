import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../firebaseconfig';
import { collection, query, where, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

const ListDetailScreen = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const auth = getAuth();

  useFocusEffect(
    React.useCallback(() => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const q = query(collection(db, 'videos'), where('userId', '==', userId));

        // Using onSnapshot to get real-time updates
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const videoList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setVideos(videoList);
        });

        // Clean up the listener when the component unmounts or when the focus is lost
        return () => unsubscribe();
      }
    }, [auth.currentUser?.uid])
  );

  const handlePlayVideo = (url) => {
    setSelectedUrl(url);
    setIsFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
    setSelectedUrl('');
  };

  const handleDeleteVideo = (id) => {
    Alert.alert(
      "Delete Video",
      "Are you sure you want to delete this video?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'videos', id));
            } catch (error) {
              console.error('Error deleting video: ', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {isFullScreen ? (
        <View style={styles.fullScreenContainer}>
          <WebView source={{ uri: selectedUrl }} style={styles.fullScreenWebView} />
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.videoItem}>
              <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
              <Text style={styles.videoTitle}>{item.title}</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>
              <TouchableOpacity style={styles.playButton} onPress={() => handlePlayVideo(item.url)}>
                <Text style={styles.playButtonText}>Play</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteVideo(item.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      {/* Button to go back to the previous screen */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e8f5e9', // Soft green background
    flex: 1,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 40,  // Increased size for the close button
    color: '#fff',  // White color for high contrast
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 1)',  // Dark background to highlight
    borderRadius: 15,  // Rounded corners for a softer look
    padding: 10,  // Padding around the close icon
  },
  closeButtonModal: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 30,
    color: '#1b5e20',  // Deep green for the close button
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 40,  // Increased size for the close button
    color: '#fff',  // White color for high contrast
  },
  fullScreenWebView: {
    flex: 1,
  },
  videoItem: {
    marginBottom: 20,
    backgroundColor: '#c8e6c9', // Lighter green background
    borderRadius: 8,
    padding: 10,
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#1b5e20', // Dark green for the title
    textAlign: 'center', // Centered title
    backgroundColor: '#81c784', // Lighter green background for title
    paddingVertical: 5,
    borderRadius: 5, // Rounded corners
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',  // Dark grey text for description
    marginBottom: 15,
    lineHeight: 22,
    textAlign: 'justify',  // Justified text for neat appearance
    padding: 15,  // Padding around the text
    backgroundColor: '#ffffff',  // White background for description
    borderRadius: 8,  // Rounded corners
    shadowColor: '#000',  // Light shadow for depth
    shadowOpacity: 0.1,  // Slight shadow opacity
    shadowRadius: 4,  // Shadow radius
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  playButton: {
    backgroundColor: '#66bb6a', // Green background for play button
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#e53935', // Red for delete button
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#81c784', // Lighter green background for the back button
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fefae0', // Light background color for text
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ListDetailScreen;

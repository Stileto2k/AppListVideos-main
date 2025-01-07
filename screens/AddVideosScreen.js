import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, Modal, TouchableOpacity, Image, Switch, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../firebaseconfig';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

const AddVideosScreen = () => {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isInstagram, setIsInstagram] = useState(false);
  const [videoList, setVideoList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const auth = getAuth();
  const [date, setDate] = useState(new Date().toLocaleString());

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchVideos();
    }, [])
  );

  const fetchVideos = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const q = query(collection(db, 'videos'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const videos = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVideoList(videos);
    }
  };

  const handleAddVideo = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId && videoTitle && videoDescription && videoUrl) {
        const thumbnailUrl = isInstagram ? getInstagramThumbnail() : getYouTubeThumbnail(videoUrl);

        if (thumbnailUrl) {
          const currentDate = new Date();

          await addDoc(collection(db, 'videos'), {
            userId,
            title: videoTitle,
            description: videoDescription,
            url: videoUrl,
            platform: isInstagram ? 'Instagram' : 'YouTube',
            thumbnail: thumbnailUrl,
            date: currentDate.toISOString(),
          });

          setVideoTitle('');
          setVideoDescription('');
          setVideoUrl('');
          setIsInstagram(false);
          setIsModalVisible(false);
          fetchVideos();
        } else {
          alert('Error generating thumbnail.');
        }
      } else {
        alert('Please complete all fields.');
      }
    } catch (error) {
      console.error('Error adding video: ', error.message);
    }
  };

  const handleDeleteVideo = async (id) => {
    try {
      await deleteDoc(doc(db, 'videos', id));
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video: ', error.message);
    }
  };

  const handlePlayVideo = (url) => {
    setCurrentUrl(url);
    setIsFullScreenMode(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreenMode(false);
    setCurrentUrl('');
  };

  const getYouTubeThumbnail = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/0.jpg` : null;
  };

  const getInstagramThumbnail = () => {
    return Image.resolveAssetSource(require('../assets/instagram_thumbnail.jpg')).uri;
  };

  return (
    <View style={styles.screenContainer}>
      {isFullScreenMode ? (
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseFullScreen}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <WebView source={{ uri: currentUrl }} style={styles.fullScreenWebView} />
        </View>
      ) : (
        <>
          <FlatList
            data={videoList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.videoCard}>
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnailSmall} />
                <View style={styles.videoInfoContainer}>
                  <Text style={styles.videoTitle}>{item.title}</Text>
                  <Text style={styles.videoDescription}>{item.description}</Text>
                  <Text style={styles.videoPlatform}>Platform: {item.platform}</Text>
                  <Text style={styles.videoDate}>{formatDate(item.date)}</Text>
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.playButton]}
                      onPress={() => handlePlayVideo(item.url)}
                    >
                      <Text style={styles.buttonText}>Play</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteVideo(item.id)}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
          <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
          <Modal visible={isModalVisible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.modalCloseText}>X</Text>
                </TouchableOpacity>
                <TextInput
                  placeholder="Title"
                  value={videoTitle}
                  onChangeText={setVideoTitle}
                  style={styles.inputField}
                  placeholderTextColor="#555"
                />
                <TextInput
                  placeholder="Description"
                  value={videoDescription}
                  onChangeText={setVideoDescription}
                  style={styles.inputField}
                  placeholderTextColor="#555"
                />
                <TextInput
                  placeholder="URL"
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                  style={styles.inputField}
                  placeholderTextColor="#555"
                />
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Instagram</Text>
                  <Switch
                    value={isInstagram}
                    onValueChange={setIsInstagram}
                    trackColor={{ true: '#34a853', false: '#d3d3d3' }}
                  />
                </View>
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleAddVideo}>
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#e8f9e6',  // Light green background
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  fullScreenWebView: {
    flex: 1,
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  thumbnailSmall: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  videoInfoContainer: {
    flex: 1,
    padding: 10,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  videoDescription: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  videoPlatform: {
    fontSize: 12,
    color: '#888',
  },
  videoDate: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  playButton: {
    backgroundColor: '#34a853',  // Green
  },
  deleteButton: {
    backgroundColor: '#ff0000',  // Green
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#34a853',  // Green
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
  inputField: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    fontSize: 16,
    color: '#333',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#34a853',  // Green
  },
  cancelButton: {
    backgroundColor: '#34a853',  // Green
  },
});

export default AddVideosScreen;

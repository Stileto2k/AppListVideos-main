import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseconfig';
import { useFocusEffect } from '@react-navigation/native';

const ListsScreen = ({ navigation }) => {
  const [lists, setLists] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);

  // Fetch Lists and Videos
  const fetchLists = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const q = query(collection(db, 'lists'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const userLists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLists(userLists);
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    const q = query(collection(db, 'videos'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const userVideos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAllVideos(userVideos);
  }, []);

  useFocusEffect(() => {
    fetchLists();
    fetchVideos();
  });

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const q = query(collection(db, 'lists'), where('userId', '==', userId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userLists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLists(userLists);
      });
      return () => unsubscribe();
    }
  }, []);

  // Handle Create List
  const handleCreateList = async () => {
    const userId = auth.currentUser?.uid;
    if (userId && title && selectedVideos.length > 0) {
      await addDoc(collection(db, 'lists'), {
        userId,
        title,
        videos: selectedVideos,
      });
      closeModal();
      fetchLists();
    } else {
      Alert.alert('Missing Fields', 'Please provide a title and select at least one video.');
    }
  };

  // Handle Delete List
  const handleDeleteList = (listId) => {
    Alert.alert('Delete List', 'Are you sure you want to delete this list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: async () => await deleteDoc(doc(db, 'lists', listId)) },
    ]);
  };

  // Handle Remove Video
  const handleRemoveVideo = (videoId) => {
    setSelectedVideos(prevSelectedVideos => prevSelectedVideos.filter(video => video.id !== videoId));
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setTitle('');
    setSelectedVideos([]);
  };

  const renderListItem = ({ item }) => (
    <View style={styles.listItem}>
      <TouchableOpacity onPress={() => navigation.navigate('ListDetailScreen', { list: item })}>
        <Text style={styles.listTitle}>{item.title}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteList(item.id)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVideoItem = ({ item }) => (
    <View>
      <TouchableOpacity
        style={[
          styles.videoItem,
          selectedVideos.some(video => video.id === item.id) && styles.selectedVideo,
        ]}
        onPress={() => {
          setSelectedVideos(prev => prev.some(video => video.id === item.id)
            ? prev.filter(video => video.id !== item.id)
            : [...prev, item]);
        }}
      >
        <Text style={styles.videoText}>{item.title}</Text>
      </TouchableOpacity>
      {selectedVideos.some(video => video.id === item.id) && (
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveVideo(item.id)}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.createListButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.buttonText}>Create List</Text>
      </TouchableOpacity>

      <FlatList
        data={lists}
        keyExtractor={item => item.id}
        renderItem={renderListItem}
      />

      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="List Title"
            value={title}
            onChangeText={setTitle}
          />
          <FlatList
            data={allVideos}
            keyExtractor={item => item.id}
            renderItem={renderVideoItem}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleCreateList}>
            <Text style={styles.buttonText}>Save List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#E9F7EF' },
  createListButton: { backgroundColor: '#27AE60', padding: 14, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
  listItem: { padding: 18, borderBottomWidth: 1, borderColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  deleteButton: { backgroundColor: '#27AE60', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  deleteButtonText: { color: '#fff' },
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#E9F7EF', justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#2ECC71', padding: 14, borderRadius: 12, marginBottom: 20, fontSize: 16, backgroundColor: '#ffffff' },
  videoItem: { padding: 14, borderBottomWidth: 1, borderColor: '#ddd' },
  videoText: { fontSize: 16, color: '#333' },
  selectedVideo: { backgroundColor: '#27AE60', borderRadius: 8 },
  removeButton: { backgroundColor: '#27AE60', marginTop: 10, padding: 8, borderRadius: 6, alignItems: 'center' },
  removeText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  saveButton: { backgroundColor: '#27AE60', padding: 14, borderRadius: 12, marginVertical: 10, alignItems: 'center' },
  cancelButton: { backgroundColor: '#2ECC71', padding: 14, borderRadius: 12, marginVertical: 10, alignItems: 'center' }
});

export default ListsScreen;

import { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import WebViewModal from '../../components/WebViewModal';
import { getWebviewEvents } from './_layout';

interface UrlItem {
  name: string;
  url: string;
  pinned?: boolean;
}

export default function HomeScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [savedUrls, setSavedUrls] = useState<UrlItem[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<UrlItem | null>(null);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [actionVisibleIndex, setActionVisibleIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState('');
  const [showWebView, setShowWebView] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState({ url: '', name: '' });

  const router = useRouter();
  const webviewEvents = getWebviewEvents();

  useEffect(() => {
    const loadSavedUrls = async () => {
      try {
        const savedData = await AsyncStorage.getItem('savedUrls');
        if (savedData) {
          const parsed = JSON.parse(savedData) as UrlItem[];
          parsed.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
          setSavedUrls(parsed);
        }
      } catch (error) {
        console.error('Error loading saved URLs:', error);
      }
    };
    loadSavedUrls();
  }, []);

  const saveUrlsToStorage = async (urls: UrlItem[]) => {
    try {
      await AsyncStorage.setItem('savedUrls', JSON.stringify(urls));
    } catch (error) {
      console.error('Error saving URLs:', error);
    }
  };

  const isValidUrl = (input: string) => {
    const pattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}(\/[\w\-._~:?#[\]@!$&'()*+,;=]*)*\/?$/i;
    return pattern.test(input);
  };

  const formatUrl = (input: string) => {
    return input.startsWith('http://') || input.startsWith('https://')
      ? input
      : `https://${input}`;
  };

  const handleSave = () => {
    if (url.trim() === '' || name.trim() === '') {
      Alert.alert('Error', 'Please enter both name and URL');
      return;
    }

    if (!isValidUrl(url.trim())) {
      Alert.alert('Invalid URL', 'Please enter a valid URL');
      return;
    }

    const formattedUrl = formatUrl(url.trim());

    const alreadyExists = savedUrls.some((item) => item.url === formattedUrl);
    if (alreadyExists) {
      Alert.alert('Duplicate URL', 'This URL is already saved.');
      return;
    }

    const updatedUrls = [...savedUrls, { name: name.trim(), url: formattedUrl, pinned: false }];
    updatedUrls.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    setSavedUrls(updatedUrls);
    saveUrlsToStorage(updatedUrls);
    setUrl('');
    setName('');
  };

  const handleOpenUrl = (selectedUrl: string, selectedName: string) => {
    if (selectedUrl && selectedUrl.trim() !== '') {
      setIsLoading(true);
      setLoadingUrl(selectedName);
      
      // Save the last opened website to AsyncStorage
      const saveLastOpenedWebsite = async () => {
        try {
          const websiteData = {
            url: selectedUrl.trim(),
            name: selectedName
          };
          console.log('Saving website data:', websiteData);
          await AsyncStorage.setItem('lastOpenedWebsite', JSON.stringify(websiteData));
          
          // Notify WebView tab to refresh its data
          webviewEvents.emit('refresh');
        } catch (error) {
          console.error('Error saving last opened website:', error);
        }
      };
      saveLastOpenedWebsite();
      
      // Add a small delay to show loading UI
      setTimeout(() => {
        setIsLoading(false);
        setLoadingUrl('');
        
        // Instead of navigating, show the modal
        setSelectedWebsite({
          url: selectedUrl.trim(),
          name: selectedName
        });
        setShowWebView(true);
      }, 800);
    }
  };

  const handleClearUrl = (selectedUrl: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this link?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedUrls = savedUrls.filter((item) => item.url !== selectedUrl);
            setSavedUrls(updatedUrls);
            saveUrlsToStorage(updatedUrls);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleTogglePin = (selectedUrl: string) => {
    const updatedUrls = savedUrls.map((item) =>
      item.url === selectedUrl ? { ...item, pinned: !item.pinned } : item
    );
    updatedUrls.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    setSavedUrls(updatedUrls);
    saveUrlsToStorage(updatedUrls);
  };

  const handleEditUrl = (item: UrlItem) => {
    setEditingItem(item);
    setNewName(item.name);
    setNewUrl(item.url);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    if (newName.trim() === '' || newUrl.trim() === '') {
      Alert.alert('Error', 'Both fields are required');
      return;
    }

    if (!isValidUrl(newUrl.trim())) {
      Alert.alert('Invalid URL', 'Please enter a valid URL');
      return;
    }

    const formattedUrl = formatUrl(newUrl.trim());

    const updatedUrls = savedUrls.map((item) => {
      if (item.url === editingItem.url) {
        return { ...item, name: newName.trim(), url: formattedUrl };
      }
      return item;
    });

    updatedUrls.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    setSavedUrls(updatedUrls);
    saveUrlsToStorage(updatedUrls);
    setEditModalVisible(false);
    setEditingItem(null);
  };

  const toggleActionsVisibility = (index: number) => {
    setActionVisibleIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter website name"
        style={[
          styles.input,
          {
            borderColor: colors.border,
            backgroundColor: colors.inputBackground,
            color: colors.text,
          },
        ]}
        placeholderTextColor={colors.textSecondary}
      />
      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder="Enter website URL"
        style={[
          styles.input,
          {
            borderColor: colors.border,
            backgroundColor: colors.inputBackground,
            color: colors.text,
          },
        ]}
        placeholderTextColor={colors.textSecondary}
      />
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.buttonBackground }]}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save Website</Text>
      </TouchableOpacity>

      <FlatList
        data={savedUrls}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.urlItem,
              {
                backgroundColor: colors.card,
                shadowColor: colors.text,
              },
            ]}
          >
            <TouchableOpacity onPress={() => handleOpenUrl(item.url, item.name)} style={styles.urlContainer}>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {item.pinned ? '📌 ' : ''}
                {item.name}
              </Text>
              <Text style={[styles.itemUrl, { color: colors.textSecondary }]}>{item.url}</Text>
            </TouchableOpacity>
            <View style={styles.allActionsRow}>
              <TouchableOpacity
                onPress={() => toggleActionsVisibility(index)}
                style={[styles.iconButton, { backgroundColor: colors.inputBackground }]}
              >
                <Text style={[styles.iconText, { color: colors.text }]}>
                  {actionVisibleIndex === index ? '' : 'Edit'}
                </Text>
              </TouchableOpacity>
              {actionVisibleIndex === index && (
                <>
                  <TouchableOpacity
                    onPress={() => handleTogglePin(item.url)}
                    style={[styles.iconButton, { backgroundColor: colors.inputBackground }]}
                  >
                    <Text style={[styles.iconText, { color: colors.text }]}>📌</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleEditUrl(item)}
                    style={[styles.iconButton, { backgroundColor: colors.inputBackground }]}
                  >
                    <Text style={[styles.iconText, { color: colors.text }]}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleClearUrl(item.url)}
                    style={[styles.iconButton, { backgroundColor: colors.inputBackground }]}
                  >
                    <Text style={[styles.iconText, { color: colors.text }]}>✖️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => toggleActionsVisibility(index)}
                    style={[styles.iconButton, { backgroundColor: colors.inputBackground }]}
                  >
                    <Text style={[styles.iconText, { color: colors.text }]}>✅</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
        style={styles.list}
      />

      {/* Loading Modal */}
      <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.loadingModalContainer}>
          <View style={[styles.loadingModalContent, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="large" color={colors.buttonBackground} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading {loadingUrl}...
            </Text>
          </View>
        </View>
      </Modal>

      {/* Floating Theme Toggle Button */}
      <TouchableOpacity
        style={[
          styles.floatingThemeButton,
          { backgroundColor: colors.buttonBackground }
        ]}
        onPress={toggleTheme}
      >
        <Text style={styles.themeButtonIcon}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </Text>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Website</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Website name"
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              value={newUrl}
              onChangeText={setNewUrl}
              placeholder="Website URL"
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
              placeholderTextColor={colors.textSecondary}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.buttonBackground }]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: '#f44336' }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* WebView Modal */}
      <WebViewModal
        visible={showWebView}
        url={selectedWebsite.url}
        siteName={selectedWebsite.name}
        onClose={() => setShowWebView(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    marginTop: 20,
  },
  urlItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 15,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  urlContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 17,
    fontWeight: 'normal',
    marginBottom: 3,
  },
  itemUrl: {
    fontSize: 14,
  },
  iconButton: {
    marginHorizontal: 2,
    padding: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  allActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    gap: 5,
  },
  floatingThemeButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 40,  
    height: 40, 
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 999,
  },
  themeButtonIcon: {
    fontSize: 16, // Changed from 20 to 16
  },
  loadingModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingModalContent: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: '70%',
    flexDirection: 'column',
    gap: 15,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
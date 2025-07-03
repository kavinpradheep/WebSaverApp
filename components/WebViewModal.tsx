import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';

interface WebViewModalProps {
  visible: boolean;
  url: string;
  onClose: () => void;
  siteName: string;
}

export default function WebViewModal({ visible, url, onClose, siteName }: WebViewModalProps) {
  const { colors } = useTheme();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setIsLoading(navState.loading);
  };

  // JavaScript to be injected to enable pull-to-refresh
  const INJECTED_JAVASCRIPT = `
    (function() {
      let startY = 0;
      let distance = 0;
      let refreshThreshold = 100;
      let isPulling = false;
      
      document.addEventListener('touchstart', function(e) {
        // Only enable pull-to-refresh at the top of the page
        if (window.scrollY === 0) {
          startY = e.touches[0].clientY;
          isPulling = true;
        }
      });
      
      document.addEventListener('touchmove', function(e) {
        if (!isPulling) return;
        
        distance = e.touches[0].clientY - startY;
        
        // Only process downward pulls
        if (distance > 0 && window.scrollY === 0) {
          // Prevent default to enable overscroll
          e.preventDefault();
          
          if (distance > refreshThreshold) {
            // Visual feedback could be added here
          }
        }
      });
      
      document.addEventListener('touchend', function() {
        if (isPulling && distance > refreshThreshold) {
          // Send message to React Native to reload
          window.ReactNativeWebView.postMessage('pull-to-refresh');
        }
        
        isPulling = false;
        distance = 0;
      });
    })();
  `;

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    const { data } = event.nativeEvent;
    
    if (data === 'pull-to-refresh') {
      webViewRef.current?.reload();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
        } else {
          onClose();
        }
      }}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
          <Text 
            style={[styles.titleText, { color: colors.text }]} 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {siteName}
          </Text>
          <View style={styles.placeholderRight} />
        </View>

        <View style={styles.webviewContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webview}
            onNavigationStateChange={handleNavigationStateChange}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            cacheEnabled={true}
            
            // Replace the problematic properties with these:
            injectedJavaScript={INJECTED_JAVASCRIPT}
            onMessage={handleWebViewMessage}
            bounces={true} // Enable bouncing for pull effect
          />
          
          {isLoading && (
            <View style={[styles.loadingOverlay, { backgroundColor: colors.background + '99' }]}>
              <ActivityIndicator size="large" color={colors.buttonBackground} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10, // Reduced from 15
    paddingVertical: 8, // Added to make header more compact
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleText: {
    fontSize: 16, // Reduced from 18
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4, // Reduced from 5
  },
  closeButtonText: {
    fontSize: 18, // Reduced from 20
    fontWeight: 'bold',
  },
  placeholderRight: {
    width: 24, // Reduced from 30 to match smaller close button
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { getWebviewEvents } from './_layout';
import { useFocusEffect } from 'expo-router';

interface LastOpenedWebsite {
  url: string;
  name: string;
}

export default function WebViewScreen() {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [lastWebsite, setLastWebsite] = useState<LastOpenedWebsite | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const webviewEvents = getWebviewEvents();

  // Enhanced JavaScript for gesture support with robust error handling
  const INJECTED_JAVASCRIPT = `
    (function() {
      // Variables for pull-to-refresh
      let startY = 0;
      let startX = 0;
      let distanceY = 0;
      let distanceX = 0;
      let refreshThreshold = 100;
      let isTracking = false;
      let lastTimestamp = 0;
      
      try {
        // Touch start - track initial position
        document.addEventListener('touchstart', function(e) {
          try {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
            isTracking = true;
            lastTimestamp = Date.now();
          } catch(err) {
            console.error('Error in touchstart handler:', err);
          }
        }, { passive: false });
        
        // Touch move - calculate distance and detect gesture direction
        document.addEventListener('touchmove', function(e) {
          try {
            if (!isTracking) return;
            
            distanceY = e.touches[0].clientY - startY;
            distanceX = e.touches[0].clientX - startX;
            
            // Handle pull-to-refresh when at top of page
            if (window.scrollY <= 5 && distanceY > 50 && Math.abs(distanceY) > Math.abs(distanceX)) {
              e.preventDefault();
            }
            
            // Handle horizontal swipes for back/forward
            if (Math.abs(distanceX) > 50 && Math.abs(distanceX) > Math.abs(distanceY)) {
              // Prevent default to avoid page scrolling horizontally
              e.preventDefault();
            }
          } catch(err) {
            console.error('Error in touchmove handler:', err);
          }
        }, { passive: false });
        
        // Touch end - process the gesture
        document.addEventListener('touchend', function(e) {
          try {
            if (!isTracking) return;
            
            const timeDiff = Date.now() - lastTimestamp;
            const isFastSwipe = timeDiff < 300;
            
            // Pull-to-refresh gesture
            if (window.scrollY <= 5 && distanceY > refreshThreshold && Math.abs(distanceY) > Math.abs(distanceX)) {
              window.ReactNativeWebView.postMessage('pull-to-refresh');
            }
            
            // Back gesture (swipe right)
            if (distanceX > 100 && Math.abs(distanceX) > Math.abs(distanceY) && isFastSwipe) {
              window.ReactNativeWebView.postMessage('swipe-right');
            }
            
            // Forward gesture (swipe left)
            if (distanceX < -100 && Math.abs(distanceX) > Math.abs(distanceY) && isFastSwipe) {
              window.ReactNativeWebView.postMessage('swipe-left');
            }
            
            // Reset tracking
            isTracking = false;
            distanceY = 0;
            distanceX = 0;
          } catch(err) {
            console.error('Error in touchend handler:', err);
          }
        }, { passive: false });
        
        // Add CSS to improve gesture feel
        const style = document.createElement('style');
        style.textContent = \`
          body {
            overscroll-behavior-y: contain;
            overscroll-behavior-x: none;
            -webkit-overflow-scrolling: touch;
          }
        \`;
        document.head.appendChild(style);
        
      } catch(err) {
        console.error('Error setting up gesture handlers:', err);
      }
    })();
  `;

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    const { data } = event.nativeEvent;
    
    switch (data) {
      case 'pull-to-refresh':
        webViewRef.current?.reload();
        break;
      case 'swipe-right':
        if (canGoBack) {
          webViewRef.current?.goBack();
        }
        break;
      case 'swipe-left':
        if (canGoForward) {
          webViewRef.current?.goForward();
        }
        break;
      default:
        console.log('Unknown message from WebView:', data);
    }
  };

  // Override back button behavior for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        } else if (lastWebsite) {
          // Go to home screen instead of exiting
          return false;
        }
        return false;
      });
      
      return () => backHandler.remove();
    }
  }, [canGoBack, lastWebsite]);

  // Function to load the last opened website from AsyncStorage
  const loadLastWebsite = async () => {
    try {
      setIsLoading(true);
      setInitialLoadComplete(false);
      const savedData = await AsyncStorage.getItem('lastOpenedWebsite');
      console.log('Last website data from AsyncStorage:', savedData);
      
      if (savedData) {
        const data = JSON.parse(savedData) as LastOpenedWebsite;
        console.log('Parsed website data:', data);
        setLastWebsite(data);
      } else {
        console.log('No last website data found');
      }
    } catch (error) {
      console.error('Error loading last website:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle navigation state changes
  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setPageLoading(navState.loading);
  };

  // Load data when component mounts and set up event listeners
  useEffect(() => {
    loadLastWebsite();
    
    // Set up event listeners
    const backHandler = () => webViewRef.current?.goBack();
    const reloadHandler = () => webViewRef.current?.reload();
    const forwardHandler = () => webViewRef.current?.goForward();
    
    webviewEvents.on('refresh', loadLastWebsite);
    webviewEvents.on('goBack', backHandler);
    webviewEvents.on('reload', reloadHandler);
    webviewEvents.on('goForward', forwardHandler);
    
    return () => {
      webviewEvents.off('refresh', loadLastWebsite);
      webviewEvents.off('goBack', backHandler);
      webviewEvents.off('reload', reloadHandler);
      webviewEvents.off('goForward', forwardHandler);
    };
  }, []);

  // Reload data whenever tab gains focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('WebView tab focused, reloading data');
      loadLastWebsite();
      return () => {};
    }, [])
  );

  // Simplify the rendering logic to avoid conditional rendering errors
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text 
          style={[styles.titleText, { color: colors.text }]} 
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {lastWebsite?.name || 'No website'}
        </Text>
      </View>

      {/* Top loading indicator */}
      {pageLoading && (
        <View style={[styles.topLoadingBar, { backgroundColor: colors.card }]}>
          <ActivityIndicator size="small" color={colors.buttonBackground} />
        </View>
      )}

      <View style={styles.webviewContainer}>
        {/* Initial loading state */}
        {isLoading && (
          <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.buttonBackground} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
          </View>
        )}

        {/* No website found state */}
        {!isLoading && (!lastWebsite || !lastWebsite.url) && (
          <View style={[styles.noWebsiteContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.noWebsiteText, { color: colors.text }]}>
              No website opened yet. Please select a website from the home screen.
            </Text>
          </View>
        )}

        {/* WebView - only render when we have a website and initial loading is done */}
        {!isLoading && lastWebsite && lastWebsite.url && (
          <WebView
            ref={webViewRef}
            source={{ uri: lastWebsite.url }}
            style={styles.webview}
            onNavigationStateChange={handleNavigationStateChange}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            cacheEnabled={true}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            onMessage={handleWebViewMessage}
            bounces={true}
            originWhitelist={['*']}
            onLoadEnd={() => {
              setInitialLoadComplete(true);
            }}
            onError={(syntheticEvent) => {
              console.error('WebView error:', syntheticEvent.nativeEvent);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  noWebsiteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noWebsiteText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholderRight: {
    width: 24,
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
  topLoadingBar: {
    height: 3,
    width: '100%',
    position: 'absolute',
    top: Platform.OS === 'android' ? 25 + 8 + 16 : 8 + 16, // Adjusted for header height + padding + safe area
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
});
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, TouchableOpacity, Text, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventEmitter } from 'events';

import { useTheme } from '../../context/ThemeContext';

// EventEmitter to control Webview
const webviewEvents = new EventEmitter();

export function getWebviewEvents() {
  return webviewEvents;
}

// Custom TabBar
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors, theme } = useTheme();
  
  // Use theme colors instead of hardcoded values
  const activeColor = colors.primary;  
  const inactiveColor = colors.textSecondary;

  return (
    <View style={[styles.tabBarContainer, { 
      backgroundColor: colors.card,
      borderColor: colors.border
    }]}>
      {/* Home Button */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.navigate('index')}
      >
        <Ionicons 
          name="home" 
          size={28} 
          color={state.index === 0 ? activeColor : inactiveColor}
        />
      </TouchableOpacity>

      {/* Navigation buttons removed */}

      {/* WebView Button */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.navigate('webview')}
      >
        <Ionicons 
          name="globe" 
          size={28} 
          color={state.index === 1 ? activeColor : inactiveColor}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const { theme, colors } = useTheme();
  
  // Set status bar style based on theme
  const statusBarStyle = theme === 'dark' ? 'light-content' : 'dark-content';
  
  return (
    <>
      <StatusBar barStyle={statusBarStyle} backgroundColor={colors.background} />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: Platform.select({
            ios: { position: 'absolute' },
            default: {},
          }),
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="webview" />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 60,
    alignItems: 'center',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    flex: 1,
  },
  // Keep these styles in case they're referenced elsewhere
  navButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

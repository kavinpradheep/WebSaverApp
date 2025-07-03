// TabBarBackground.js
import React from 'react';
import { View, StyleSheet } from 'react-native';

const TabBarBackground = () => {
  return <View style={styles.background} />;
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f0f0', // Set a background color for the tab bar
    zIndex: -1, // Ensure this stays behind the tab bar elements
  },
});

export default TabBarBackground;

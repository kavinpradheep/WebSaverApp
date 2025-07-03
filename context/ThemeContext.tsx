import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';

// Define theme types
export type ThemeType = 'light' | 'dark';

// Define color palettes for each theme
interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  inputBackground: string;
  buttonBackground: string;
  error: string;
  success: string;
  shadow: string;
}

// Define theme values with more consistent colors
const themes: Record<ThemeType, ThemeColors> = {
  light: {
    background: '#f4f7fc',
    card: '#ffffff',
    text: '#000000',
    textSecondary: '#666666',
    primary: '#4e73df',
    border: '#d1d1d1',
    inputBackground: '#ffffff',
    buttonBackground: '#4CAF50',
    error: '#f44336',
    success: '#4CAF50',
    shadow: '#000000',
  },
  dark: {
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    primary: '#6d8eff',
    border: '#444444',
    inputBackground: '#2a2a2a',
    buttonBackground: '#388E3C',
    error: '#f44336',
    success: '#4CAF50',
    shadow: '#ffffff',
  },
};

// Create the theme context
interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme?: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: themes.light,
});

// Create theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get device color scheme
  const deviceTheme = useColorScheme() as ThemeType || 'light';
  const [theme, setTheme] = useState<ThemeType>(deviceTheme);
  
  // Update theme when device theme changes
  useEffect(() => {
    setTheme(deviceTheme);
  }, [deviceTheme]);

  // Function to manually toggle theme (could be used for a theme toggle button)
  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };

  const colors = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = () => useContext(ThemeContext);

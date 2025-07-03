# Website Saver App

A cross-platform mobile application built with **React Native** and **Expo Router** that allows users to save and organize websites offline. The app features a custom tab layout, theme support, and WebView integration.

## Features

- **Custom Tab Bar**: Navigate between screens with a visually appealing tab bar.
- **Theme Support**: Light and dark themes powered by a custom `ThemeContext`.
- **WebView Integration**: View and interact with websites directly within the app.
- **Cross-Platform**: Works seamlessly on both Android and iOS.

## Screens

1. **Home Screen**: Main landing page for the app.
2. **WebView Screen**: Allows users to interact with websites.

## Technologies Used

- **React Native**: Framework for building cross-platform mobile apps.
- **Expo Router**: File-based routing for React Native apps.
- **EventEmitter**: Used for managing WebView events.
- **Ionicons**: Icon library for React Native.
- **ThemeContext**: Custom context for managing light/dark themes.

## Folder Structure

```
WebsiteSaverApp/
├── app/
│   ├── (tabs)/_layout.tsx   # Custom tab layout
│   ├── index.tsx            # Home screen
│   ├── webview.tsx          # WebView screen
├── context/
│   ├── ThemeContext.tsx     # Theme management
├── assets/                  # App assets (icons, images, etc.)
├── styles/                  # Shared styles
├── package.json             # Project dependencies
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kavinpradheep/WebSaverApp.git
   cd WebsiteSaverApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Running on Devices

- **iOS**: Use the Expo Go app or Xcode simulator.
- **Android**: Use the Expo Go app or Android emulator.

## PWA Support

This app can also function as a Progressive Web App (PWA). To enable PWA functionality:
1. Add the `manifest.json` file to the project.
2. Register the `serviceWorker.js` file.

## Screenshots

| Home Screen | WebView Screen |
|-------------|----------------|
| ![Home](assets/screenshots/home.png) | ![WebView](assets/screenshots/webview.png) |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Contact

For questions or feedback, reach out to [kavinpradheep](https://github.com/kavinpradheep).

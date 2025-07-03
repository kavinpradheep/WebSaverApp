# 🌐 Website Saver App

A cross-platform mobile application built using **React Native** and **Expo Router** that enables users to **save, organize, and view websites offline**. With a sleek custom tab layout, theme switching, and integrated WebView, the app delivers a smooth, intuitive experience on both Android and iOS devices.

---

## 🚀 Features

* 🎨 **Custom Tab Bar** – Visually enhanced bottom navigation
* 🌗 **Theme Support** – Light and dark modes powered by `ThemeContext`
* 🌐 **WebView Integration** – View websites directly within the app
* 📱 **Cross-Platform** – Works seamlessly on Android and iOS
* 💡 **PWA Support** – Optional support for Progressive Web Apps

---

## 📲 Download the App

Scan the QR code below to download the APK and install the app on your Android device:

<p align="center">
  <img src="assets/images/websitesaver-apk-qr.png" alt="Website Saver App QR Code" width="200" />
  <br />
  <sub><i>Scan to download the APK</i></sub><br/>
  <a href="https://drive.google.com/file/d/1MBGkvNorvmwGn2k9A0txTO21TN2fbV-E/view?usp=sharing" target="_blank">📥 Direct APK Download</a>
</p>

> ⚠️ *Ensure “Install from unknown sources” is enabled on your Android device.*

---

## 🖼️ Screens

1. **Home Screen** – Landing page showing saved websites
2. **WebView Screen** – In-app browser to view content

---

## 🧰 Tech Stack

* **React Native** – Cross-platform app framework
* **Expo Router** – File-based routing solution
* **Ionicons** – Icon support for modern UIs
* **ThemeContext** – Handles light/dark theme switching
* **EventEmitter** – Manages communication for WebView events

---

## 📁 Project Structure

```
WebsiteSaverApp/
├── app/
│   ├── (tabs)/_layout.tsx      # Custom tab layout
│   ├── index.tsx               # Home screen
│   ├── webview.tsx             # WebView screen
├── context/
│   └── ThemeContext.tsx        # Theme management
├── assets/                     # Icons, QR code, etc.
├── styles/                     # Shared styling
├── package.json                # Dependencies
```

---

## 🌐 PWA Support (Optional)

To enable as a Progressive Web App:

1. Add a valid `manifest.json`
2. Register `serviceWorker.js` correctly in the entry point

---

## 🤝 Contributing

Contributions are welcome!
Feel free to open an issue or submit a pull request for improvements or fixes.

---

## 📜 License

Licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

For any feedback or collaboration:
**[kavinpradheep](https://github.com/kavinpradheep)**

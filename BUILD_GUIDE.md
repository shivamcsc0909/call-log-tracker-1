# CallTrack Pro Mobile Build Guide

This guide describes how to install dependencies, run the application locally, and build the Android APK of CallTrack Pro.

---

## 1. Prerequisites

To build and run CallTrack Pro locally, ensure the following are installed:

- **Node.js**: Version 18 or higher (Node 24 is used in this environment)
- **pnpm**: Version 10 or higher
- **Java Development Kit (JDK)**: JDK 17 (recommended for Expo SDK 54 compatibility)
- **Android SDK**: Correctly configured with command line tools, platform-tools, and platforms (Android API level 35).
- **Environment variables**: Ensure `ANDROID_HOME` points to your Android SDK directory.
  ```bash
  export ANDROID_HOME=$HOME/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```

---

## 2. Installation

From the monorepo workspace root:

```bash
# Install all monorepo dependencies
pnpm install
```

---

## 3. Running Locally

To run the application inside Expo Go or a development build:

```bash
# Navigate to the mobile app directory
cd artifacts/call-tracker

# Start the Expo development server
npx expo start
```

Use `a` to run on an Android emulator or scan the QR code with the **Expo Go** app on your physical device.

---

## 4. Generating APK (Local Build Workflow)

If you have a local Android development environment setup, you can build the APK directly on your machine without requiring an EAS cloud account.

### Step 4.1: Prebuild the Android project
Prebuilding generates the native `android` folder based on the Expo configuration in `app.json`:

```bash
cd artifacts/call-tracker
npx expo prebuild --platform android --no-install
```

### Step 4.2: Build the Debug APK
The debug build is pre-signed with a debug key and can be installed directly onto any Android device:

```bash
cd android
./gradlew assembleDebug
```

- **Output APK location:**
  `artifacts/call-tracker/android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4.3: Build the Release APK
To generate the production APK:

```bash
cd android
./gradlew assembleRelease
```

- **Output APK location:**
  `artifacts/call-tracker/android/app/build/outputs/apk/release/app-release-unsigned.apk`

*Note: The release APK generated locally by default is unsigned. It must be signed using a keystore (`apksigner`) before installing on physical devices.*

---

## 5. Generating APK (Expo Application Services - EAS Cloud Build)

If you prefer to build the APK in the cloud and get a signed preview APK, use EAS Build.

### Step 5.1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 5.2: Configure EAS build (First-time setup)
```bash
cd artifacts/call-tracker
eas build:configure
```
Ensure you choose `apk` as the build output format for your preview profile in the generated `eas.json` file.

### Step 5.3: Run the Cloud Build
```bash
eas build -p android --profile preview
```

EAS will build the project and output a QR code/URL where you can download the signed `.apk` file directly to any Android device.

---

## 6. Troubleshooting

### Gradle Build Fails with Java Version Mismatch
Ensure your Java version is JDK 17:
```bash
java -version
```
If you have multiple versions, set `JAVA_HOME` explicitly to JDK 17 before building:
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

### Clean Metro Cache
If Expo start fails with caching issues:
```bash
npx expo start --clear
```

### Clean Gradle Project
If a previous local gradle build failed or left intermediate artifacts:
```bash
cd artifacts/call-tracker/android
./gradlew clean
```

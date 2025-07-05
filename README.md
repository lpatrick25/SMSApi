# SMS API - Ionic/Angular Mobile App

## Overview
This project is a mobile application built with [Ionic Framework](https://ionicframework.com/) and Angular. It is designed to interact with an SMS API, allowing users to send, receive, and manage SMS messages from a mobile device. The app supports authentication, network connectivity checks, and provides a user-friendly interface for managing pending and sent messages.

## Features
- **User Authentication**: Secure login/logout with token management.
- **Pending SMS Management**: View and process pending SMS requests from the server.
- **Sent Messages**: View history of sent messages, grouped by recipient.
- **Network Connectivity**: Real-time network status monitoring and server pinging.
- **API URL Customization**: Set a custom API endpoint via the settings modal.
- **Permissions Handling**: Requests necessary Android permissions for SMS and network access.
- **Responsive UI**: Built with Ionic components and Angular Material for a modern look.

## Project Structure
- `src/app/` - Main application source code
  - `services/` - Core services (authentication, SMS, connectivity)
  - `home/` - Home page for pending SMS
  - `sent-messages/` - Sent messages page
  - `login/` - Login page
  - `loading/` - Initial loading and connectivity check
  - `settings-modal/` - Modal for settings and logout
  - `api-url-modal/` - Modal for setting custom API URL
  - `guards/` - Route guards (e.g., authentication)
  - `pipes/` - Custom pipes (e.g., text truncation)
- `android/` - Android platform-specific files
- `www/` - Built web assets for deployment

## Getting Started
### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Ionic CLI](https://ionicframework.com/docs/cli) (`npm install -g @ionic/cli`)
- [Android Studio](https://developer.android.com/studio) (for Android builds)

### Installation
1. **Clone the Repository or Use Project Zip File**  
   You can either clone the repository from GitHub or use the attached project zip file (`SMSApi.zip`) to set up the project.

   #### Option 1: Clone the Repository
   Clone the repository using either SSH or HTTPS:
   ```sh
   # Using SSH
   git clone git@github.com:lpatrick25/SMSApi.git
   # Or using HTTPS
   git clone https://github.com/lpatrick25/SMSApi.git
   cd SMSApi
   ```

   #### Option 2: Use the Attached Project Zip File
   If you have the project zip file (`SMSApi.zip`), extract it to your desired directory:
   ```sh
   unzip SMSApi.zip
   cd SMSApi
   ```

   **Explanation**: Cloning the repository directly from GitHub ensures you have the latest version of the project and allows for easy updates using Git. Alternatively, the attached zip file provides a snapshot of the project, which is useful if you prefer working offline or do not have Git installed. Both methods provide the same project files, so choose the one that best suits your workflow.

2. Install dependencies:
   ```sh
   npm install
   ```
3. Add Android platform (if not already added):
   ```sh
   ionic cap add android
   ```
4. Build the project:
   ```sh
   npm run build
   ```
5. Sync with Capacitor:
   ```sh
   ionic cap sync
   ```
6. Open in Android Studio:
   ```sh
   ionic cap open android
   ```

### Running the App
- **In Browser (for UI testing):**
  ```sh
  ionic serve
  ```
- **On Android Device:**
  1. Connect your device via USB (enable USB debugging).
  2. Run:
     ```sh
     ionic cap run android -l --external
     ```

## Usage
- **Login**: Enter your credentials to access the app.
- **Pending**: View and process SMS requests fetched from the server.
- **Sent**: View sent messages grouped by recipient.
- **Settings**: Access via the settings icon to set a custom API URL or logout.
- **Network**: The app checks for network connectivity and notifies you if offline.

## Configuration
- **API URL**: Default is set in `src/environments/environment.ts`. Can be overridden in the app via the settings modal.
- **Android Permissions**: The app requests SMS and network permissions at runtime.

## Dependencies
- Angular 19+
- Ionic Angular 8+
- Capacitor 3+/7+
- Cordova Plugins: SMS, Android Permissions, Network Information
- Angular Material, CoreUI, Bootstrap

## Security
- Tokens are securely stored using Capacitor Storage.
- API requests require authentication.

## Troubleshooting
- **Build Issues**: Ensure all dependencies are installed and Android Studio is set up.
- **Permissions**: Grant all requested permissions on your device.
- **API Errors**: Check your API URL and network connection.

## License
This project is for educational and demonstration purposes. The Ionic Framework used in this project is licensed under the [MIT License](https://github.com/ionic-team/ionic-framework/blob/main/LICENSE). For full details, please refer to the Ionic Framework repository.

---

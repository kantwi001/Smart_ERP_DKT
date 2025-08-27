import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smarterpsoftware.app',
  appName: 'SmartERPSoftware',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      'http://192.168.2.185:2025',
      'https://192.168.2.185:2025',
      'http://localhost:2025',
      'https://localhost:2025',
      'http://localhost:2026',
      'https://localhost:2026',
      'http://10.0.2.2:2025',
      'https://10.0.2.2:2025'
    ],
    hostname: 'localhost',
    iosScheme: 'capacitor'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#FF9800',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#FF9800',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    App: {
      appendUserAgent: 'SmartERP/2.0',
      iosScheme: 'https'
    },
    Device: {
      enabled: true
    },
    Network: {
      enabled: true
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      keystorePassword: undefined,
      releaseType: 'APK',
      signingType: 'apksigner'
    },
    webContentsDebuggingEnabled: false,
    allowMixedContent: true
  },
  ios: {
    scheme: 'SmartERPSoftware',
    contentInset: 'automatic',
    webContentsDebuggingEnabled: false
  }
};

export default config;

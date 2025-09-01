const config = {
  appId: 'com.smarterpsoftware.app',
  appName: 'SmartERPSoftware',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: [
      'https://backend-shy-sun-4450.fly.dev',
      'https://backend-shy-sun-4450.fly.dev/*',
      'backend-shy-sun-4450.fly.dev',
      'backend-shy-sun-4450.fly.dev/*',
      '*.fly.dev',
      'https://*.fly.dev'
    ],
    cleartext: false
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#2196F3",
      showSpinner: false
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff'
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

module.exports = config;

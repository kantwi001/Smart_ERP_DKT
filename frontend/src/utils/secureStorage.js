let Capacitor, Preferences;

try {
  const capacitorCore = require('@capacitor/core');
  const capacitorPreferences = require('@capacitor/preferences');
  Capacitor = capacitorCore.Capacitor;
  Preferences = capacitorPreferences.Preferences;
} catch (error) {
  // Fallback when Capacitor packages aren't installed
  console.warn('Capacitor packages not available, falling back to web-only mode');
  Capacitor = { isNativePlatform: () => false };
  Preferences = null;
}

class SecureStorage {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  async setItem(key, value) {
    if (this.isNative && Preferences) {
      await Preferences.set({
        key,
        value: JSON.stringify(value)
      });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  async getItem(key) {
    if (this.isNative && Preferences) {
      const result = await Preferences.get({ key });
      if (!result.value || result.value === 'undefined' || result.value === 'null') {
        return null;
      }
      try {
        return JSON.parse(result.value);
      } catch (error) {
        console.warn(`Failed to parse stored value for key ${key}:`, error);
        return null;
      }
    } else {
      const item = localStorage.getItem(key);
      if (!item || item === 'undefined' || item === 'null') {
        return null;
      }
      try {
        return JSON.parse(item);
      } catch (error) {
        console.warn(`Failed to parse stored value for key ${key}:`, error);
        return null;
      }
    }
  }

  async removeItem(key) {
    if (this.isNative && Preferences) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }

  async clear() {
    if (this.isNative && Preferences) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  }

  // Authentication specific methods
  async setAuthToken(token) {
    await this.setItem('auth_token', token);
  }

  async getAuthToken() {
    return await this.getItem('auth_token');
  }

  async removeAuthToken() {
    await this.removeItem('auth_token');
  }

  async setUserData(userData) {
    await this.setItem('user_data', userData);
  }

  async getUserData() {
    return await this.getItem('user_data');
  }

  async removeUserData() {
    await this.removeItem('user_data');
  }

  async setRememberLogin(remember) {
    await this.setItem('remember_login', remember);
  }

  async getRememberLogin() {
    const remember = await this.getItem('remember_login');
    return remember !== null ? remember : true; // Default to true for mobile
  }

  async clearAuthData() {
    await this.removeAuthToken();
    await this.removeUserData();
    await this.removeItem('remember_login');
  }
}

export default new SecureStorage();

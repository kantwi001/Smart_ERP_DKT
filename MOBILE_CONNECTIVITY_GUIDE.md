# Mobile App Backend Connectivity Guide

## 🔧 Backend Connectivity Solutions

The mobile app now automatically detects the environment and uses the appropriate backend URL:

### 📱 **Automatic URL Detection:**
- **Web Browser**: `http://localhost:2025/api`
- **Android Emulator**: `http://10.0.2.2:2025/api`
- **iOS Simulator**: `http://localhost:2025/api`
- **Physical Devices**: Requires your computer's IP address

## 🛠️ **Setup Instructions:**

### **1. For Android Emulator Testing:**
✅ **Already Fixed**: The app now automatically uses `10.0.2.2:2025` for Android emulators.

### **2. For Physical Device Testing:**
You'll need to update the API configuration with your computer's IP address:

#### **Find Your Computer's IP Address:**
```bash
# On macOS/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# On Windows:
ipconfig | findstr "IPv4"
```

#### **Update API Configuration for Physical Devices:**
Edit `frontend/src/api.js` and replace the Android section:
```javascript
if (platform === 'android') {
  // For physical devices, use your computer's IP address
  return 'http://YOUR_COMPUTER_IP:2025/api';  // e.g., 'http://192.168.1.100:2025/api'
}
```

### **3. Backend Server Configuration:**
Make sure your Django backend allows connections from mobile devices:

#### **Update Django Settings:**
In `backend/erp_system/settings.py`:
```python
# Allow connections from mobile devices
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '10.0.2.2',        # Android emulator
    'YOUR_COMPUTER_IP', # Your actual IP for physical devices
]

# CORS settings for mobile
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:2025",
    "http://10.0.2.2:2025",
    "capacitor://localhost",
    "https://localhost",
]
```

## 🧪 **Testing Connectivity:**

### **1. Start Backend Server:**
```bash
cd backend
python manage.py runserver 0.0.0.0:2025
```
**Note**: Using `0.0.0.0:2025` allows connections from any IP address.

### **2. Test Mobile App:**
```bash
# Rebuild mobile app with connectivity fix
cd frontend
npm run build
npx cap sync android

# Open in Android Studio and run
npx cap open android
```

### **3. Verify Connection:**
- Check browser console in mobile app for API base URL log
- Test login functionality
- Verify data loading in dashboards

## 🔍 **Troubleshooting:**

### **Connection Refused Errors:**
1. **Backend not accessible**: Make sure backend runs on `0.0.0.0:2025`
2. **Wrong IP address**: Verify your computer's IP address
3. **Firewall blocking**: Check firewall settings
4. **Network issues**: Ensure mobile device and computer are on same network

### **CORS Errors:**
1. **Update CORS settings** in Django settings.py
2. **Add mobile origins** to CORS_ALLOWED_ORIGINS
3. **Restart backend server** after changes

### **Authentication Issues:**
1. **Token storage**: Mobile apps use secure storage
2. **Token format**: Ensure Bearer token format is correct
3. **Token expiry**: Check if tokens are expiring

## 📱 **Platform-Specific Notes:**

### **Android Emulator:**
- ✅ Uses `10.0.2.2` to reach host machine
- ✅ Automatically configured
- ✅ No additional setup needed

### **iOS Simulator:**
- ✅ Uses `localhost` like web browsers
- ✅ Automatically configured
- ✅ No additional setup needed

### **Physical Android Device:**
- ❗ Requires computer's IP address
- ❗ Both devices must be on same WiFi network
- ❗ Backend must run on `0.0.0.0:2025`

### **Physical iOS Device:**
- ❗ Requires computer's IP address
- ❗ Both devices must be on same WiFi network
- ❗ May require HTTPS for production builds

## 🚀 **Quick Fix Commands:**

```bash
# 1. Update mobile app with connectivity fix
cd frontend
npm run build
npx cap sync android

# 2. Start backend with network access
cd ../backend
python manage.py runserver 0.0.0.0:2025

# 3. Test in Android Studio
cd ../frontend
npx cap open android
```

## ✅ **Verification Checklist:**

- [ ] Backend running on `0.0.0.0:2025`
- [ ] Mobile app rebuilt with connectivity fix
- [ ] CORS settings updated in Django
- [ ] ALLOWED_HOSTS updated in Django
- [ ] Mobile app shows correct API base URL in console
- [ ] Login works in mobile app
- [ ] Dashboard data loads properly
- [ ] All ERP modules accessible

The mobile app should now connect properly to the backend server! 🎉

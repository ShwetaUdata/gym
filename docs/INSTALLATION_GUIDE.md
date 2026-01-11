# PowerFit Gym - Complete Installation Guide

## Overview

PowerFit can be installed on ANY device:

| Device | Installation Method | Backend Location |
|--------|---------------------|------------------|
| **Windows/Mac/Linux Desktop** | Electron App (.exe/.dmg/.AppImage) | Runs locally on your computer |
| **iPad/Tablet** | PWA (Install from browser) | Connects to Railway server |
| **Mobile Phone** | PWA (Install from browser) | Connects to Railway server |

---

## 🖥️ Option 1: Desktop Application (Windows/Mac/Linux)

### Prerequisites
- **Node.js 18-20** (NOT Node.js 24+) - Download from https://nodejs.org/
- Git installed

> ⚠️ **IMPORTANT**: Use Node.js 18 LTS or 20 LTS. Node.js 24+ has compatibility issues with native modules.

### Step-by-Step Installation

#### 1. Download the Project
Download the ZIP file from Lovable and extract it to a folder like `C:\PowerFit` or `~/PowerFit`

#### 2. Install Frontend Dependencies
```bash
cd powerfit-gym
npm install
```

#### 3. Build the Frontend
```bash
npm run build
```

#### 4. Setup Electron
```bash
cd electron
npm install
```

> The `server.js` file is already included in the electron folder - no copying needed!

#### 5. Run in Development
```bash
npm start
```

#### 6. Build Installer

**For Windows:**
```bash
npm run build:win
```
Output: `electron/release/PowerFit Gym Setup.exe`

**For Mac:**
```bash
npm run build:mac
```
Output: `electron/release/PowerFit Gym.dmg`

**For Linux:**
```bash
npm run build:linux
```
Output: `electron/release/PowerFit Gym.AppImage`

### First Launch

1. **Enter Secret Key**: Default is `POWERFIT2024` (change in `electron/main.js`)
2. **Select Photos Path**: Choose where to save client photos
3. **Select Database Path**: Choose where to store the database
4. **Click "Save & Start"**: Application launches!

### Default Photo Paths by OS

| OS | Default Photo Path |
|----|-------------------|
| Windows | `C:\Users\<user>\AppData\Roaming\PowerFit\Photos` |
| Mac | `~/Library/Application Support/PowerFit/Photos` |
| Linux | `~/.local/share/PowerFit/Photos` |

---

## 📱 Option 2: Mobile/Tablet PWA Installation

### For iPad/iPhone (Safari)

1. Open Safari and go to your app URL:
   ```
   https://4b279345-0e10-4bb8-bd1c-7e5635bb99a1.lovableproject.com
   ```

2. Tap the **Share** button (square with arrow)

3. Scroll down and tap **"Add to Home Screen"**

4. Name it "PowerFit" and tap **Add**

5. The app icon appears on your home screen!

### For Android (Chrome)

1. Open Chrome and go to your app URL

2. Tap the **three-dot menu** (⋮)

3. Tap **"Add to Home Screen"** or **"Install App"**

4. Confirm installation

5. App appears on your home screen!

### Important Notes for Mobile/Tablet

- Photos are stored on the **Railway server**, not locally
- Requires internet connection to sync data
- Data is shared across all devices using the PWA

---

## 🔧 Configuration Options

### Changing the Secret Key

Edit `electron/main.js`:
```javascript
const VALID_SECRET_KEY = 'YOUR_NEW_SECRET_KEY';
```

### Backend Server URL (for PWA)

The PWA connects to:
```
https://work-backend-production-be8c.up.railway.app
```

To change, edit `src/config/api.ts`

---

## 📁 Photo Storage Locations

### Desktop (Electron)
Photos are stored locally in the folder you select during setup.
Recommended paths:
- **Windows**: `D:\GymPhotos` or `C:\GymPhotos`
- **Mac**: `~/Documents/GymPhotos`
- **Linux**: `~/GymPhotos`

### Mobile/Tablet (PWA)
Photos are uploaded to the Railway backend server:
- Path: Server's file system (not accessible directly)
- Backup recommended via database export

---

## 🚀 Quick Start Commands

### Development
```bash
# Frontend development
npm run dev

# Electron development
cd electron && npm start
```

### Production Build
```bash
# Build frontend
npm run build

# Build Electron installers
cd electron
npm run build:win    # Windows
npm run build:mac    # Mac
npm run build:linux  # Linux
npm run build:all    # All platforms
```

---

## 🔒 Security Notes

1. **Secret Key**: Change the default key before distribution
2. **Database**: SQLite file contains all client data - back up regularly
3. **Photos**: Store in a backed-up location
4. **Railway Backend**: Consider enabling authentication for production

---

## 🛠️ Troubleshooting

### "Cannot find module" error
```bash
cd electron
npm install
```

### Photos not saving
- Check the selected folder has write permissions
- Ensure the folder exists

### Database errors
- Check the database path is writable
- Ensure parent folder exists

### PWA not installing
- Use HTTPS URL (required for PWA)
- Clear browser cache and try again
- Check manifest.json is accessible

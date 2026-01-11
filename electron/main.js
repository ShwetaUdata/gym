const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Backend server
let server = null;
let mainWindow = null;

// Get app data path for storing config and photos
const getAppDataPath = () => {
  const appData = app.getPath('userData');
  return path.join(appData, 'PowerFit');
};

// Get photos path based on OS
const getDefaultPhotosPath = () => {
  const platform = process.platform;
  const appDataPath = getAppDataPath();
  
  if (platform === 'win32') {
    return path.join(appDataPath, 'Photos');
  } else if (platform === 'darwin') {
    return path.join(app.getPath('home'), 'Library', 'Application Support', 'PowerFit', 'Photos');
  } else {
    return path.join(app.getPath('home'), '.local', 'share', 'PowerFit', 'Photos');
  }
};

// Config file path
const getConfigPath = () => path.join(getAppDataPath(), 'config.json');

// Load or create config
const loadConfig = () => {
  const configPath = getConfigPath();
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading config:', e);
  }
  return null;
};

// Save config
const saveConfig = (config) => {
  const configPath = getConfigPath();
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};

// Start the Express backend
const startBackend = async (photosPath, dbPath) => {
  try {
    // Set environment variables for the backend
    process.env.PHOTOS_PATH = photosPath;
    process.env.DB_PATH = dbPath;
    process.env.PORT = '5000';
    
    // Ensure directories exist
    if (!fs.existsSync(photosPath)) {
      fs.mkdirSync(photosPath, { recursive: true });
    }
    
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Import and start server
    server = require('./server.js');
    console.log('Backend started successfully');
    return true;
  } catch (error) {
    console.error('Failed to start backend:', error);
    return false;
  }
};

// Create the main window
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icons/icon-192x192.png'),
    title: 'PowerFit Gym Management',
    autoHideMenuBar: true
  });

  // Load the frontend
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Create setup window for first-time configuration
const createSetupWindow = () => {
  const setupWindow = new BrowserWindow({
    width: 500,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icons/icon-192x192.png'),
    title: 'PowerFit Setup',
    autoHideMenuBar: true
  });

  setupWindow.loadFile(path.join(__dirname, 'setup.html'));
  return setupWindow;
};

// IPC Handlers
ipcMain.handle('get-default-paths', () => {
  return {
    photosPath: getDefaultPhotosPath(),
    dbPath: path.join(getAppDataPath(), 'gym.db')
  };
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('verify-secret-key', (event, key) => {
  // You can customize this secret key
  const VALID_SECRET_KEY = 'POWERFIT2024';
  return key === VALID_SECRET_KEY;
});

ipcMain.handle('save-config-and-start', async (event, config) => {
  try {
    saveConfig(config);
    const success = await startBackend(config.photosPath, config.dbPath);
    return success;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
});

ipcMain.handle('get-config', () => {
  return loadConfig();
});

// App lifecycle
app.whenReady().then(async () => {
  const config = loadConfig();
  
  if (config && config.photosPath && config.dbPath && config.verified) {
    // Config exists, start backend and show main window
    const success = await startBackend(config.photosPath, config.dbPath);
    if (success) {
      createMainWindow();
    } else {
      // Failed to start, show setup again
      createSetupWindow();
    }
  } else {
    // First time setup
    createSetupWindow();
  }
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const config = loadConfig();
      if (config && config.verified) {
        createMainWindow();
      } else {
        createSetupWindow();
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Cleanup server if needed
  if (server && server.close) {
    server.close();
  }
});

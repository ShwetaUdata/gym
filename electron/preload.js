const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  getDefaultPaths: () => ipcRenderer.invoke('get-default-paths'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  verifySecretKey: (key) => ipcRenderer.invoke('verify-secret-key', key),
  saveConfigAndStart: (config) => ipcRenderer.invoke('save-config-and-start', config),
  getConfig: () => ipcRenderer.invoke('get-config'),
  openMainApp: () => {
    window.location.href = 'http://localhost:5000';
  }
});

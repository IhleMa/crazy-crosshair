const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("overlayAPI", {
    setOverlayImage: (callback) => ipcRenderer.on("set-overlay-image", (_event, imagePath) => callback(imagePath))
});

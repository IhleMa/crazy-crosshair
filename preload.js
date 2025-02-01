const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    saveImage: (dataUrl, filePath) => ipcRenderer.send("save-image", dataUrl, filePath),
    loadGallery: () => ipcRenderer.invoke("load-gallery"),
    deleteDrawing: (filePath) => ipcRenderer.send("delete-drawing", filePath),
    onSaveResponse: (callback) => ipcRenderer.on("save-image-response", (_event, response) => callback(response)),
    onDeleteResponse: (callback) => ipcRenderer.on("delete-image-response", (_event, response) => callback(response)),
});





window.addEventListener("DOMContentLoaded", () => {
    console.log("Electron App Loaded");
});

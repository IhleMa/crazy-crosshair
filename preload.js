const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    saveImage: (dataUrl) => ipcRenderer.send("save-image", dataUrl),
    loadGallery: () => ipcRenderer.invoke("load-gallery"),
    deleteDrawing: (filePath) => ipcRenderer.send("delete-drawing", filePath),
    onDeleteResponse: (callback) => ipcRenderer.on("delete-drawing-response", (_event, response) => callback(response)),
});




window.addEventListener("DOMContentLoaded", () => {
    console.log("Electron App Loaded");
});

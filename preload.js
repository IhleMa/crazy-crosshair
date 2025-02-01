const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    saveImage: (dataUrl) => ipcRenderer.send("save-image", dataUrl),
    onSaveResponse: (callback) => ipcRenderer.on("save-image-response", (_event, response) => callback(response))
});




window.addEventListener("DOMContentLoaded", () => {
    console.log("Electron App Loaded");
});

const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const fs = require("fs");

let overlayWindow = null;

function createWindow() {
    const win = new BrowserWindow({
        width: 600,
        height: 600,
        icon: path.join(__dirname, "assets", "icon.png"),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
        },
    });

    win.loadFile("index.html");
}



// Save image and show overlay
ipcMain.on("save-image", async (event, dataUrl) => {
    const saveFolder = path.join(app.getPath("userData"), "SavedDrawings");

    if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
    }

    const filePath = path.join(saveFolder, `drawing-${Date.now()}.png`);
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");

    fs.writeFile(filePath, base64Data, "base64", (err) => {
        if (err) {
            event.reply("save-image-response", { success: false, error: err.message });
        } else {
            event.reply("save-image-response", { success: true, path: filePath });
        }
    });
});


app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

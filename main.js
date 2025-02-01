const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

const saveFolder = path.join(app.getPath("userData"), "SavedDrawings");

app.disableHardwareAcceleration();

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
        },
    });

    win.loadFile("index.html");
}

// Ensure the save folder exists
if (!fs.existsSync(saveFolder)) {
    fs.mkdirSync(saveFolder, { recursive: true });
}

ipcMain.on("save-image", async (event, dataUrl, filePath) => {
    const saveFolder = path.join(app.getPath("userData"), "SavedDrawings");

    if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
    }

    // If editing an existing file, overwrite it
    const fileToSave = filePath ? filePath : path.join(saveFolder, `drawing-${Date.now()}.png`);
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");

    fs.writeFile(fileToSave, base64Data, "base64", (err) => {
        if (err) {
            event.reply("save-image-response", { success: false, error: err.message });
        } else {
            event.reply("save-image-response", { success: true, path: fileToSave });
        }
    });
});


// Load saved drawings on startup
ipcMain.handle("load-gallery", async () => {
    return fs.readdirSync(saveFolder)
        .filter(file => file.endsWith(".png"))
        .map(file => path.join(saveFolder, file));
});

// Delete a saved drawing
ipcMain.on("delete-drawing", (event, filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        event.reply("delete-drawing-response", { success: true, path: filePath });
    } else {
        event.reply("delete-drawing-response", { success: false, error: "File not found" });
    }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

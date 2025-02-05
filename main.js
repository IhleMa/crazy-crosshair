const { app, BrowserWindow, ipcMain, protocol } = require("electron");
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

    win.loadFile(path.join(__dirname, "index.html"));
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
        event.reply("delete-image-response", { success: true, path: filePath });
    } else {
        event.reply("delete-image-response", { success: false, error: "File not found" });
    }
});

app.whenReady().then(() => {
    protocol.registerFileProtocol("safe-file", (request, callback) => {
        const url = request.url.replace("safe-file://", "");
        callback({ path: path.normalize(url) });
    });

    createMainWindow();
});


app.whenReady().then(() => {
    protocol.registerFileProtocol("safe-file", (request, callback) => {
        const url = request.url.replace("safe-file://", "");
        callback({ path: path.normalize(url) });
    });

    createMainWindow();
});


app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});


let overlayWindow = null;

ipcMain.on("open-overlay", (event, imagePath) => {
    console.log("Received overlay request:", imagePath);

    if (overlayWindow) {
        overlayWindow.close();
    }

    overlayWindow = new BrowserWindow({
        width: 200,
        height: 200,
        alwaysOnTop: true,
        frame: false,
        transparent: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "overlay-preload.js"),
            webSecurity: false
        }
    });

    // Resolve the correct overlay path
    let overlayPath;
    if (app.isPackaged) {
        overlayPath = path.join(process.resourcesPath, "overlay.html");
    } else {
        overlayPath = path.join(__dirname, "overlay.html");
    }

    console.log("Loading overlay from:", overlayPath);

    // Use a custom protocol to load local files in production
    overlayWindow.loadURL(`file://${overlayPath}`).catch(err => {
        console.error("Failed to load overlay:", err);
    });

    overlayWindow.webContents.once("did-finish-load", () => {
        const formattedPath = `file://${imagePath.replace(/\\/g, "/")}`;
        console.log("Sending formatted image path to overlay:", formattedPath);
        overlayWindow.webContents.send("set-overlay-image", formattedPath);
    });

    overlayWindow.on("closed", () => {
        overlayWindow = null;
    });
});



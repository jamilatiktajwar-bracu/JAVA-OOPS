const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

function getWebEntry() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "web", "index.html")
    : path.join(__dirname, "../../web/index.html");
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 780, minHeight: 540,
    backgroundColor: "#080d1b", title: "Storyspace", autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile(getWebEntry());
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("mailto:")) shell.openExternal(url);
    return { action: "deny" };
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

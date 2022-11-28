const { app, BrowserWindow, ipcMain } = require("electron");
const url = require("url");
const path = require("path");

require("update-electron-app")();

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  ipcMain.handle("ping", () => "pong");
  mainWindow.loadFile("dist/dekra-test/index.html");
};

app.whenReady().then(() => {
  createWindow();
});

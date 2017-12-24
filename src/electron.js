const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
let mainWindow;

app.on('ready', () => {
    global.ffmpegpath = require('ffmpeg-static').path.replace('app.asar', 'app.asar.unpacked');
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    // initializePickerDialog();
    // open dev tools to check console.
    mainWindow.webContents.openDevTools();
});
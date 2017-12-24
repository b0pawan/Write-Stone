const {app, BrowserWindow, protocol} = require('electron');
const path = require('path');
// const rootPath = path.normalize(__dirname + '/..');
const rootPath = path.normalize(__dirname);
const protocolServe = require('electron-protocol-serve');
// Create the protocol
console.log('Root path ', rootPath);
const protocolServeName = protocolServe({ cwd : rootPath, app, protocol , name: 'serve', endpoint: ''});
protocol.registerStandardSchemes([protocolServeName], { secure: true });

let mainWindow;
app.on('ready', () => {
    global.ffmpegpath = require('ffmpeg-static').path.replace('app.asar', 'app.asar.unpacked');
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800
    });
    mainWindow.loadURL('serve://dist');
    // initializePickerDialog();
    // open dev tools to check console.
    mainWindow.webContents.openDevTools();
});
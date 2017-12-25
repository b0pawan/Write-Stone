const {app, BrowserWindow, protocol} = require('electron');
require('dotenv').config();
const path = require('path');
const url = require('url');
// const rootPath = path.normalize(__dirname + '/..');
const rootPath = path.normalize(__dirname);
require('electron-reload')(__dirname);
const protocolServe = require('electron-protocol-serve');
// Create the protocol
console.log('Root path ', rootPath);
const protocolServeName = protocolServe({ cwd : rootPath, app, protocol});
//const protocolServeName = protocolServe({ cwd : rootPath, app, protocol});
protocol.registerStandardSchemes([protocolServeName]);

let mainWindow;
app.on('ready', () => {
    // global.ffmpegpath = require('ffmpeg-static').path.replace('app.asar', 'app.asar.unpacked');
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800
    });
    if (process.env.PACKAGE === 'true'){
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
    } else {
        mainWindow.loadURL(process.env.HOST);
        mainWindow.webContents.openDevTools();
    }

    // mainWindow.loadURL(url.format());

    // initializePickerDialog();
    // open dev tools to check console.
    // mainWindow.webContents.openDevTools();
});
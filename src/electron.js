const {app, BrowserWindow, protocol, ipcMain} = require('electron');
require('dotenv').config();
const path = require('path');
const url = require('url');
// const rootPath = path.normalize(__dirname + '/..');
const rootPath = path.normalize(__dirname);
if (process.env.PACKAGE !== 'true'){
    require('electron-reload')(__dirname);
}
const protocolServe = require('electron-protocol-serve');
// Create the protocol
console.log('Root path ', rootPath);
const protocolServeName = protocolServe({ cwd : rootPath, app, protocol});
//const protocolServeName = protocolServe({ cwd : rootPath, app, protocol});
protocol.registerStandardSchemes([protocolServeName]);

let mainWindow;
let pickerDialog;
let pickerStatus;

app.on('ready', () => {
    global.ffmpegpath = require('ffmpeg-static').path.replace('app.asar', 'app.asar.unpacked');
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
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadURL(process.env.HOST);
        mainWindow.webContents.openDevTools();
    }

    ipcMain.on('show-picker', (event, options) => {
        if (pickerDialog && pickerStatus) {
            pickerDialog.show();
        } else {
            initializePickerDialog();
            pickerDialog.show();
        }
        pickerDialog.webContents.send('get-sources', options);
    });


    ipcMain.on('source-id-selected', (event, sourceId) => {
        if (pickerStatus && sourceId && sourceId != null) {
            pickerDialog.close();
            mainWindow.webContents.send('source-id-selected', sourceId);
        }
    });

});


const initializePickerDialog = () => {
    pickerDialog = new BrowserWindow({
        parent: mainWindow,
        skipTaskbar: true,
        modal: true,
        show: false,
        height: 390,
        width: 680
    });

    if (process.env.PACKAGE === 'true'){
        pickerDialog.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
        pickerDialog.webContents.openDevTools();
    } else {
        pickerDialog.loadURL(process.env.HOST);
        pickerDialog.webContents.openDevTools();
    }

    pickerDialog.on('closed', (event) => {
        console.log('electron', 'picker window close');
        pickerStatus = false;
        initializePickerDialog();
    });

    pickerDialog.on('show', (event) => {
        console.log('electron', 'picker window show ');

    });

    pickerDialog.on('hide', (event) => {
        console.log('electron', 'picker window hide ');
    });
};
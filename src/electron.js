const {app, BrowserWindow, protocol, ipcMain} = require('electron');
const {createProxyForMainProcessModule, createProxyForRemote} = require('electron-remote');
const fs = require("fs-extra");
require('dotenv').config();
const path = require('path');
const url = require('url');
// const rootPath = path.normalize(__dirname + '/..');
const rootPath = path.normalize(__dirname);
if (process.env.PACKAGE !== 'true'){
    require('electron-reload')(__dirname);
}
// Create the protocol
// console.log('Root path ', rootPath);

const fileSavePath = "C:\\Users\\Public\\Downloads\\";

let mainWindow;
let pickerDialog;
let pickerStatus;

app.on('ready', () => {
    global.ffmpegpath = require('ffmpeg-static').path.replace('app.asar', 'app.asar.unpacked');
    mainWindow = new BrowserWindow({
        height: 768,
        width: 1024,
        minHeight: 768,
        minWidth: 1024,
        closable: true
    });
    // mainWindow.setAutoHideMenuBar(true);

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

    mainWindow.webContents.on('devtools-reload-page', () => {
        console.log('devtools-reload-page');
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }))
    });


    mainWindow.on('closed', (event) => {
        console.log('electron', 'main window closed');
    });

    ipcMain.on('screen-capture', (event, options) => {
        mainWindow.webContents.send('get-screen-source', options);
    });

    ipcMain.on('show-picker', (event, options) => {
        if (pickerDialog && pickerStatus) {
        } else {
            initializePickerDialog();
        }
        setTimeout(()=> {
            pickerDialog.show();
            pickerDialog.webContents.send('get-sources', options);
        }, 1000);
    });


    ipcMain.on('send-file-buffer-to-electron', (event, path, buffer) => {
        const filePath = fileSavePath+path;
        console.log('send-file-buffer-to-electron', ' path ', filePath);
        fs.outputFile(filePath, buffer, err => {
            // console.log('error ', err);
            if (err) {
                event.sender.send('get-saved-video-file', err.message);
            }else {
                event.sender.send('get-saved-video-file', path);
            }
        });
    });

    ipcMain.on('screen-selected', (event, sourceId) => {
        console.log('screen-selected', sourceId);
        mainWindow.webContents.send('screen-selected', sourceId);
    });

    ipcMain.on('source-id-selected', (event, sourceId) => {
        console.log('source-id-selected', sourceId, ' picker status ', pickerStatus);
        if (pickerStatus && sourceId && sourceId != null) {
            pickerDialog.close();
            mainWindow.webContents.send('source-id-selected', sourceId);
            mainWindow.webContents.send('picker-closed-status', true);
        }
    });

});


app.on('window-all-closed', () => {
    console.log('electron ', 'window-all-closed ', 'app.quit()');
    app.quit();
});

const initializePickerDialog = () => {
    pickerDialog = new BrowserWindow({
        parent: mainWindow,
        skipTaskbar: true,
        modal: true,
        show: false,
        resizable: false,
        maximizable: false,
        minimizable: false,
        height: 600,
        width: 800,
        maxHeight: 600,
        maxWidth: 800,
        closable: true
    });

    // pickerDialog.setAutoHideMenuBar(true);

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
    });

    pickerDialog.on('show', (event) => {
        console.log('electron', 'picker window show ');
        pickerStatus = true;
    });

    pickerDialog.on('hide', (event) => {
        console.log('electron', 'picker window hide ');
    });
};
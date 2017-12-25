const {desktopCapturer, app, BrowserWindow, protocol, ipcMain, ipcRenderer} = require('electron');
require('dotenv').config();
const path = require('path');
const url = require('url');
// const rootPath = path.normalize(__dirname + '/..');
const rootPath = path.normalize(__dirname);
if (process.env.PACKAGE === 'true'){
    require('electron-reload')(__dirname);
}
const protocolServe = require('electron-protocol-serve');
// Create the protocol
console.log('Root path ', rootPath);
const protocolServeName = protocolServe({ cwd : rootPath, app, protocol});
//const protocolServeName = protocolServe({ cwd : rootPath, app, protocol});
protocol.registerStandardSchemes([protocolServeName]);

let mainWindow;
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
        if (this.pickerDialog && this.pickerStatus) {
            this.pickerDialog.show();
        } else {
            initializePickerDialog();
            this.pickerDialog.show();
        }
        this.pickerDialog.webContents.send('get-sources', options);
    });


    ipcMain.on('source-id-selected', (event, sourceId) => {
        if (this.pickerStatus && sourceId && sourceId != null) {
            this.pickerDialog.close();
            mainWindow.webContents.send('source-id-selected', sourceId);
        }
    });

    // mainWindow.loadURL(url.format());

    // initializePickerDialog();
    // open dev tools to check console.
    // mainWindow.webContents.openDevTools();
});


const initializePickerDialog = () => {
    this.pickerDialog = new BrowserWindow({
        parent: mainWindow,
        skipTaskbar: true,
        modal: true,
        show: false,
        height: 390,
        width: 680
    });
    this.pickerDialog.loadURL('picker');

    this.pickerDialog.on('closed', (event) => {
        this.logger.log(this.className, 'picker window close');
        this.pickerStatus = false;
        initializePickerDialog();
    });

    this.pickerDialog.on('show', (event) => {
        this.logger.log(this.className, 'picker window show ');

    });

    this.pickerDialog.on('hide', (event) => {
        this.logger.log(this.className, 'picker window hide ');
    });
};
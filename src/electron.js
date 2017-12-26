const {app, BrowserWindow, protocol, ipcMain} = require('electron');
const fs = require("fs");
const blob2Buffer = require("blob-to-buffer");
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


    ipcMain.on('save-chunk-to-disk', (event, blob) => {
        saveToDisk(blob, (err, file)=> {
            if (err) {
                mainWindow.webContents.send('save-chunk-to-disk', null);
            }else {
                mainWindow.webContents.send('save-chunk-to-disk', file);
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

const saveToDisk = (blob, callBk) => {
    blob2Buffer(blob, function (err, buffer) {
        if (err) throw err;
        const fileName = getFileName(randomIntFromInterval(10000,100000));
        const file = "./"+ fileName;
        fs.writeFile(file, buffer, (err) => {
            if (err) {
                console.error("Electron ",'Failed to save video ', err);
                callBk(err, null);
            } else {
                console.log("Electron ", 'Saved video: ', file);
                callBk(null, file);
            }
        });
    });
};

const getFileName = (random) => {
    return "Write-Stone-" + random + "-" + Date.now() + '.webm';
};

const randomIntFromInterval = (min,max) => {
    return Math.floor(Math.random()*(max-min+1)+min);
};
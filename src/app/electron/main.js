const {app, BrowserWindow, ipcMain} = require('electron');
let mainWindow;
let pickerDialog;
let picketStatus = false;
const className = 'main';
const initializePickerDialog = () => {
    pickerDialog = new BrowserWindow({
        parent: mainWindow,
        skipTaskbar: true,
        modal: true,
        show: false,
        height: 390,
        width: 680
    });
    pickerDialog.loadURL('file://' + __dirname + '/picker.html');

    pickerDialog.on('closed', (event) => {
        console.log(className,'picker window close');
        picketStatus = false;
        initializePickerDialog();
    });

    pickerDialog.on('show', (event) => {
        console.log(className,'picker window show ');

    });

    pickerDialog.on('hide', (event) => {
        console.log(className,'picker window hide ');
    });
};

app.on('ready', () => {
    global.ffmpegpath = require('ffmpeg-static').path.replace('app.asar', 'app.asar.unpacked');
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    initializePickerDialog();
    // open dev tools to check console.
    mainWindow.webContents.openDevTools();
});

ipcMain.on('show-picker', (event, options) => {
    if (pickerDialog && picketStatus) {
        pickerDialog.show();
    }else {
        initializePickerDialog();
        pickerDialog.show();
    }
    pickerDialog.webContents.send('get-sources', options);
});


ipcMain.on('source-id-selected', (event, sourceId) => {
    if (picketStatus && sourceId && sourceId != null) {
        pickerDialog.close();
        mainWindow.webContents.send('source-id-selected', sourceId);
    }
});

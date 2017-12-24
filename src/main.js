const {app, BrowserWindow, ipcMain} = require('electron');

let mainWindow;
let pickerDialog;

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
    // picker dialog reinitialize after being closed.
    pickerDialog.on('closed', (event) => {
        // console.log('picker window closed ', event);
        initializePickerDialog();
    });
});

ipcMain.on('show-picker', (event, options) => {
    pickerDialog.show();
    pickerDialog.webContents.send('get-sources', options);
});


ipcMain.on('source-id-selected', (event, sourceId) => {
    pickerDialog.close();
    mainWindow.webContents.send('source-id-selected', sourceId);
});

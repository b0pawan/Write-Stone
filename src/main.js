const {app, BrowserWindow, ipcMain} = require('electron');

let mainWindow;
let pickerDialog;

app.on('ready', () => {
  global.ffmpegpath = require('ffmpeg-static').path.replace('app.asar', 'app.asar.unpacked');

  mainWindow = new BrowserWindow({
    height: 600,
    width: 800
  });

  pickerDialog = new BrowserWindow({
    parent: mainWindow,
    skipTaskbar: true,
    modal: true,
    show: false,
    height: 390,
    width: 680
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');
  pickerDialog.loadURL('file://' + __dirname + '/picker.html');
  // open dev tools to check console.
  mainWindow.webContents.openDevTools()
});

ipcMain.on('show-picker', (event, options) => {
  pickerDialog.show();
  pickerDialog.webContents.send('get-sources', options);
});

ipcMain.on('source-id-selected', (event, sourceId) => {
  pickerDialog.hide();
  mainWindow.webContents.send('source-id-selected', sourceId);
});

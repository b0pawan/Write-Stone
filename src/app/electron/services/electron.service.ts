import {Injectable} from "@angular/core";
import {Logger} from "../../core/logger/logger";
import {app, BrowserWindow, ipcMain} from "electron";
import "rxjs/add/observable/timer";
import "rxjs/add/observable/interval";

declare var mainWindow: any;

@Injectable()
export class ElectronService {
    public mainWindow: any;
    public pickerDialog: any;
    public picketStatus: boolean;
    public className: string;

    constructor(private logger: Logger) {
        this.picketStatus = false;
        this.className = "ElectronService";
    }

    initializePickerDialog() {
        this.pickerDialog = new BrowserWindow({
            parent: mainWindow,
            skipTaskbar: true,
            modal: true,
            show: false,
            height: 390,
            width: 680
        });
        this.pickerDialog.loadURL('picker.html');

        this.pickerDialog.on('closed', (event) => {
            this.logger.log(this.className, 'picker window close');
            this.picketStatus = false;
            this.initializePickerDialog();
        });

        this.pickerDialog.on('show', (event) => {
            this.logger.log(this.className, 'picker window show ');

        });

        this.pickerDialog.on('hide', (event) => {
            this.logger.log(this.className, 'picker window hide ');
        });
    };


    init() {
        const className = 'main';

        app.on('ready', () => {
            // global.ffmpegpath = require('ffmpeg-static').path.replace('app.asar', 'app.asar.unpacked');
            mainWindow = new BrowserWindow({
                height: 600,
                width: 800
            });
            mainWindow.loadURL('index.html');
            this.initializePickerDialog();
            // open dev tools to check console.
            mainWindow.webContents.openDevTools();
        });

        ipcMain.on('show-picker', (event, options) => {
            if (this.pickerDialog && this.picketStatus) {
                this.pickerDialog.show();
            } else {
                this.initializePickerDialog();
                this.pickerDialog.show();
            }
            this.pickerDialog.webContents.send('get-sources', options);
        });


        ipcMain.on('source-id-selected', (event, sourceId) => {
            if (this.picketStatus && sourceId && sourceId != null) {
                this.pickerDialog.close();
                mainWindow.webContents.send('source-id-selected', sourceId);
            }
        });

    }
}
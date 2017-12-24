import {Injectable} from "@angular/core";
import {Logger} from "../../core/logger/logger";
import {desktopCapturer, ipcRenderer, ipcMain, BrowserWindow} from "electron";
// const {desktopCapturer, ipcRenderer, ipcMain, BrowserWindow} = require('electron');
import "rxjs/add/observable/timer";
import "rxjs/add/observable/interval";
import * as domifyImport from "domify";
import {UtilityService} from "../../core/services/utility.service";

declare var mainWindow: any;

@Injectable()
export class PickerService {

    public pickerDialog: any;
    public pickerStatus: boolean;
    public className: string;

    constructor(private logger: Logger, private utility : UtilityService) {
        this.pickerStatus = false;
        this.className = 'PickerService';
    }

    init() {
        this.utility.document.onkeydown = function (evt) {
            evt = evt || window.event;
            // Press esc key.
            if (evt.keyCode === 27) {
                ipcRenderer.send('source-id-selected', null);
            }
        };

        this.initializePickerDialog();
        ipcRenderer.on('get-sources', (event, options) => {
            desktopCapturer.getSources(options, (error, sources) => {
                if (error) throw error;
                let sourcesList = this.utility.document.querySelector('.capturer-list');
                for (let source of sources) {
                    let thumb = source.thumbnail.toDataURL();
                    if (!thumb) continue;
                    let title = source.name.slice(0, 20);
                    let item = `<li><a href="#"><img src="${thumb}"><span>${title}</span></a></li>`;
                    sourcesList.appendChild(domifyImport(item));
                }
                let links = sourcesList.querySelectorAll('a');
                for (let i = 0; i < links.length; ++i) {
                    let closure = (i) => {
                        return (e) => {
                            e.preventDefault();
                            ipcRenderer.send('source-id-selected', sources[i].id);
                            sourcesList.innerHTML = '';
                        }
                    };
                    links[i].onclick = closure(i);
                }
            })
        });

        ipcMain.on('show-picker', (event, options) => {
            if (this.pickerDialog && this.pickerStatus) {
                this.pickerDialog.show();
            } else {
                this.initializePickerDialog();
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
        this.pickerDialog.loadURL('picker');

        this.pickerDialog.on('closed', (event) => {
            this.logger.log(this.className, 'picker window close');
            this.pickerStatus = false;
            this.initializePickerDialog();
        });

        this.pickerDialog.on('show', (event) => {
            this.logger.log(this.className, 'picker window show ');

        });

        this.pickerDialog.on('hide', (event) => {
            this.logger.log(this.className, 'picker window hide ');
        });
    };
}
import {Injectable} from "@angular/core";
import {Logger} from "../../core/logger/logger";
import "rxjs/add/observable/timer";
import "rxjs/add/observable/interval";
import * as domifyImport from "domify";
import {UtilityService} from "../../core/services/utility.service";
import {ElectronService} from 'ngx-electron';
import {BrowserSupportService} from "../../core/services/browser-support.service";

@Injectable()
export class PickerService {

    public className: string;

    constructor(private logger: Logger, private utility : UtilityService, private _electronService: ElectronService, private bss: BrowserSupportService) {
        this.className = 'PickerService';
    }

    init() {
        if (this.bss.isPlatformBrowser) {
            this.utility.document.onkeydown = function (evt) {
                evt = evt || window.event;
                // Press esc key.
                if (evt.keyCode === 27) {
                    this._electronService.ipcRenderer.send('source-id-selected', null);
                }
            };

            this._electronService.ipcRenderer.on('get-sources', (event, options) => {
                this._electronService.desktopCapturer.getSources(options, (error, sources) => {
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
                                this._electronService.ipcRenderer.send('source-id-selected', sources[i].id);
                                sourcesList.innerHTML = '';
                            }
                        };
                        links[i].onclick = closure(i);
                    }
                })
            });
        }
    }
}
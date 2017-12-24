import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment";

/**
 * Logger options.
 * See {@link Logger}.
 *
 * level - How much detail you want to see in the logs, 0 being off, 1 being the less detailed, 5 being the most. Defaults to WARN.
 * global - Whether you want the created logger object to be exposed in the global scope. Defaults to false.
 * globalAs - The window's property name that will hold the logger object created. Defaults to 'fc.logger'.
 * store - Whether you want the level config to be saved in the local storage so it doesn't get lost when you refresh. Defaults to false.
 * storeAs - The local storage key that will be used to save the level config if the store setting is true. Defaults to 'fc.logger'.
 *
 * Created by Pawan.
 *
 */



class Options {
    level: LogLevel;
    global: boolean;
    globalAs: string;
    store: boolean;
    storeAs: string;
}

// For browsers that don't implement the debug method, log will be used instead. Fixes #62.
const CONSOLE_DEBUG_METHOD = console["debug"] ? "debug" : "log";

// Temporal until https://github.com/angular/angular/issues/7344 gets fixed.
const DEFAULT_OPTIONS: Options = {
    level: 4,
    global: false,
    globalAs: "fc.logger",
    store: false,
    storeAs: "fc.logger"
};
enum LogLevel { OFF = 0, ERROR = 1, WARN = 2, INFO = 3, DEBUG = 4, LOG = 5 }

@Injectable()
export class Logger {
    private _level: LogLevel;
    private _globalAs: string;
    private _store: boolean;
    private _storeAs: string;
    private options: Options;

    constructor() {
        this.options = DEFAULT_OPTIONS;
        if(environment.production){
            this._level = LogLevel.INFO;
            this.options.level = LogLevel.INFO;
        }else{
            this._level = LogLevel.DEBUG;
            this.options.level = LogLevel.DEBUG;
        }
        // Move this to the constructor definition when optional parameters are working with @Injectable: https://github.com/angular/angular/issues/7344
        let { level, global, globalAs, store, storeAs } = Object.assign( {}, this.options);
        this._level = level;
        this._globalAs = globalAs;
        this._storeAs = storeAs;
        this._store = store;
        global && this.global();
        //if ( store || this._loadLevel() ) this.store();
    }

    /*private _loadLevel = (): Level => Number(this.dataStorageService.get(this._storeAs));

    private _storeLevel(level: Level) {
        this.dataStorageService.set(this._storeAs, level);
    }*/

    error(message?: any, ...optionalParams: any[]) {
        this.isErrorEnabled() && console.error.apply( console, arguments );
    }

    warn(message?: any, ...optionalParams: any[]) {
        this.isWarnEnabled() && console.warn.apply( console, arguments );
    }

    info(message?: any, ...optionalParams: any[]) {
        this.isInfoEnabled() && console.info.apply( console, arguments );
    }

    debug(message?: any, ...optionalParams: any[]) {
        this.isDebugEnabled() && ( <any> console )[ CONSOLE_DEBUG_METHOD ].apply( console, arguments );
    }

    log(message?: any, ...optionalParams: any[]) {
        this.isLogEnabled() && console.log.apply( console, arguments );
    }

    global = () => ( <any> window )[this._globalAs] = this;

    store(): Logger {
        this._store = true;
       /* let storedLevel = this._loadLevel();
        if ( storedLevel ) { this._level = storedLevel; }
        else { this._storeLevel( this.level ); }*/
        return this;
    }

    unstore(): Logger {
        this._store = false;
        //this.dataStorageService.remove(this._storeAs);
        return this;
    }

    isErrorEnabled = (): boolean => this.level >= LogLevel.ERROR;
    isWarnEnabled = (): boolean => this.level >= LogLevel.WARN;
    isInfoEnabled = (): boolean => this.level >= LogLevel.INFO;
    isDebugEnabled = (): boolean => this.level >= LogLevel.DEBUG;
    isLogEnabled = (): boolean => this.level >= LogLevel.LOG;

    get level(): LogLevel { return this._level; }

    set level(level: LogLevel) {
        //this._store && this._storeLevel(level);
        this._level = level;
    }

}
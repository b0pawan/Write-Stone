import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule).then(()=>{
    console.log('Application bootstrapped');
    if ('getUserMedia' in navigator){

    }else if ('webkitGetUserMedia' in navigator){
        navigator.getUserMedia = navigator['webkitGetUserMedia'];
    }else if ('mozGetUserMedia' in navigator){
        navigator.getUserMedia = navigator['mozGetUserMedia'];
    }
}).catch((err) => {
    console.error(err);
});
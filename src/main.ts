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
        console.log('navigator ', 'getUserMedia');
    }else if ('webkitGetUserMedia' in navigator){
        console.log('navigator ', 'webkitGetUserMedia');
        navigator.getUserMedia = navigator['webkitGetUserMedia'];
    }else if ('mozGetUserMedia' in navigator){
        console.log('navigator ', 'mozGetUserMedia');
        navigator.getUserMedia = navigator['mozGetUserMedia'];
    }
}).catch((err) => {
    console.error(err);
});
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
//import { enableProdMode } from '@angular/core';

//enableProdMode();

platformBrowserDynamic().bootstrapModule(AppModule);

import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

@IonicPage()
@Component({
selector: 'page-main',
templateUrl: 'main.html'
})
export class MainPage {
    rootPage :any = MainPage ;
    constructor(public navCtrl: NavController) {

    }
    openMain(){
        this.rootPage = MainPage ;
    }
}

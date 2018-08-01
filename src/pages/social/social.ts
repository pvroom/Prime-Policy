import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular';

/**
 * Generated class for the Social page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-social',
  templateUrl: 'social.html',
})
export class SocialPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public actionSheetCtrl: ActionSheetController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SocialPage');
  }


presentActionSheet() {
  let actionSheet = this.actionSheetCtrl.create({
    title: 'Modify your album',
    buttons: [
      {
        text: 'Destructive',
        role: 'destructive',
        handler: () => {
          console.log('Destructive clicked');
        }
      },{
        text: 'Archive',
        handler: () => {
          console.log('Archive clicked');
        }
      },{
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }
    ]
  });
  actionSheet.present();
}
}

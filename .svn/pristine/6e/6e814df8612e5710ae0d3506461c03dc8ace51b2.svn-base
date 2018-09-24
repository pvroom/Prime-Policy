// Components, functions, plugins
import { Component, NgModule } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Localstorage } from './../../providers/localstorage/localstorage';
import { Http } from '@angular/http';

// Pages
import { DatabasePage } from '../database/database';
import { HelpPage } from '../help/help';
import { NotesPage } from '../notes/notes';
import { LoginPage } from '../login/login';
import { ProfilePage } from '../profile/profile';
import { MyAgendaFull } from '../myagendafull/myagendafull';
import { MyAgenda } from '../myagenda/myagenda';
import { ConferenceCityPage } from '../conferencecity/conferencecity';

// Temporary Support Pages
//import { FloorplanMappingPage } from '../floorplanmapping/floorplanmapping';


@Component({
  selector: 'page-more',
  templateUrl: 'more.html',
})

export class MorePage {


	constructor(public navCtrl: NavController, 
				private storage: Storage,
				public httpCall: Http,
				public navParams: NavParams,
				private localstorage: Localstorage) {
	}

	checkBannerImage() {
		/*
		this.httpCall.request('../assets/FlyinBanners/3.png')
			  .map(res => res.text())
			  .subscribe(text => {
				this.txtContent= text;
			  })
			  .catch(error => {
				console.err("Path not found with error:", error);
			  });
		*/
	}
	
	imageExists(url, callback) {
		var img = new Image();
		img.onload = function() { callback('true'); };
		img.onerror = function() { callback('false'); };
		img.src = url;
	}

// Sample usage
	ionViewDidLoad() {
		console.log('ionViewDidLoad MorePage');
		
		var self=this;
		var BannerOnline = 'false';
		var BannerOffline = 'false';
		// Check for local copy in assets
		var imageUrl = 'assets/img/FlyinBanners/3.png';
		console.log('Checking for offline banner...');
		self.imageExists(imageUrl, function(exists) {
			BannerOffline = exists;
			console.log('RESULT: url=' + imageUrl + ', exists=' + exists);
			// Check for version on server
			var imageUrl2 = 'https://primepolicy.convergence-us.com/AdminGateway/images/FlyinBanners/3.png';
			console.log('Checking for online banner...');
			self.imageExists(imageUrl2, function(exists) {
				BannerOnline = exists;
				console.log('RESULT: url=' + imageUrl2 + ', exists=' + exists);
				// Based on available banner images, prioritize the online
				// version over the offline version.  When none are available
				// then use the default banner
				if (BannerOnline == 'true') {
					console.log('Using Online banner');
				}
				if (BannerOnline == 'false' && BannerOffline == 'true') {
					console.log('Using Offline banner');
				}
				if (BannerOnline == 'false' && BannerOffline == 'false') {
					console.log('Using default banner');
				}
			});
		});
		
	}

  	NavToPage(PageID) {

		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');

		switch(PageID) {
			case "HelpPage":
				this.navCtrl.push(HelpPage, {}, {animate: true, direction: 'forward'});
				break;
			case "DatabasePage":
				this.navCtrl.push(DatabasePage, {}, {animate: true, direction: 'forward'});
				break;
//			case "FloorplanMappingPage":
//				this.navCtrl.push(FloorplanMappingPage, {}, {animate: true, direction: 'forward'});
//				break;
			case "NotesPage":
				if (AttendeeID == '' || AttendeeID == null) {
					// If not, store the page they want to go to and go to the Login page
					console.log('Stored AttendeeID: ' + AttendeeID);
					this.storage.set('NavigateToPage', "Notes");
					this.navCtrl.push(LoginPage, {}, {animate: true, direction: 'forward'});
				} else {
					// Otherwise just go to the page they want
					this.navCtrl.push(NotesPage, {}, {animate: true, direction: 'forward'});
				}
				break;
			case "MyAgenda":
				if (AttendeeID == '' || AttendeeID == null) {
					// If not, store the page they want to go to and go to the Login page
					console.log('Stored AttendeeID: ' + AttendeeID);
					this.storage.set('NavigateToPage', "MyAgenda");
					this.navCtrl.push(LoginPage, {}, {animate: true, direction: 'forward'});
				} else {
					// Otherwise just go to the page they want
					this.navCtrl.push(MyAgenda, {}, {animate: true, direction: 'forward'});
				}
				break;
			case "MyAgendaFull":
				if (AttendeeID == '' || AttendeeID == null) {
					// If not, store the page they want to go to and go to the Login page
					console.log('Stored AttendeeID: ' + AttendeeID);
					this.storage.set('NavigateToPage', "MyAgendaFull");
					this.navCtrl.push(LoginPage, {}, {animate: true, direction: 'forward'});
				} else {
					// Otherwise just go to the page they want
					this.navCtrl.push(MyAgendaFull, {}, {animate: true, direction: 'forward'});
				}
				break;
				case "ConferenceCityPage":
				if (AttendeeID == '' || AttendeeID == null) {
					// If not, store the page they want to go to and go to the Login page
					console.log('Stored AttendeeID: ' + AttendeeID);
					this.storage.set('NavigateToPage', "ConferenceCity");
					this.navCtrl.push(LoginPage, {}, {animate: true, direction: 'forward'});
				} else {
					// Otherwise just go to the page they want
					this.navCtrl.push(ConferenceCityPage, {}, {animate: true, direction: 'forward'});
				}
				break;
        }

    };

}



// Components, functions, plugins
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Localstorage } from './../../providers/localstorage/localstorage';

// Pages
import { SpeakersPage } from '../speakers/speakers';


@Component({
  selector: 'page-program',
  templateUrl: 'program.html'
})

export class ProgramPage {

	constructor(public navCtrl: NavController, 
				public navParams: NavParams, 
				private nav: NavController,
				private localstorage: Localstorage) {

	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad: ProgramPage');
	}
	
    DisplayListing(listingType) {

        // Store selection in localStorage for the next page
		this.localstorage.setLocalValue('ListingType', listingType);
        console.log('Listing Type: ' + listingType);

		switch(listingType) {
			case "Speakers":
				// Navigate to Speakers page
				this.navCtrl.push(SpeakersPage, {}, {animate: true, direction: 'forward'});
				break;
			case "SearchbyTopic":
				// Navigate to Speakers page
				this.navCtrl.push('SearchByTopicPage', {}, {animate: true, direction: 'forward'});
				break;
			default:
				// Navigate to Listing page
				this.navCtrl.push('ListingLevel1', {listingType: listingType}, {animate: true, direction: 'forward'});
				break;
		}
		
    }

    navToClientWebsite() {

        var WebsiteURL = "https://www.aacd.com/index.php?module=aacd.websiteforms&cmd=aacdconvergenceauth";

		var u = this.localstorage.getLocalValue('loginUsername');
		var p = this.localstorage.getLocalValue('loginPassword');
		
		// Create URL string
		WebsiteURL = WebsiteURL + "&u=" + u + "&p=" + p;
		// Open website
		window.open(WebsiteURL, '_system');

    }
	
}

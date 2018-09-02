// Components, functions, plugins
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgModule } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LeafletDirective } from '@asymmetrik/ngx-leaflet/dist';
import * as L from "leaflet";

@Component({
  selector: 'page-help',
  templateUrl: 'help.html',
})

export class HelpPage {
	


	  todo = {}
	  logForm() {
		console.log(this.todo)
	  }
	}







/*

    navToWebsite(WebsiteURL) {

        if (WebsiteURL === undefined) {
            // Do nothing
        } else {
            // Initiate web browser
            if ((WebsiteURL.substring(0, 7) != "http://") && (WebsiteURL.substring(0, 8) != "https://")) {
                WebsiteURL = "http://" + WebsiteURL;
            }
			
			console.log('Exhibitor Details: Navigating to: ' + WebsiteURL);
            window.open(WebsiteURL, '_system');
        }

    };

    navToEmail(EmailAddress) {
        if (EmailAddress === undefined) {
            // Do nothing
        } else {
            // Initiate mail program
            window.open('mailto:' + EmailAddress + '?subject=Demo Planner Chicago','target=_blank');
        }

    };

	callPhone2(phoneNumber) {
        console.log("Dialer version 2");
		var DevicePlatform = this.localstorage.getLocalValue('DevicePlatform');
		
		if (DevicePlatform!='Browser') {
			if ((phoneNumber === undefined) || (phoneNumber == '')) {
				console.log('No phone number defined');
				// Do nothing
			} else {
				// remove all other characters from phone number string
				phoneNumber = phoneNumber.replace(/-/g, '');
				phoneNumber = phoneNumber.replace('(', '');
				phoneNumber = phoneNumber.replace(')', '');
				phoneNumber = phoneNumber.replace(' ', '');

				console.log('Dialer: tel:' + phoneNumber);

				window['plugins'].CallNumber.callNumber(function onSuccess(result){
					console.log("Dialer Success:" + JSON.stringify(result));
				},
				function onError(result) {
					console.log("Dialer Error:" + JSON.stringify(result));
				}, phoneNumber, false);

			}
		}


*/


/*
	// Leaflet mapping variables
	myMap: any;

	constructor(public navCtrl: NavController) {
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad HelpPage');
	}
	
	ngOnInit() {
		
		// Help Desk location
		var y = 835;
		var x = 172;
		var RoomName = "NAEYC Homeroom";
		
		// Simple coordinate system mapping
		console.log('Simple coordinate system mapping');
		this.myMap = L.map('map2', {
			crs: L.CRS.Simple,
			minZoom: -2,
			maxZoom: 0,
			zoomControl: true
		});

		var bounds = L.latLngBounds([0, 0], [1200, 2100]);    // Normally 1000, 1000; stretched to 2000,1000 for AACD 2017

		var image = L.imageOverlay('assets/img/ExhibitHallFloorplan2018.png', bounds, {
			attribution: 'Convergence'
		}).addTo(this.myMap);
		
		this.myMap.fitBounds(bounds);
		this.myMap.setMaxBounds(bounds);

		var SessionName = L.latLng([y, x]);

		L.marker(SessionName).addTo(this.myMap)
			.bindPopup(RoomName)
			.openPopup();

		this.myMap.setView([y, x], 1);

	}
	*/
	


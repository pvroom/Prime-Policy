import { Component, ViewChild } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { LeafletDirective } from '@asymmetrik/ngx-leaflet/dist';

import * as L from "leaflet";

declare var google: any;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {

//	 Leaflet mapping variables
	myMap2: any;
	myMap3: any;
    myMap4: any;

	constructor(public navCtrl: NavController, 
				public platform: Platform) {
			
	}


	ngOnInit() {
		
		
		// -----------------
		// Show US Capitol Campus
		// -----------------
		this.myMap2 = L.map('mapLevel2', {
			crs: L.CRS.Simple,
			minZoom: -4,
			maxZoom: 4,
			zoomControl: true
		});

		var bounds = L.latLngBounds([0, 0], [1200, 1700]);    // Normally 1000, 1000; stretched to 2000,1000 for AACD 2017
		var image = L.imageOverlay('assets/img/capitol_campus_map.jpg', bounds, {
			attribution: 'Convergence'
		}).addTo(this.myMap2);

		this.myMap2.fitBounds(bounds);
		this.myMap2.setMaxBounds(bounds);
		
		// -----------------
		// Show House
		// -----------------
		this.myMap3 = L.map('mapLevel3', {
			crs: L.CRS.Simple,
			minZoom: -4,
			maxZoom: 4,
			zoomControl: true
		});

		var bounds = L.latLngBounds([0, 0], [1200, 1700]);    // Normally 1000, 1000; stretched to 2000,1000 for AACD 2017
		var image = L.imageOverlay('assets/img/house-inside.jpg', bounds, {
			attribution: 'Convergence'
		}).addTo(this.myMap3);

		this.myMap3.fitBounds(bounds);
		this.myMap3.setMaxBounds(bounds);

		// -----------------
		// Show Senate
		// -----------------
		this.myMap4 = L.map('mapLevel4', {
			crs: L.CRS.Simple,
			minZoom: -4,
			maxZoom: 4,
			zoomControl: true
		});

		var bounds = L.latLngBounds([0, 0], [1200, 1700]);    // Normally 1000, 1000; stretched to 2000,1000 for AACD 2017
		var image = L.imageOverlay('assets/img/senate-inside.jpg', bounds, {
			attribution: 'Convergence'
		}).addTo(this.myMap4);

		this.myMap4.fitBounds(bounds);
		this.myMap4.setMaxBounds(bounds);
		
	}
	
}





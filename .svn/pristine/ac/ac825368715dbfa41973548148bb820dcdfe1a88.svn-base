// Components, functions, plugins
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgModule } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Database } from './../../providers/database/database';
import { Localstorage } from '../../providers/localstorage/localstorage';

declare var dateFormat: any;

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsPage {

	public NotificationListing: any[] = [];

	constructor(public navCtrl: NavController, 
				public navParams: NavParams,
				private storage: Storage,
				private databaseprovider: Database,
				public loadingCtrl: LoadingController,
				private cd: ChangeDetectorRef,
				private localstorage: Localstorage) {
					
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad NotificationsPage');
	}

	ngOnInit() {

		// Load initial data set here
		let loading = this.loadingCtrl.create({
			spinner: 'crescent',
			content: 'Loading...'
		});

		loading.present();

		// Blank info
		this.NotificationListing = [];
		this.cd.markForCheck();

		// Temporary use variables
		var flags;
		var visReceivedDate;
		var visReceivedTime;
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');

		flags = "pn|0";
		
		this.databaseprovider.getMessagingData(flags, AttendeeID).then(data => {
			
			console.log("getMessagingData: " + JSON.stringify(data));

			if (data['length']>0) {
				
				for (var i = 0; i < data['length']; i++) {
					
					var dbEventDateTime = data[i].pushDateTimeReceived;
					dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
					dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
					var SQLDate = new Date(dbEventDateTime);
					var DisplayDateTime = dateFormat(SQLDate, "mm/dd h:MMtt");
					
					this.NotificationListing.push({
						pushTitle: data[i].pushTitle,
						pushDateTime: DisplayDateTime,
						pushMessage: data[i].pushMessage
					});

				}


			} else {
				
				this.NotificationListing.push({
					pushTitle: "No push notifications received on this device",
					pushDateTime: "",
					pushMessage: ""
				});

			}

			this.cd.markForCheck();
			loading.dismiss();
			
		}).catch(function () {
			console.log("Promise Rejected");
			loading.dismiss();
		});
		
	}
	
}

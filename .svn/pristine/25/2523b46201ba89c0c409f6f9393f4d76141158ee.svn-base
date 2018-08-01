// Components, functions, plugins
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgModule } from '@angular/core';
import { NavController, NavParams, Events, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import { Database } from './../../providers/database/database';
import { Localstorage } from './../../providers/localstorage/localstorage';
import { Synchronization } from "../../providers/synchronization/synchronization";


@Component({
  selector: 'page-database',
  templateUrl: 'database.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DatabasePage {

	public DatabaseStatsListing: any[] = [];
	public LastAutoSync: string;
	
	constructor(public navCtrl: NavController, 
				public navParams: NavParams,
				private databaseprovider: Database,
				private localstorage: Localstorage,
				private syncprovider: Synchronization,
				private cd: ChangeDetectorRef,
				public loadingCtrl: LoadingController) {
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad Database');
	}

	ngOnInit() {

		let loading = this.loadingCtrl.create({
			spinner: 'crescent',
			content: 'Please wait...'
		});

		loading.present();

		// Blank and show loading info
		this.DatabaseStatsListing = [];
		this.cd.markForCheck();
				
		var flags = "st";
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
		this.LastAutoSync = this.localstorage.getLocalValue('LastSync');

		if (AttendeeID == '' || AttendeeID == null) {
			AttendeeID = '0';
		}
										
		this.databaseprovider.getDatabaseStats(flags, AttendeeID).then(data => {
			
			console.log("getDatabaseStats: " + JSON.stringify(data));

			if (data['length'] > 0) {
				
				for (var i = 0; i < data['length']; i++) {

					this.DatabaseStatsListing.push({
						DatabaseTable: data[i].DatabaseTable,
						DatabaseRecords: data[i].Records
					});

				}

			}

			this.cd.markForCheck();

			loading.dismiss();
			
		}).catch(function () {
			console.log("Promise Rejected");
		});
				
	}

	ResetAutoSync() {
		this.localstorage.setLocalValue('LastSync', '2018-01-01 00:00:01');		
		this.LastAutoSync = '2018-01-01 00:00:01';
	}

	ManualSync() {
		
		// Previously successful sync time
		var LastSync = this.localstorage.getLocalValue('LastSync');
		if (LastSync == '' || LastSync === null) {
			LastSync = '2018-01-01 00:00:01';
		}
		
		// Current sync time
		var ThisSync = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
		
		console.log('DatabasePage: ManualSync event');
		
		// Call AutoSync service in providers
		this.syncprovider.DBSyncUpdateM2S(LastSync, ThisSync).then(data => {
			console.log('DatabasePage: Executed UpdateM2S Sync: ' + data);
			// Update LastSync date for next run
			this.localstorage.setLocalValue('LastSync', ThisSync);
			this.LastAutoSync = ThisSync;
		}).catch(function () {
			console.log("DatabasePage: UpdateM2S Sync Promise Rejected");
		});
		
		this.syncprovider.DBSyncUpdateS2M(LastSync, ThisSync).then(data => {
			console.log('DatabasePage: Executed UpdateS2M Sync: ' + data);
			// Update LastSync date for next run
			this.localstorage.setLocalValue('LastSync', ThisSync);
			this.LastAutoSync = ThisSync;
		}).catch(function () {
			console.log("DatabasePage: UpdateS2M Sync Promise Rejected");
		});

	}
	
 }

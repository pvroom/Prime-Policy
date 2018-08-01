// Components, functions, plugins
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgModule } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Database } from './../../providers/database/database';
import { Localstorage } from './../../providers/localstorage/localstorage';

declare var dateFormat: any;


@IonicPage()
@Component({
  selector: 'page-searchbytopic',
  templateUrl: 'searchbytopic.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchByTopicPage {

	public sessions: any[] = [];
	public EntryTerms: string;
	public TopicSearchChoice: string;
	
	constructor(public navCtrl: NavController, 
				public navParams: NavParams,
				private storage: Storage,
				private databaseprovider: Database,
				private cd: ChangeDetectorRef,
				public loadingCtrl: LoadingController,
				private localstorage: Localstorage) {
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad: SearchByTopicPage');
	}

	ionViewDidEnter() {
		console.log('ionViewDidEnter: SearchByTopicPage');
		
		// Load / refresh data when coming to this page
		this.LoadData();
	}

	SearchTopics(selectedValue: any) {
		
		//let loading = this.loadingCtrl.create({
		//	spinner: 'crescent',
		//	content: 'Please wait...'
		//});

		//loading.present();

		console.log('Selected topic: ' + selectedValue);
		
		this.cd.markForCheck();
		var TopicSearchOption = selectedValue;
		var SQLDate;
		var DisplayDateTime;
		var dbEventDateTime;
		var PrimarySpeakerName;
		var flags = '';
		this.sessions = [];
		this.TopicSearchChoice = TopicSearchOption;

        this.localstorage.setLocalValue('TopicSearch', TopicSearchOption);
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');

		if (TopicSearchOption === null || TopicSearchOption== 'Select a topic...') {
			
			this.TopicSearchChoice = "Select a topic...";
			console.log('TopicSearch: Select a topic...');
		
		} else {

			// Get records
			this.databaseprovider.getSearchData(TopicSearchOption, AttendeeID).then(data => {
				
				console.log('TopicSearch using: ' + TopicSearchOption);

				if (data['length']>0) {
					
					console.log('Records returned');
					
					// Process returned records to display
					for (var i = 0; i < data['length']; i++) {

						dbEventDateTime = data[i].session_start_time.substring(0, 19);
						dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
						dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
						SQLDate = new Date(dbEventDateTime);
						DisplayDateTime = dateFormat(SQLDate, "mm/dd h:MMtt");

						// Display end time
						dbEventDateTime = data[i].session_end_time.substring(0, 19);
						dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
						dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
						SQLDate = new Date(dbEventDateTime);
						DisplayDateTime = DisplayDateTime + " to " + dateFormat(SQLDate, "h:MMtt");

						this.sessions.push({
							DisplayEventName: data[i].session_title,
							DisplayEventTimeDateLocation: DisplayDateTime + " in " + data[i].RoomName, // + " for " + ConvertM2HM(resC.rows.item(0).EventDuration),
							SpeakerDisplayName: PrimarySpeakerName,
							EventID: data[i].session_id
						});

					}

				}

				this.cd.markForCheck();

				//loading.dismiss();

			}).catch(function () {
				console.log("Promise Rejected");
			});
			
		}
	}

	LoadData() {
		
		//let loading = this.loadingCtrl.create({
		//	spinner: 'crescent',
		//	content: 'Please wait...'
		//});

		//loading.present();
		
		this.cd.markForCheck();
		var SQLDate;
		var DisplayDateTime;
		var dbEventDateTime;
		var PrimarySpeakerName;
		this.sessions = [];

		var TopicSearchOption = this.localstorage.getLocalValue('TopicSearch');
		this.TopicSearchChoice = TopicSearchOption;
		
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');

		console.log('TopicSearch: ' + TopicSearchOption);
		
		if (TopicSearchOption === null || TopicSearchOption== 'Select a topic...') {
			
			this.TopicSearchChoice = "Select a topic...";
			console.log('TopicSearch: Select a topic...');
		
		} else {
			
			// Get records
			this.databaseprovider.getSearchData(TopicSearchOption, AttendeeID).then(data => {
				
				console.log('TopicSearch using: ' + TopicSearchOption);

				if (data['length']>0) {
					
					console.log('Records returned');
					
					// Process returned records to display
					for (var i = 0; i < data['length']; i++) {

						dbEventDateTime = data[i].session_start_time.substring(0, 19);
						dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
						dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
						SQLDate = new Date(dbEventDateTime);
						DisplayDateTime = dateFormat(SQLDate, "mm/dd h:MMtt");

						// Display end time
						dbEventDateTime = data[i].session_end_time.substring(0, 19);
						dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
						dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
						SQLDate = new Date(dbEventDateTime);
						DisplayDateTime = DisplayDateTime + " to " + dateFormat(SQLDate, "h:MMtt");

						this.sessions.push({
							DisplayEventName: data[i].session_title,
							DisplayEventTimeDateLocation: DisplayDateTime + " in " + data[i].RoomName, // + " for " + ConvertM2HM(resC.rows.item(0).EventDuration),
							SpeakerDisplayName: PrimarySpeakerName,
							EventID: data[i].session_id
						});

					}

				}

				this.cd.markForCheck();

				//loading.dismiss();

			}).catch(function () {
				console.log("Promise Rejected");
			});

		}
		
	}
	
    EventDetails(EventID) {
		
        if (EventID != 0) {
            // Navigate to Exhibitor Details page
			this.navCtrl.push('EducationDetailsPage', {EventID: EventID}, {animate: true, direction: 'forward'});
        }

    };
	
}

// Components, functions, plugins
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgModule } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Database } from './../../providers/database/database';
import { Localstorage } from './../../providers/localstorage/localstorage';

declare var formatTime: any;
declare var dateFormat: any;

@IonicPage()
@Component({
  selector: 'page-myagendapersonal',
  templateUrl: 'myagendapersonal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MyAgendaPersonal {

	public btnDelete = false;

	public agendaItempersonalEventName: string;
	public agendaItempersonalEventLocation: string;
	public agendaItempersonalDate;
	public agendaItempersonalStartTime;
	public agendaItempersonalEndTime;
	public agendaItempersonalEventDescription: string;
	public agendaItemid: string;
	
	constructor(public navCtrl: NavController, 
				public navParams: NavParams,
				private storage: Storage,
				private databaseprovider: Database,
				public loadingCtrl: LoadingController,
				private alertCtrl: AlertController,
				public events: Events,
				private cd: ChangeDetectorRef,
				private localstorage: Localstorage) {
					
	}

	ionViewDidLoad() {
		
		console.log('ionViewDidLoad MyAgendaPersonal');
				
	}

	ngOnInit() {

		// Load initial data set here

		//let loading = this.loadingCtrl.create({
		//	spinner: 'crescent',
		//	content: 'Please wait...'
		//});

        this.btnDelete = false;
		this.cd.markForCheck();

		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
        var personalID = this.localstorage.getLocalValue('PersonalEventID');

        if (personalID != "0") {

			var flags = "pi|0|" + personalID + "|0|0|0|0|0|0|0";

			// Get the data
			this.databaseprovider.getAgendaData(flags, AttendeeID).then(data => {
				
				console.log("getPersonalAgendaData: " + JSON.stringify(data));

				if (data['length']>0) {

                    this.agendaItempersonalEventName = data[0].EventName;
                    this.agendaItempersonalEventLocation = data[0].EventLocation;
                    this.agendaItempersonalDate = data[0].EventDate;
                    this.agendaItempersonalStartTime = data[0].EventStartTime;
                    this.agendaItempersonalEndTime = data[0].EventEndTime;
					if (this.agendaItempersonalEventDescription=='undefined' || this.agendaItempersonalEventDescription===undefined || this.agendaItempersonalEventDescription === null ) {
						this.agendaItempersonalEventDescription = "";
					} else {
						this.agendaItempersonalEventDescription = data[0].EventDescription;
					}
                    this.agendaItemid = data[0].mtgID;

                    this.btnDelete = true;

					this.cd.detectChanges();
			
                }

			}).catch(function () {
				console.log("Promise Rejected");
			});
			
        }

		//loading.dismiss();

	}

    SaveAgendaItem() {

        console.log('Process Personal Agenda Save');

		// Saving progress
		let saving = this.loadingCtrl.create({
			spinner: 'crescent',
			content: 'Saving...'
		});

		// Alert for successful save
		let savealert = this.alertCtrl.create({
			title: 'Personal Agenda Entry',
			subTitle: 'Personal Agenda entry has been saved.',
			buttons: ['Ok']
		});

		// Alert for failed save
		let failalert = this.alertCtrl.create({
			title: 'Personal Agenda Entry',
			subTitle: 'Unable to save your Personal Agenda entry at this time - please try again in a little bit.',
			buttons: ['Ok']
		});

		// Alert for required fields
		let requiredalert = this.alertCtrl.create({
			title: 'Personal Agenda Entry',
			subTitle: 'All fields except Description are required to be completed before saving.',
			buttons: ['Ok']
		});

		// Show saving progress
		saving.present();

        var personalID = this.localstorage.getLocalValue('PersonalEventID');
        var AttendeeID = this.localstorage.getLocalValue('AttendeeID');

        var ControlDate;
        var StartTime = "";
        var EndTime = "";
        var EventDate = "";

        // Validation checks
        var ValidationPass = true;

		// Diagnostics
		console.log('agendaItempersonalEventName :' + this.agendaItempersonalEventName);
		console.log('agendaItempersonalEventLocation :' + this.agendaItempersonalEventLocation);
		console.log('agendaItempersonalDate :' + this.agendaItempersonalDate);
		console.log('agendaItempersonalStartTime :' + this.agendaItempersonalStartTime);
		console.log('agendaItempersonalEndTime :' + this.agendaItempersonalEndTime);
		
        if (this.agendaItempersonalEventName == null || this.agendaItempersonalEventName == "") {
            ValidationPass = false;
        }
        if (this.agendaItempersonalEventLocation == null || this.agendaItempersonalEventLocation == "") {
            ValidationPass = false;
        }
        if (this.agendaItempersonalDate == null || this.agendaItempersonalDate == "") {
            ValidationPass = false;
        }
        if (this.agendaItempersonalStartTime == null || this.agendaItempersonalStartTime == "") {
            ValidationPass = false;
        }
        if (this.agendaItempersonalEndTime == null || this.agendaItempersonalEndTime == "") {
            ValidationPass = false;
        }
        if (ValidationPass == false) {
			
			saving.dismiss();
			requiredalert.present();

        } else {

            // Date formatting
            ControlDate = new Date(this.agendaItempersonalDate + " " + this.agendaItempersonalStartTime);
            StartTime = dateFormat(ControlDate, "HH:MM:ss");

            ControlDate = new Date(this.agendaItempersonalDate + " " + this.agendaItempersonalEndTime);
            EndTime = dateFormat(ControlDate, "HH:MM:ss");

            // Get last update performed by this app
            var LastUpdateDate = this.localstorage.getLocalValue("LastUpdateDate");
            if (LastUpdateDate == null) {
                // If never, then set variable and localStorage item to NA
				LastUpdateDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                this.localstorage.setLocalValue("LastUpdateDate", LastUpdateDate);
            }

			var flags = "ps|0|" + personalID + "|" + StartTime + "|" + EndTime + "|" + this.agendaItempersonalEventLocation + "|" + this.agendaItempersonalEventName + "|" + this.agendaItempersonalDate + "|0|" + LastUpdateDate + "|" + this.agendaItempersonalEventDescription;
			console.log('Save personal flags: ' + flags);
			
			this.databaseprovider.getAgendaData(flags, AttendeeID).then(data => {
				
				console.log("getAgendaData: " + JSON.stringify(data));

				if (data['length']>0) {
					
					if (data[0].PEStatus == "Success") {
						// Saved
						this.events.publish('user:Status', 'Personal Agenda Save/Update');
						saving.dismiss();
						savealert.present();
						this.navCtrl.pop();
					} else {
						// Not saved
						console.log("Query: " + data[0].PEQuery);
						saving.dismiss();
						failalert.present();
					}
					
				} else {
					
					// Not saved
					console.log("No query to show");
					saving.dismiss();
					failalert.present();
					
				}

			}).catch(function () {
				console.log("Promise Rejected");
			});
		
        }
    }
	
    DeleteAgendaItem() {

        console.log('Process Personal Agenda Delete');

		// Deleting progress
		let deleting = this.loadingCtrl.create({
			spinner: 'crescent',
			content: 'Deleting...'
		});

		// Alert for successful delete
		let deletealert = this.alertCtrl.create({
			title: 'Personal Agenda Entry',
			subTitle: 'Personal Agenda entry has been deleted.',
			buttons: ['Ok']
		});

		// Alert for failed delete
		let failalert = this.alertCtrl.create({
			title: 'Personal Agenda Entry',
			subTitle: 'Unable to delete your Personal Agenda entry at this time - please try again in a little bit.',
			buttons: ['Ok']
		});

		let confirmAlert = this.alertCtrl.create({
			title: 'Delete Personal Agenda',
			message: 'Are you sure you want to delete this agenda item?',
			buttons: [
				{
					text: 'No',
					handler: () => {
						console.log('User chose to keep agenda item');
						//this.confirmAlert.dismiss();
					}
				},
				{
					text: 'Yes',
					handler: () => {
						console.log('User chose to delete agenda item');
						var personalID = this.localstorage.getLocalValue('PersonalEventID');
						var AttendeeID = this.localstorage.getLocalValue('AttendeeID');

						// Get last update performed by this app
						var LastUpdateDate = this.localstorage.getLocalValue("LastUpdateDate");
						if (LastUpdateDate == null) {
							// If never, then set variable and localStorage item to NA
							LastUpdateDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
							this.localstorage.setLocalValue("LastUpdateDate", LastUpdateDate);
						}

						var flags = "pd|0|" + personalID + "|0|0|0|0|0|0|" + LastUpdateDate + "|0";
						console.log('Delete personal flags: ' + flags);
						
						this.databaseprovider.getAgendaData(flags, AttendeeID).then(data => {
							
							console.log("getAgendaData: " + JSON.stringify(data));

							if (data['length']>0) {
								
								if (data[0].PEStatus == "Success") {
									// Saved
									this.events.publish('user:Status', 'Personal Agenda Delete');
									//confirmAlert.dismiss();
									deletealert.present();
									this.navCtrl.pop();
								} else {
									// Not saved
									console.log("Query: " + data[0].PEQuery);
									//confirmAlert.dismiss();
									failalert.present();
								}
								
							} else {
								
								// Not saved
								console.log("No query to show");
								//confirmAlert.dismiss();
								failalert.present();
								
							}

						}).catch(function () {
							console.log("Promise Rejected");
						});
					}
				}
			]
		});

		// Show saving progress
		confirmAlert.present();


    }	

}

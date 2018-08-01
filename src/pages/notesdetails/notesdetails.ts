// Components, functions, plugins
import { Component, ChangeDetectionStrategy, ChangeDetectorRef  } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Database } from './../../providers/database/database';
import { Localstorage } from './../../providers/localstorage/localstorage';

@IonicPage()
@Component({
  selector: 'page-notesdetails',
  templateUrl: 'notesdetails.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotesDetailsPage {

	public DisplayEventName: string;
	public SpeakerDisplayName: string;
	public NoteDetails: string;
	public AttendeeID: string;
	public NoteID: string;
	public NoteStatus: string;
	public EventID: string;

	constructor(public navCtrl: NavController, 
				public navParams: NavParams,
				private databaseprovider: Database,
				private cd: ChangeDetectorRef,
				public loadingCtrl: LoadingController,
				private alertCtrl: AlertController,
				private localstorage: Localstorage) {

				this.EventID = this.navParams.get('EventID');

				this.DisplayEventName = "";
				this.SpeakerDisplayName = "";
				this.NoteDetails = "";
				this.AttendeeID = "";
				this.NoteID = "";
				this.NoteStatus = "";
				
	}

	ngOnInit() {

		// Load initial data set here
		//let loading = this.loadingCtrl.create({
		//	spinner: 'crescent',
		//	content: 'Please wait...'
		//});

		// Blank and show loading info
		this.cd.markForCheck();
		
		// Temporary use variables
		var flags;
		
		// Get the data
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
		
		if (AttendeeID != '' && AttendeeID != null) {
				
			//loading.present();
			
			flags = "|dt|" + this.EventID;
			
			this.databaseprovider.getNotesData(flags, AttendeeID).then(data => {
				
				console.log("getNotesData: " + JSON.stringify(data));

				if (data['length']>0) {
					
					if (data[0].Note != "" && data[0].Note != null) {
						
						console.log('Existing note');

						this.DisplayEventName = data[0].session_title;
						this.SpeakerDisplayName = data[0].other_speakers;
						this.NoteDetails = data[0].Note;
						this.NoteID = data[0].id;
						this.NoteStatus = 'Update';

					} else {

						console.log('New note');
						
						this.DisplayEventName = data[0].session_title;
						this.SpeakerDisplayName = data[0].other_speakers;
						this.NoteDetails = "";
						this.NoteID = '0';
						this.NoteStatus = 'New';
						
					}

					this.cd.markForCheck();

				}

				console.log('Note details: ' + data[0].Note);
				//loading.dismiss();

			}).catch(function () {
				console.log("Promise Rejected");
			});
			
		} else {
			console.log('User not logged in');
			//loading.dismiss();
		}
			
	}

	
    SaveNote() {

        console.log('Process note');

		// Saving progress
		let saving = this.loadingCtrl.create({
			spinner: 'crescent',
			content: 'Saving...'
		});

		// Alert for successful save
		let savealert = this.alertCtrl.create({
			title: 'Note Entry',
			subTitle: 'Note has been saved.',
			buttons: ['Ok']
		});

		// Alert for failed save
		let failalert = this.alertCtrl.create({
			title: 'Note Entry',
			subTitle: 'Unable to save your note at this time - please try again in a little bit.',
			buttons: ['Ok']
		});

		// Show saving progress
		saving.present();

		var NoteStatus = this.NoteStatus;
		var NoteID = this.NoteID;
        var sessionID = this.EventID;
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
        var NewNote = this.NoteDetails;
		var flags;

        // Get last update performed by this app
		var LastUpdateDate = this.localstorage.getLocalValue('LastUpdateDate');
			
		// Set LastUpdate value
		if (LastUpdateDate == '' || LastUpdateDate == null) {
			LastUpdateDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
			this.localstorage.setLocalValue('LastUpdateDate', LastUpdateDate);
		}

		// If New note, create record
		if (NoteStatus == 'New') {
			console.log('Save New Note');

			flags = "|sn|" + sessionID + "|" + NoteID + "|" + NewNote + "|" + LastUpdateDate;
			
			this.databaseprovider.getNotesData(flags, AttendeeID).then(data => {
				
				console.log("getNotesData: " + JSON.stringify(data));

				if (data['length']>0) {
					
					if (data[0].status == "Saved") {
						// Saved
						saving.dismiss();
						savealert.present();
						this.navCtrl.pop();
					} else {
						// Not saved
						saving.dismiss();
						failalert.present();
					}
					
				} else {
					
					// Not saved
					saving.dismiss();
					failalert.present();
					
				}

			}).catch(function () {
				console.log("Promise Rejected");
			});

		}

		// If existing note, update record
		if (NoteStatus == 'Update') {
			console.log('Update Existing Note');

			flags = "|un|" + sessionID + "|" + NoteID + "|" + NewNote + "|" + LastUpdateDate;
			
			this.databaseprovider.getNotesData(flags, AttendeeID).then(data => {
				
				console.log("getNotesData: " + JSON.stringify(data));

				if (data['length']>0) {
					
					if (data[0].status == "Saved") {
						// Saved
						saving.dismiss();
						savealert.present();
						this.navCtrl.pop();
					} else {
						// Not saved
						saving.dismiss();
						failalert.present();
					}
					
				} else {
					
					// Not saved
					saving.dismiss();
					failalert.present();
					
				}

			}).catch(function () {
				console.log("Promise Rejected");
			});

		}

    };
	
	// Cancel by returning to calling page.  This could be the Notes Listing or Education Details page
    CancelNote() {
        this.navCtrl.pop();
    };

}

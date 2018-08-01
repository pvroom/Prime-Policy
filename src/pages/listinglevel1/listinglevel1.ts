// Components, functions, plugins
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgModule } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Database } from './../../providers/database/database';
import { Localstorage } from './../../providers/localstorage/localstorage';

// Pages
import { LoginPage } from '../login/login';

declare var dateFormat: any;

@IonicPage()
@Component({
  selector: 'page-listinglevel1',
  templateUrl: 'listinglevel1.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingLevel1 {

	public ProgramListing: any[] = [];
	public ProgramTitle: string;
	public daysShow = true;
	public EntryTerms: string;

	// Day buttons
	public btnTue = "myButtonGreyBlue";
	public btnWed = "myButtonGreyBlue";
	public btnThu = "myButtonGreyBlue";
	public btnFri = "myButtonGreyBlue";
	public btnSat = "myButtonGreyBlue";
	
	constructor(public navCtrl: NavController, 
				public navParams: NavParams,
				private storage: Storage,
				private databaseprovider: Database,
				private cd: ChangeDetectorRef,
				public loadingCtrl: LoadingController,
				public events: Events,
				private alertCtrl: AlertController, 
				private localstorage: Localstorage) {
				
				if (this.navParams.get('listingType') == "Lectures") {
					this.ProgramTitle = "Sessions by Day";
				} else {
					this.ProgramTitle = this.navParams.get('listingType');
				}
				
	}

	
	ngOnInit() {

		// Load initial data set here
		//switch(this.navParams.get('listingType')) {
		//		case "Lectures":
		//			this.daysShow = true;
		//			console.log('Showing day bar');
		//			break;
		//		default:
		//			this.daysShow = false;
		//			console.log('Hiding day bar');
		//			break;
		//}

		//let loading = this.loadingCtrl.create({
		//	spinner: 'crescent',
		//	content: 'Please wait...'
		//});

		//loading.present();

		// Blank and show loading info
		this.ProgramListing = [];
		this.cd.markForCheck();
		

		var flags;
		var NotesButtonStatus = true;
		var AgendaButtonStatus = true;
		var dayID;
		
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
		var ProgramDay = this.localstorage.getLocalValue('ProgramDay');

		this.btnTue = "myButtonGreyBlue";
		this.btnWed = "myButtonGreyBlue";
		this.btnThu = "myButtonGreyBlue";
		this.btnFri = "myButtonGreyBlue";
		this.btnSat = "myButtonGreyBlue";
		
		switch(ProgramDay) {
			case "Sat":
				this.btnTue = "myButtonActive";
				flags = "6/9/2018";
				break;
			case "Sun":
				this.btnWed = "myButtonActive";
				flags = "6/10/2018";
				break;
			case "Mon":
				this.btnThu = "myButtonActive";
				flags = "6/11/2018";
				break;
			case "Tue":
				this.btnFri = "myButtonActive";
				flags = "6/12/2018";
				break;
			case "Wed":
				this.btnSat = "myButtonActive";
				flags = "6/13/2018";
				break;
			default:
				this.btnTue = "myButtonActive";
				flags = "6/9/2018";
				break;
		}
		

		console.log('Flags: ' + flags);
		
		//if (AttendeeID != '' && AttendeeID != null) {
										
			this.databaseprovider.getLecturesByDay(flags, this.navParams.get('listingType'), AttendeeID).then(data => {
				
				console.log("getLecturesByDay: " + JSON.stringify(data));

				if (data['length']>0) {
					
					var TimeslotDivider = "";
					for (var i = 0; i < data['length']; i++) {

						var SubjectCodeCECredits = "";

						var dbEventDateTime = data[i].session_start_time.substring(0, 19);
						dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
						dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
						var SQLDate = new Date(dbEventDateTime);
						var DisplayDateTime = dateFormat(SQLDate, "mm/dd h:MMtt");
						var DisplayStartTime = dateFormat(SQLDate, "h:MMtt");
						
						// Display end time
						dbEventDateTime = data[i].session_end_time.substring(0, 19);
						dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
						dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
						SQLDate = new Date(dbEventDateTime);
						DisplayDateTime = DisplayDateTime + " to " + dateFormat(SQLDate, "h:MMtt");


						var AgendaButtonText = "";
						var visAgendaButtonColor = "";
						var visAgendaButtonTextColor = "";
						
						if (data[i].OnAgenda != null) {
							AgendaButtonText = "Remove";
						    visAgendaButtonColor = "#740e88";
						    visAgendaButtonTextColor = "#ffffff";
						} else {
							AgendaButtonText = "Add";
						    visAgendaButtonColor = "#ffffff";
						    visAgendaButtonTextColor = "#740e88";
						}

						var visEventName = data[i].session_title;
						var DisplayDateRoom = "";
						
						if (data[i].RoomName.length==0) {
							DisplayDateRoom = DisplayDateTime;
						} else {
							DisplayDateRoom = DisplayDateTime + " in " + data[i].RoomName;
						}

						SubjectCodeCECredits = "ID: " + data[i].session_id;
						
						//if (data[i].subject != null && data[i].subject != "") {
						//	SubjectCodeCECredits = "Subject code: " + data[i].subject;
						//}
						//if (data[i].subject != null && data[i].subject != "") {
						//	if (data[i].cs_credits != null && data[i].cs_credits != "") {
						//		SubjectCodeCECredits = SubjectCodeCECredits + " - CE Credits: " + data[i].cs_credits;
						//	}
						//} else {
						//	if (data[i].cs_credits != null && data[i].cs_credits != "") {
						//		SubjectCodeCECredits = "CE Credits: " + data[i].cs_credits;
						//	}
						//}
						
						// Status checks
						var visSessionStatus = "";
						var visStatusStyle = "SessionStatusNormal";
						
						// Room Capacity check
						if (parseInt(data[i].room_capacity) <= parseInt(data[i].Attendees)) {
							visSessionStatus = "Course at Capacity";
							visStatusStyle = "SessionStatusRed";
						}
						
						// Waitlist check
						if (data[i].Waitlist == "1") {
							if (visSessionStatus == "") {
								visSessionStatus = "You are Waitlisted";
								visStatusStyle = "SessionStatusRed";
							} else {
								visSessionStatus = visSessionStatus + " / You are Waitlisted";
								visStatusStyle = "SessionStatusRed";
							}
						}
				
						// Cancellation check
						if (data[i].CancelledYN == "Y") {
							visSessionStatus = "CANCELLED";
							visStatusStyle = "SessionStatusRed";
						}

						if (DisplayStartTime != TimeslotDivider) {
							
							// Display the divider
							this.ProgramListing.push({
								DisplayEventName: DisplayStartTime,
								DisplayEventTimeDateLocation: "",
								SpeakerDisplayName: "",
								EventID: "0",
								visAgendaAddRemoveButton: false,
								btnEvalShow: false,
								btnNotesShow: false,
								btnAgendaShow: false,
								btnEmailShow: false,
								DisplaySubjectCodeCECredits: "",
								SessionStatusStyle: "SessionStatusNormal",
								SessionStatus: "",
								AgendaButtonColor: "#ffffff",
								AgendaButtonTextColor: "#ffffff",
								DisplayIcon: "",
								DividerStyle: "DividerTimeslot",
								btnAgendaDisable: false
							});

							// Set the new marker point
							TimeslotDivider = DisplayStartTime;

							this.ProgramListing.push({
								DisplayEventName: visEventName,
								DisplayEventTimeDateLocation: DisplayDateRoom,
								SpeakerDisplayName: data[i].other_speakers,
								EventID: data[i].session_id,
								visAgendaAddRemoveButton: AgendaButtonText,
								btnEvalShow: false,
								btnNotesShow: NotesButtonStatus,
								btnAgendaShow: AgendaButtonStatus,
								btnEmailShow: true,
								DisplaySubjectCodeCECredits: SubjectCodeCECredits,
								SessionStatusStyle: visStatusStyle,
								SessionStatus: visSessionStatus,
								AgendaButtonColor: visAgendaButtonColor,
								AgendaButtonTextColor: visAgendaButtonTextColor,
								DisplayIcon: "arrow-dropright",
								DividerStyle: "DividerNormal",
								btnAgendaDisable: true


							});

						} else {
							
							this.ProgramListing.push({
								DisplayEventName: visEventName,
								DisplayEventTimeDateLocation: DisplayDateRoom,
								SpeakerDisplayName: data[i].other_speakers,
								EventID: data[i].session_id,
								visAgendaAddRemoveButton: AgendaButtonText,
								btnEvalShow: false,
								btnNotesShow: NotesButtonStatus,
								btnAgendaShow: AgendaButtonStatus,
								btnEmailShow: true,
								DisplaySubjectCodeCECredits: SubjectCodeCECredits,
								SessionStatusStyle: visStatusStyle,
								SessionStatus: visSessionStatus,
								AgendaButtonColor: visAgendaButtonColor,
								AgendaButtonTextColor: visAgendaButtonTextColor,
								DisplayIcon: "arrow-dropright",
								DividerStyle: "DividerNormal",
								btnAgendaDisable: true
								
							});
						}
						
					}

				} else {
					
					this.ProgramListing.push({
						DisplayEventName: "No events available",
						DisplayEventTimeDateLocation: "",
						SpeakerDisplayName: "",
						EventID: 0,
						btnEvalShow: false,
						btnNotesShow: false,
						btnAgendaShow: false,
						btnEmailShow: false,
						DisplaySubjectCodeCECredits: "",
						SessionStatusStyle: "",
						SessionStatus: "",
						AgendaButtonColor: "",
						AgendaButtonTextColor: "",
						DisplayIcon: "",
						DividerStyle: "",
						btnAgendaDisable: false
						
					});

				}

				this.cd.markForCheck();

				//loading.dismiss();
				
			}).catch(function () {
				console.log("Promise Rejected");
			});
			
		//} else {
		//	console.log('User not logged in');
		//	loading.dismiss();
		//}
		
	}

	ionViewDidLoad() {
		
		console.log('ionViewDidLoad ListingLevel1');
				
	}

    GetSearchResults() {

        var SearchTerms = this.EntryTerms;

        if ((SearchTerms == undefined) || (SearchTerms == "")) {
            // Do nothing or show message
			
        } else {

            this.localstorage.setLocalValue("SearchTerms", SearchTerms);
			this.navCtrl.push('SearchResultsPage', {SearchTerms: SearchTerms}, {animate: true, direction: 'forward'});

        }
    };

    EventDetails(EventID) {
		
		this.localstorage.setLocalValue('EventID', EventID);

		if (EventID != 0) {

			var MassAddFlag = "0";
            var MassEvalFlag = "0";
            var MassContactFlag = "0";
            var MassEmailFlag = "0";
            var MassAgendaFlag = "0";
            var MassNotesFlag = "0";
			
            MassAddFlag = this.localstorage.getLocalValue("MassAdd");
            MassEvalFlag = this.localstorage.getLocalValue("MassEval");
            MassContactFlag = this.localstorage.getLocalValue("MassContact");
            MassEmailFlag = this.localstorage.getLocalValue("MassEmail");
            MassAgendaFlag = this.localstorage.getLocalValue("MassAgenda");
            MassNotesFlag = this.localstorage.getLocalValue("MassNotes");

            if ((MassAddFlag != "0") || (MassEvalFlag != "0") || (MassContactFlag != "0") || (MassEmailFlag != "0") || (MassAgendaFlag != "0") || (MassNotesFlag != "0")) {

                this.localstorage.setLocalValue("MassAdd", "0");
                this.localstorage.setLocalValue("MassEval", "0");
                this.localstorage.setLocalValue("MassContact", "0");
				this.localstorage.setLocalValue("MassEmail", "0");
                this.localstorage.setLocalValue("MassAgenda", "0");
                this.localstorage.setLocalValue("MassNotes", "0");
				
			} else {
				// Navigate to Exhibitor Details page
				this.navCtrl.push('EducationDetailsPage', {EventID: EventID}, {animate: true, direction: 'forward'});
			}
        }

    };

    navToNotes(EventID) {

		console.log("NoteDetails: " + EventID);
        this.localstorage.setLocalValue("MassNotes", "1");

		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
		if (AttendeeID == '' || AttendeeID == null) {
			// If not, store the page they want to go to and go to the Login page
			console.log('Stored AttendeeID: ' + AttendeeID);
			this.localstorage.setLocalValue('NavigateToPage', "NotesDetailsPage");
			this.navCtrl.push(LoginPage, {}, {animate: true, direction: 'forward'});
		} else {
			// Otherwise just go to the page they want
			this.navCtrl.push('NotesDetailsPage', {EventID: EventID}, {animate: true, direction: 'forward'});
		}

	};

    eMailCourse(CourseTitle) {

        this.localstorage.setLocalValue("MassEmail", "1");
        window.open("mailto:info@mailaddress.com?subject=" + CourseTitle + "&body=From the AACD Chicago 2018 Conference...", '_system');

    };
	
	DayUpdate(dayID) {

		switch(dayID) {
			case "Sat":
				this.localstorage.setLocalValue('ProgramDay', 'Sat');
				break;
			case "Sun":
				this.localstorage.setLocalValue('ProgramDay', 'Sun');
				break;
			case "Mon":
				this.localstorage.setLocalValue('ProgramDay', 'Mon');
				break;
			case "Tue":
				this.localstorage.setLocalValue('ProgramDay', 'Tue');
				break;
			case "Wed":
				this.localstorage.setLocalValue('ProgramDay', 'Wed');
				break;
			default:
				this.localstorage.setLocalValue('ProgramDay', 'Sat');
				break;			
		}
		
		this.ngOnInit();
		
	}

    AgendaUpdate(session, EventID, sessionCard) {

		console.log('Agenda Update called');
		console.log('Session: ' + JSON.stringify(session));
		console.log('EventID: ' + EventID);
		
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
        this.localstorage.setLocalValue("MassAdd", "1");
        this.localstorage.setLocalValue("EventID", EventID);
        this.localstorage.setLocalValue("MassAddTag", EventID);
		var flags = '';

        if (AttendeeID !== null) {
			
            if (AttendeeID.length > 0) {

				// Disable the button while we process the request
				session.btnAgendaDisable = false;
				
				var LastUpdateDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
				
                // If so, remove it
                if (session.visAgendaAddRemoveButton == "Remove") {

					console.log('Remove detected');
					
					flags = "dt|0|Alpha|" + EventID;

					this.databaseprovider.getLectureData(flags, AttendeeID).then(data => {
						
						console.log("getLectureData: " + JSON.stringify(data));

						if (data['length']>0) {

							// Values for Agenda Management
							this.localstorage.setLocalValue("AAOID", EventID);
							this.localstorage.setLocalValue("EventStartTime", data[0].session_start_time.substring(11,19));
							this.localstorage.setLocalValue("EventEndTime", data[0].session_end_time.substring(11,19));
							this.localstorage.setLocalValue("EventLocation", data[0].RoomName);
							this.localstorage.setLocalValue("EventName", data[0].session_title);
							this.localstorage.setLocalValue("EventDate", data[0].session_start_time.substring(0,10));

							var AAOID = this.localstorage.getLocalValue("AAOID");
							var EventID = this.localstorage.getLocalValue("EventID");
							var EventStartTime = this.localstorage.getLocalValue("EventStartTime");
							var EventEndTime = this.localstorage.getLocalValue("EventEndTime");
							var EventLocation = this.localstorage.getLocalValue("EventLocation");
							var EventName = this.localstorage.getLocalValue("EventName");
							EventName = EventName.replace(/'/g, "''");
							var EventDate = this.localstorage.getLocalValue("EventDate");

							// -----------------------
							// Remove Item from Agenda
							// -----------------------
							flags = 'dl|0|' + EventID + '|' + EventStartTime + '|' + EventEndTime + '|' + EventLocation + '|' + EventName + '|' + EventDate + '|' + AAOID + '|' + LastUpdateDate;
							console.log("flags: " + flags);
							
							this.databaseprovider.getAgendaData(flags, AttendeeID).then(data => {
								
								console.log("getAgendaData: " + JSON.stringify(data));

								if (data['length']>0) {

									console.log("Return status: " + data[0].DeleteStatus);

									if (data[0].DeleteStatus == "Success") {
										
										this.events.publish('user:Status', 'AgendaItem Remove');
										session.visAgendaAddRemoveButton = "Add";
										session.AgendaButtonColor = "#ffffff";
										session.AgendaButtonTextColor = "#740e88";

										// Disable the button while we process the request
										session.btnAgendaDisable = true;

										this.cd.markForCheck();
										
									} else {
										
										console.log("Return query: " + data[0].DeleteQuery);
										
										let alert = this.alertCtrl.create({
											title: 'Agenda Item',
											subTitle: 'Unable to remove the item from your agenda at this time. Please try again shortly.',
											buttons: ['OK']
										});
										
										alert.present();

										// Disable the button while we process the request
										session.btnAgendaDisable = true;

									}
									
								}

							}).catch(function () {
								console.log("Promise Rejected");
							});

						}
						
					}).catch(function () {
						console.log("Promise Rejected");
					});

                }

                // If not, add it
                if (session.visAgendaAddRemoveButton == "Add") {

					console.log('Add detected');
					
					flags = "dt|0|Alpha|" + EventID;

					this.databaseprovider.getLectureData(flags, AttendeeID).then(data => {
						
						console.log("getLectureData: " + JSON.stringify(data));

						if (data['length']>0) {

							// Values for Agenda Management
							this.localstorage.setLocalValue("AAOID", EventID);
							this.localstorage.setLocalValue("EventStartTime", data[0].session_start_time.substring(11,19));
							this.localstorage.setLocalValue("EventEndTime", data[0].session_end_time.substring(11,19));
							this.localstorage.setLocalValue("EventLocation", data[0].RoomName);
							this.localstorage.setLocalValue("EventName", data[0].session_title);
							this.localstorage.setLocalValue("EventDate", data[0].session_start_time.substring(0,10));

							var AAOID = this.localstorage.getLocalValue("AAOID");
							var EventID = this.localstorage.getLocalValue("EventID");
							var EventStartTime = this.localstorage.getLocalValue("EventStartTime");
							var EventEndTime = this.localstorage.getLocalValue("EventEndTime");
							var EventLocation = this.localstorage.getLocalValue("EventLocation");
							var EventName = this.localstorage.getLocalValue("EventName");
							EventName = EventName.replace(/'/g, "''");
							var EventDate = this.localstorage.getLocalValue("EventDate");
							
							// ------------------------
							// Add item to Agenda
							// ------------------------
							flags = 'ad|0|' + EventID + '|' + EventStartTime + '|' + EventEndTime + '|' + EventLocation + '|' + EventName + '|' + EventDate + '|' + AAOID + '|' + LastUpdateDate;
							console.log("flags: " + flags);
							
							this.databaseprovider.getAgendaData(flags, AttendeeID).then(data => {
								
								console.log("getAgendaData: " + JSON.stringify(data));

								if (data['length']>0) {

									console.log("Return status: " + data[0].AddStatus);

									if (data[0].AddStatus == "Success") {
										
										this.events.publish('user:Status', 'AgendaItem Add');
										session.visAgendaAddRemoveButton = "Remove";
										session.AgendaButtonColor = "#740e88";
										session.AgendaButtonTextColor = "#ffffff";

										// Disable the button while we process the request
										session.btnAgendaDisable = true;

										this.cd.markForCheck();
										
									} else {
										
										console.log("Return query: " + data[0].AddQuery);
										
										let alert = this.alertCtrl.create({
											title: 'Agenda Item',
											subTitle: 'Unable to add the item to your agenda at this time. Please try again shortly.',
											buttons: ['OK']
										});
										
										alert.present();
										
										// Disable the button while we process the request
										session.btnAgendaDisable = true;

									}
									
								}

							}).catch(function () {
								console.log("Promise Rejected");
							});
			
						}
						
					}).catch(function () {
						console.log("Promise Rejected");
					});
					
                }
				
            } else {
                // Not logged in
				this.localstorage.setLocalValue('NavigateToPage', "listingLevel1");
                this.localstorage.setLocalValue("LoginWarning", "2");
				this.navCtrl.push(LoginPage, {}, {animate: true, direction: 'forward'});
            }
        } else {
            // Not logged in
			this.localstorage.setLocalValue('NavigateToPage', "listingLevel1");
			this.localstorage.setLocalValue("LoginWarning", "2");
			this.navCtrl.push(LoginPage, {}, {animate: true, direction: 'forward'});
        }

    };
	
}


// Components, functions, plugins
import { Component, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Modal, ModalController, ModalOptions, NavController, NavParams, LoadingController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Localstorage } from './../../providers/localstorage/localstorage';
import { Synchronization } from "../../providers/synchronization/synchronization";

// Pages
import { HomePage } from '../home/home';
import { NotesPage } from '../notes/notes';
import { MyAgenda } from '../myagenda/myagenda';
import { MyAgendaFull } from '../myagendafull/myagendafull';
import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {

	// Setup page variables
	LoginName: string;
	LoginPassword: string;
	LoggedInUser: string = "";
	public LoginSection = false;
	public LogoutSection = false;
	public msgRequireLogin = false;
	public msgRequireLogin2 = false;
	public msgRequireLogin3 = false;
	public LoginButton = false;
	public LoginSelectButton = false;

	public login: any[] = [];
	public teammembers: any[] = [];

	constructor(public navCtrl: NavController, 
				public navParams: NavParams, 
				public http: Http, 
				private alertCtrl: AlertController, 
				private storage: Storage,
				private modal: ModalController,
				private cd: ChangeDetectorRef,
				private syncprovider: Synchronization,
				private localstorage: Localstorage,
				public events: Events,
				public loadingCtrl: LoadingController) {

				/* Determine currently logged in user */
				var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
				var LoginName = this.localstorage.getLocalValue('LoginFullName');
				
				if (AttendeeID == '' || AttendeeID == null) {
					console.log('LS AttendeeID blank');
					this.LoginSection = true;
					this.LogoutSection = false;
					this.msgRequireLogin3 = true;
				} else {
					console.log('Stored AttendeeID: ' + AttendeeID);
					this.LoginSection = false;
					this.LogoutSection = true;
					this.msgRequireLogin3 = false;
				}
				
				if (LoginName != '' && LoginName != null) {
					console.log('Stored LoginName: ' + LoginName);
					this.LoggedInUser = LoginName;
				} else {
					console.log('User not logged in');
					this.LoggedInUser = '';
				}

				var WarningStatus = this.localstorage.getLocalValue("LoginWarning");
				if (WarningStatus == "1") {			// Screen requires account access
					this.msgRequireLogin = true;
					this.msgRequireLogin2 = false;
				}
				if (WarningStatus == "2") {			// Agenda requires account access
					this.msgRequireLogin = false;
					this.msgRequireLogin2 = true;
				}

	}

	SetTeamMember(event) {
		console.log("SetTeamMember function: " + JSON.stringify(event));
	}

	// If page is in Sign In mode and user hits enter (from web version 
	// or mobile keyboard), initiate LoginUser function
	@HostListener('document:keypress', ['$event'])
		handleKeyboardEvent(event: KeyboardEvent) { 
		if (event.key == 'Enter' && this.LoginSection == true) {
			console.log('Enter key detected');
			this.LoginUser();
		}
	}

	ViewSample() {
		
		const LoginSampleModalOptions: ModalOptions = {
			enableBackdropDismiss: false
		};

		const LoginSampleModal: Modal = this.modal.create('LoginSamplePage', {}, LoginSampleModalOptions);

		LoginSampleModal.present();
		
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad LoginPage');
	}

	// Logout button clicked, clear stored values
	LogoutUser() {

		this.localstorage.setLocalValue('LoginName', '');
		this.localstorage.setLocalValue('LoginFullName', '');
		this.localstorage.setLocalValue('AttendeeID', '');
		this.localstorage.setLocalValue("loginUsername", '');
		this.localstorage.setLocalValue("loginPassword", '');
		this.localstorage.setLocalValue('LastSync', '');
		this.localstorage.setLocalValue("LoginNameInitials", '');
		this.LoginName = '';
		this.LoginPassword = '';
		this.LoggedInUser = "";

		let alert = this.alertCtrl.create({
			title: 'App Logout',
			subTitle: 'Logout successful',
			buttons: ['OK']
		});
		
		alert.present();

		this.LoginSection = true;
		this.LogoutSection = false;
		this.msgRequireLogin3 = true;

		this.events.publish('user:Status', 'Logged Out');
		
		// Get forwarding page value
		var ForwardingPage = this.localstorage.getLocalValue('ForwardingPage');
											
		switch(ForwardingPage) {
			case "HomePage":
				this.navCtrl.setRoot(HomePage);
				this.localstorage.setLocalValue('ForwardingPage', '');
				break;
		}
		
	}
	
	// Login button clicked, process input
	LoginUser() {
		
		let loading = this.loadingCtrl.create({
			spinner: 'crescent',
			content: 'Validating login...'
		});

		loading.present();

		console.log("Login button clicked.");
		console.log("User name: " + this.LoginName);
		console.log("User password: " + this.LoginPassword);

		if (this.LoginName == undefined || this.LoginPassword == undefined) {
		
			let alert = this.alertCtrl.create({
				title: 'App Login',
				subTitle: 'Both fields must be filled in before signing in.',
				buttons: ['OK']
			});
			loading.dismiss();
			alert.present();
			
		} else {
		
			// Reset stored values
			this.localstorage.setLocalValue('LoginName', '');
			this.localstorage.setLocalValue('LoginFullName', '');
			this.localstorage.setLocalValue('AttendeeID', '');
			this.localstorage.setLocalValue("loginUsername", '');
			this.localstorage.setLocalValue("loginPassword", '');
			this.localstorage.setLocalValue('LastSync', '');
			this.localstorage.setLocalValue("LoginNameInitials", '');
			
			var pushID = this.localstorage.getLocalValue('PlayerID');
			var deviceType = this.localstorage.getLocalValue('DevicePlatform');

			// Try client AMS systemLanguage
			// Not available for Prime Policy Group
			
			// Try development environment login API as a fallback
			console.log('Check development login API');
			
			var URL = 'https://primepolicy.convergence-us.com/flyinPlanner.php';
			URL = URL + '?action=authenticate';
			URL = URL + '&em=' + this.LoginName;
			URL = URL + '&ps=' + this.LoginPassword;
			URL = URL + '&pushID=' + pushID;
			URL = URL + '&deviceType=' + deviceType;
			
			console.log('Login URL: ' + URL);
			
			this.http.get(URL).map(res => res.json()).subscribe(
				data => {
					console.log("API Response: " + JSON.stringify(data)); 
					console.log("Status: " + data.status);
					console.log("Attendee ID: " + data.AttendeeID);
					console.log("Attendee Full Name: " + data.AttendeeFullName);
					console.log("Flyin Banner: " + data.FlyinBanner);
					console.log("Flyin Meeting ID: " + data.FlyinMeetingID);
					console.log("Flyin Meeting Dates: " + data.FlyinMeetingDates);
					console.log("Flyin Meeting Date Labels: " + data.FlyinMeetingDateLabels);

					// Calculate number of days for meetings
					//var dates = data.FlyinMeetingDates.split("|");
					//var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
					//var StartDate = new Date(dates[0]);
					//var EndDate = new Date(dates[1]);

					//var diffDays = Math.round(Math.abs((StartDate.getTime() - EndDate.getTime())/(oneDay)));
					var diffDays = data.FlyinMeetingDays;
					
					// Determine initials for Home screen text avatar
					var initials = data.AttendeeFullName.match(/\b\w/g) || [];
					initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
					
					// Store values
					this.localstorage.setLocalValue('LoginName', this.LoginName);
					this.localstorage.setLocalValue('LoginFullName', data.AttendeeFullName);
					this.localstorage.setLocalValue('AttendeeID', data.AttendeeID);
					this.localstorage.setLocalValue("LoginNameInitials", initials);
					this.localstorage.setLocalValue("FlyinBanner", data.FlyinBanner);
					this.localstorage.setLocalValue("FlyinMeetingID", data.FlyinMeetingID);
					this.localstorage.setLocalValue("AgendaDays", diffDays);
					this.localstorage.setLocalValue("AgendaDates", data.FlyinMeetingDates);
					this.localstorage.setLocalValue("AgendaDayButtonLabels", data.FlyinMeetingDateLabels);
					
					// Show response
					if (data.status=="200") {
						this.events.publish('user:Status', 'Logged In');
						let alert = this.alertCtrl.create({
							title: 'App Login',
							subTitle: 'Login successful',
							buttons: ['OK']
						});
						alert.present();
					}
					var LoginName = this.localstorage.getLocalValue('LoginName');
					console.log('Retrieved LoginName: ' + LoginName);

					this.syncprovider.UpdateDashboard();
					//this.events.publish('user:Status', 'Logged In');

					// Get forwarding page value
					var ForwardingPage = this.localstorage.getLocalValue('ForwardingPage');
											
					switch(ForwardingPage) {
						case "MyAgenda":
							this.navCtrl.push(MyAgenda, {}, {animate: true, direction: 'forward'}).then(() => {
								const startIndex = this.navCtrl.getActive().index - 1;
								this.navCtrl.remove(startIndex, 1);
							});
							break;
						case "MyAgendaFull":
							this.navCtrl.push(MyAgendaFull, {}, {animate: true, direction: 'forward'}).then(() => {
								const startIndex = this.navCtrl.getActive().index - 1;
								this.navCtrl.remove(startIndex, 1);
							});
							break;
						case "Notes":
							this.navCtrl.push(NotesPage, {}, {animate: true, direction: 'forward'}).then(() => {
								const startIndex = this.navCtrl.getActive().index - 1;
								this.navCtrl.remove(startIndex, 1);
							});
							break;
						case "Profile":
							this.navCtrl.push(ProfilePage, {}, {animate: true, direction: 'forward'}).then(() => {
								const startIndex = this.navCtrl.getActive().index - 1;
								this.navCtrl.remove(startIndex, 1);
							});
							break;
						default:
							// Navigate back to Home page but eliminate Back button by setting it to Root
							this.navCtrl.setRoot(HomePage);
							//this.navCtrl.setRoot(HomePage, {}, {animate: true, direction: 'forward'});
							break;
					}
					
					loading.dismiss();
					
				},
				err => {
					
					loading.dismiss();

					let alert = this.alertCtrl.create({
						title: 'App Login',
						subTitle: "We're sorry. The credentials entered could not be validated for Prime Policy. Possible reasons include:<br/> 1) You're not using the email address submitted to Prime Policy;<br/> 2) You've mistyped your email address or password.",
						buttons: ['Try Again']
					});
					
					alert.present();
					
					console.log("Error");
					var LoginName = this.localstorage.getLocalValue('LoginName');
					console.log('Retrieved LoginName [2]: ' + LoginName);
					
				}
			); 
	
		}
		
	}
	
}


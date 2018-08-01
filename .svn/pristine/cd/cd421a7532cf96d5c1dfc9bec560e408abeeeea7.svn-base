// Components, functions, plugins
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgModule } from '@angular/core';
import { IonicPage, Modal, ModalController, ModalOptions, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { Localstorage } from './../../providers/localstorage/localstorage';
import { ImageLoaderConfig } from 'ionic-image-loader';
import { Database } from './../../providers/database/database';
import { normalizeURL } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

// Preload Pages
import { LoginPage } from '../login/login';


@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePage {

	// Attendee Avatar
	public visualImageURL: string;
	public avatarDevice: boolean;
	public avatarBrowser: boolean;
	
	// Attendee ProfilePage
	public prAttendeeName: string;
	public prAttendeeTitle: string;
	public prAttendeeOrganization: string;
	
	// Social Media icons
	public statusTwitter: string;
	public statusFacebook: string;
	public statusLinkedIn: string;
	public statusInstagram: string;
	public statusPinterest: string;
	
	constructor(public navCtrl: NavController, 
				public navParams: NavParams,
				private databaseprovider: Database,
				public loadingCtrl: LoadingController,
				private alertCtrl: AlertController,
				private modal: ModalController,
				private imageLoaderConfig: ImageLoaderConfig,
				public _DomSanitizer: DomSanitizer,
				private cd: ChangeDetectorRef,
				private localstorage: Localstorage) {
	}


	ionViewDidEnter() {
		console.log('ionViewDidEnter ProfilePage');
		this.cd.markForCheck();
	}

	ngOnInit() {

		console.log('ProfilePage: ngOnInit');
		// Get AttendeeID
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
		var DevicePlatform = this.localstorage.getLocalValue('DevicePlatform');
		
		if (DevicePlatform!='Browser') {
			console.log('Set avatar to device');
			this.avatarDevice = true;
			this.avatarBrowser = false;
		} else {
			console.log('Set avatar to browser');
			this.avatarDevice = false;
			this.avatarBrowser = true;
		}
		
		// Setup defaul tprofile image
		this.imageLoaderConfig.setFallbackUrl('assets/img/personIcon.png');
		this.imageLoaderConfig.enableFallbackAsPlaceholder(true);
		
		// Get profile image if available
		let rand = Math.floor(Math.random()*20)+1;		// Prevents server caching of the image
		this.visualImageURL = "https://naeyc.convergence-us.com/AdminGateway/images/Attendees/" + AttendeeID + '.jpg?rnd=' + rand;
		console.log(this.visualImageURL);
		
		this.cd.markForCheck();

		// Get profile data
		var flags = "pr|";
		this.databaseprovider.getDatabaseStats(flags, AttendeeID).then(data => {

			if (data['length'] > 0) {

				//console.log('SocialMedia: ' + JSON.stringify(data));
				
				// Display attendee information
				this.prAttendeeName = data[0].FirstName + " " + data[0].LastName;
				this.prAttendeeTitle = data[0].Title;
				this.prAttendeeOrganization = data[0].Company;
				
				// Set color indications for social media icons
				if(data[0].showTwitter == "Y") {
					this.statusTwitter = "green";
				} else {
					this.statusTwitter = "gray";
				}
				if(data[0].showFacebook == "Y") {
					this.statusFacebook = "green";
				} else {
					this.statusFacebook = "gray";
				}
				if(data[0].showLinkedIn == "Y") {
					this.statusLinkedIn = "green";
				} else {
					this.statusLinkedIn = "gray";
				}
				if(data[0].showInstagram == "Y") {
					this.statusInstagram = "green";
				} else {
					this.statusInstagram = "gray";
				}
				if(data[0].showPinterest == "Y") {
					this.statusPinterest = "green";
				} else {
					this.statusPinterest = "gray";
				}
				
			}

			this.cd.markForCheck();
			
		}).catch(function () {
			console.log("Promise Rejected");
		});
		
	}

	UploadImage() {
		
		const AddProfileImageModalOptions: ModalOptions = {
			enableBackdropDismiss: false
		};

		const AddProfileImageModal: Modal = this.modal.create('ProfileImagePage', {}, AddProfileImageModalOptions);

		AddProfileImageModal.present();

		AddProfileImageModal.onDidDismiss((data) => {
			// If saved, then re-run ngOnInit to refresh the listing
			if (data == "Save") {
				console.log('Refreshing screen');
				this.ngOnInit();
			}
		});
				
	}

	ChangePassword() {
		
		const ChangePasswordModalOptions: ModalOptions = {
			enableBackdropDismiss: false
		};

		const ChangePasswordModal: Modal = this.modal.create('ProfilePasswordChangePage', {}, ChangePasswordModalOptions);

		ChangePasswordModal.present();
		
	}
	
	SignOut() {
	
		this.localstorage.setLocalValue('LoginWarning', '0');
		this.localstorage.setLocalValue('ForwardingPage', 'HomePage');
		this.navCtrl.push(LoginPage, {}, {animate: true, direction: 'forward'});

	}
	
	SaveProfileChanges() {
		
		// Saving progress
		let saving = this.loadingCtrl.create({
			spinner: 'crescent',
			content: 'Saving...'
		});

		// Alert for successful save
		let savealert = this.alertCtrl.create({
			title: 'Profile Changes',
			subTitle: 'The changes to your Title and Organziation have been saved.',
			buttons: ['Ok']
		});

		// Alert for failed save
		let failalert = this.alertCtrl.create({
			title: 'Profile Changes',
			subTitle: 'Unable to save your changes at this time - please try again in a little bit.',
			buttons: ['Ok']
		});

		var prTitle = this.prAttendeeTitle;
		var prOrg = this.prAttendeeOrganization;
		
		// Send data to update database with disable
		var flags = 'ps|0|0|' + prTitle + '|' + prOrg;
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
		
		this.databaseprovider.getDatabaseStats(flags, AttendeeID).then(data => {
			
			console.log("getDatabaseStats: " + JSON.stringify(data));

			if (data['length']>0) {

				if (data[0].Status == "Success") {
					
					saving.dismiss();
					savealert.present();

				} else {
					
					saving.dismiss();
					failalert.present();

				}
				
			}
		
		}).catch(function () {
			console.log("ProfileSocialMediaEntryPage Promise Rejected");
			saving.dismiss();
		});
		
	}
	
	toggleSocialMedia(smSocialMediaType) {
				
		if (this[smSocialMediaType] == "green") {
			
			// Disable onscreen button
			this[smSocialMediaType] = "gray";
			
			// Send data to update database with disable
			var flags = 'pd|' + smSocialMediaType + '|';
			var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
			
			this.databaseprovider.getDatabaseStats(flags, AttendeeID).then(data => {
				
				console.log("getDatabaseStats: " + JSON.stringify(data));

				if (data['length']>0) {

                    console.log("Return status: " + data[0].Status);
					
				}
			
			}).catch(function () {
				console.log("ProfileSocialMediaEntryPage Promise Rejected");
			});
			
		} else {
			
			// Set indicator to green and request link
			this[smSocialMediaType] = "green";
			this.localstorage.setLocalValue('SocialMediaType', smSocialMediaType);

			const AddProfileSocialMediaModalOptions: ModalOptions = {
				enableBackdropDismiss: false
			};

			const AddProfileSocialMediaModal: Modal = this.modal.create('ProfileSocialMediaEntryPage', {}, AddProfileSocialMediaModalOptions);

			AddProfileSocialMediaModal.present();

			AddProfileSocialMediaModal.onDidDismiss((data) => {
				console.log('Returned status: ' + data);
				// If saved, then re-run ngOnInit to refresh the listing
				if (data == "Save") {
					this.ngOnInit();
				}
				if (data == "NoEntry") {
					console.log('Updating: ' + smSocialMediaType);
					this[smSocialMediaType] = "gray";
					this.cd.markForCheck();
				}
				
			});
			
		}
		
	}
}


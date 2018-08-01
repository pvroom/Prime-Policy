// Components, functions, plugins
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgModule } from '@angular/core';
import { IonicPage, Modal, ModalController, ModalOptions, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { Localstorage } from './../../providers/localstorage/localstorage';
import { Database } from './../../providers/database/database';

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
	public AttendeeInitials: string;
	public avatarDevice: boolean;
	public avatarBrowser: boolean;
	
	// Attendee ProfilePage
	public prAttendeeName: string;
	
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
		var LoginNameInitials = this.localstorage.getLocalValue('LoginNameInitials');
		var LoginName = this.localstorage.getLocalValue('LoginFullName');
		this.AttendeeInitials = LoginNameInitials;		
		this.prAttendeeName = LoginName;
		
		this.cd.markForCheck();
		
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
		
}


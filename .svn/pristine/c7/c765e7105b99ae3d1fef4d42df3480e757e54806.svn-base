// Components, functions, plugins
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavParams, ViewController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Database } from './../../providers/database/database';
import { Localstorage } from './../../providers/localstorage/localstorage';

@IonicPage()
@Component({
  selector: 'page-profilepasswordchange',
  templateUrl: 'profilepasswordchange.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProfilePasswordChangePage {

	passwordOld: string;
	passwordNew1: string;
	passwordNew2: string;
	AlertMessage: string;
	passwordType: string = 'password';
	passwordIcon: string = 'eye-off';
	
	constructor(private navParams: NavParams, 
				private storage: Storage,
				private databaseprovider: Database,
				private cd: ChangeDetectorRef,
				private alertCtrl: AlertController,
				private view: ViewController,
				private localstorage: Localstorage) {
					
	}

	ngOnInit() {

	}
	
	hideShowPassword() {
		this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
		this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
	}

	closeModal(UserAction) {
		
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');

		if (UserAction == "Save") {

			var saveCheck = true;
			
			console.log('saveCheck: ' + saveCheck);
			console.log('passwordOld: ' + this.passwordOld);
			console.log('passwordNew1: ' + this.passwordNew1);
			console.log('passwordNew2: ' + this.passwordNew2);
			
			if (this.passwordOld === undefined) {
				
				let savealert1 = this.alertCtrl.create({
					title: 'Password Change',
					subTitle: 'Your old password cannot be blank.',
					buttons: ['Ok']
				});
				savealert1.present();
				
				saveCheck = false;
				
			}

			if ((saveCheck == true) && (this.passwordNew1 === undefined || this.passwordNew2 === undefined)) {
				
				let savealert2 = this.alertCtrl.create({
					title: 'Password Change',
					subTitle: 'Your new password cannot be blank.',
					buttons: ['Ok']
				});
				savealert2.present();

				saveCheck = false;
				
			}

			if ((saveCheck == true) && (this.passwordNew1 != this.passwordNew2)) {
				
				let savealert3 = this.alertCtrl.create({
					title: 'Password Change',
					subTitle: 'The new passwords do not match.',
					buttons: ['Ok']
				});
				savealert3.present();

				saveCheck = false;
				
			}
			
			if (saveCheck == true) {

				console.log('saveCheck: ' + saveCheck);
				console.log('passwordOld: ' + this.passwordOld);
				console.log('passwordNew1: ' + this.passwordNew1);
				console.log('passwordNew2: ' + this.passwordNew2);
			
				var flags = 'pw|' + this.passwordOld + '|' + this.passwordNew1;
				
				this.databaseprovider.getDatabaseStats(flags, AttendeeID).then(data => {
					
					console.log("getDatabaseStats: " + JSON.stringify(data));

					if (data['length']>0) {

						//console.log("Return status: " + JSON.stringify(data));
						var ReturnStatus = data[0].Status;
						
						switch(ReturnStatus) {
							case "Saved":
								let savealert4 = this.alertCtrl.create({
									title: 'Password Change',
									subTitle: 'Your password has been updated.',
									buttons: ['Ok']
								});
								
								savealert4.present();
								
								this.view.dismiss(UserAction);
								break;
							case "Failed":
								let savealert5 = this.alertCtrl.create({
									title: 'Password Change',
									subTitle: 'There was a problem with your entries. Either the old password is incorrect, the new one does not meet minimum requirements, or there was a problem connecting to the server. Please re-check and try again.',
									buttons: ['Ok']
								});
								savealert5.present();
								break;
							case "OldFail":
								let savealert6 = this.alertCtrl.create({
									title: 'Password Change',
									subTitle: 'Your old password is not correct. Please re-check and try again.',
									buttons: ['Ok']
								});
								savealert6.present();
								break;
						}
						
					}
				
				}).catch(function () {
					console.log("Password Change Promise Rejected");
				});
			
			}			
		}
		
		if (UserAction == "Cancel") {
			this.view.dismiss(UserAction);
		}
		
	}
}

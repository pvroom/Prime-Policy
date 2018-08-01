import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Database } from './../../providers/database/database';
import { Localstorage } from './../../providers/localstorage/localstorage';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Observable } from 'rxjs/Observable';
import { normalizeURL } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';


@IonicPage()
@Component({
  selector: 'page-profileimage',
  templateUrl: 'profileimage.html',
})
export class ProfileImagePage {

	public ProfileImageAttachment: string;
	public deviceButtons: boolean;
	public browserButtons: boolean;
	
	constructor(private navParams: NavParams, 
				private storage: Storage,
				private databaseprovider: Database,
				private view: ViewController,
				public loadingCtrl: LoadingController,
				public http: HttpClient,
				private camera: Camera,
				public _DomSanitizer: DomSanitizer,
				private localstorage: Localstorage) {
				
	}

	addCameraImage() {
		
		const options: CameraOptions = {
			quality: 80,
			destinationType: this.camera.DestinationType.DATA_URL,
			encodingType: this.camera.EncodingType.JPEG,
			correctOrientation:true,
			allowEdit: true,
			mediaType: this.camera.MediaType.PICTURE
		}

		this.camera.getPicture(options).then((imageData) => {
			// imageData is either a base64 encoded string or a file URI
			// If it's base64:
			console.log('Camera image');
			//let base64Image = 'data:image/jpeg;base64,' + imageData;
			//this.ProfileImageAttachment = base64Image;
			this.ProfileImageAttachment = 'data:image/jpeg;base64,' + imageData;
			
		}, (err) => {
			// Handle error
			console.log('Camera error');
		});

	}
	
	addGalleryImage() {
		
		const options: CameraOptions = {
			quality: 80,
			destinationType: this.camera.DestinationType.DATA_URL,
			encodingType: this.camera.EncodingType.JPEG,
			mediaType: this.camera.MediaType.PICTURE,
			correctOrientation:true,
			allowEdit: true,
			sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
		}

		this.camera.getPicture(options).then((imageData) => {
			// imageData is either a base64 encoded string or a file URI
			// If it's base64:
			console.log('Camera image');
			this.ProfileImageAttachment = 'data:image/jpeg;base64,' + imageData;
			
		}, (err) => {
			// Handle error
			console.log('Camera error');
		});

	}
	
	ionViewDidEnter() {

		var DevicePlatform = this.localstorage.getLocalValue('DevicePlatform');
		
		// Disable access to camera and gallery buttons when running in a browser
		// until the ability to pull an image via the browser can be implemented
		if (DevicePlatform == 'Browser') {
			console.log('Browser button settings');
			this.deviceButtons = false;
			this.browserButtons = true;
		} else {
			console.log('Device button settings');
			this.deviceButtons = true;
			this.browserButtons = false;
		}
		

	}
	
	closeModal(UserAction) {
		
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');

		if (UserAction == "Save") {

			// Load initial data set here
			let loading = this.loadingCtrl.create({
				spinner: 'crescent',
				content: 'Saving your profile image...'
			});

			loading.present();

			var NewFilename = AttendeeID;
			console.log('New filename: ' + NewFilename);
						
			let url = 'https://naeyc.convergence-us.com/AdminGateway/image_uploader.php';
			let postData = new FormData();
			postData.append('file', this.ProfileImageAttachment);
			postData.append('location', 'Attendees');
			postData.append('filename', NewFilename);
			postData.append('AttendeeID', AttendeeID);
			
			let data:Observable<any> = this.http.post(url, postData);
			
			data.subscribe((result) => {
				
				console.log("Image uploaded: " + JSON.stringify(result));
				loading.dismiss();
				this.view.dismiss(UserAction);

			});
							
		}
		
		if (UserAction == "Cancel") {
			this.view.dismiss(UserAction);
		}
		
	}
}

// Components, functions, plugins
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgModule } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Database } from './../../providers/database/database';
import { Localstorage } from './../../providers/localstorage/localstorage';

// Pages
import { CongressionalDetailsPage } from '../congressionaldetails/congressionaldetails';

declare var dateFormat: any;

@Component({
  selector: 'page-congressionalstaffdetails',
  templateUrl: 'congressionalstaffdetails.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CongressionalStaffDetailsPage {

	public IssueAreaListing: any[] = [];
	public CongressionalMemberList: any[] = [];
	public visualImageURL: string;
	public visualDisplayName: string;
	public visualTitle: string;
	
	public visEmail: string;
	public visPhone: string;
	public visFax: string;
	
	public showContactPhone = false;
	public showContactEmail = false;
	public showContactFax = false;
	
	// Leaflet mapping variables
	myMap: any;

	constructor(public navCtrl: NavController, 
				public navParams: NavParams,
				private storage: Storage,
				private databaseprovider: Database,
				private cd: ChangeDetectorRef,
				public loadingCtrl: LoadingController,
				public alertCtrl: AlertController,
				private localstorage: Localstorage) {
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad CongressionalStaffDetailsPage');
	}
	
	//ionViewWillLeave() {
	//	console.log('ionViewWillLeave CongressionalDetailsPage');
	//	console.log('ionViewWillLeave: Remove map: ' + this.myMap);
	//	console.log(this.myMap);
	//	if (this.myMap != undefined || this.myMap != null) {
	//		this.myMap.off();
	//		this.myMap.remove();
	//	}
	//}
	
	//ionViewCanLeave(){
	//	document.getElementById("map2").outerHTML = "";
	//}
	
    navToWeb(WebsiteURL) {

        if (WebsiteURL === undefined || WebsiteURL === null) {
			let alert = this.alertCtrl.create({
				title: 'Committee Links',
				subTitle: 'That committee does not have an external website link assigned to it.',
				cssClass: 'alertStyle',
				buttons: ['OK']
			});
			alert.present();
        } else {
            // Initiate web browser
            if ((WebsiteURL.substring(0, 7) != "http://") && (WebsiteURL.substring(0, 8) != "https://")) {
                WebsiteURL = "http://" + WebsiteURL;
            }
			
			console.log('Congressional Details: Navigating to: ' + WebsiteURL);
            window.open(WebsiteURL, '_system');
        }

    };

    navToEmail(EmailAddress) {
        if (EmailAddress === undefined) {
            // Do nothing
        } else {
            // Initiate mail program
            //window.open('mailto:' + EmailAddress + '?subject=Question via Prime Policy', '_system', 'location=yes');
            window.open('mailto:' + EmailAddress, '_system', 'location=yes');
        }

    };

	callPhone2(phoneNumber) {
        console.log("Dialer version 2");
		var DevicePlatform = this.localstorage.getLocalValue('DevicePlatform');
		
		if (DevicePlatform!='Browser') {
			if ((phoneNumber === undefined) || (phoneNumber == '')) {
				console.log('No phone number defined');
				// Do nothing
			} else {
				// remove all other characters from phone number string
				// phoneNumber = phoneNumber.replace(/-/g, '');
				phoneNumber = phoneNumber.replace('(', '');
				phoneNumber = phoneNumber.replace(')', '');
				phoneNumber = phoneNumber.replace(' ', '-');

				console.log('Dialer: tel:' + phoneNumber);

				window.open(`tel:${phoneNumber}`, '_system');
				
				//window['plugins'].CallNumber.callNumber(function onSuccess(result){
				//	console.log("Dialer Success:" + JSON.stringify(result));
				//},
				//function onError(result) {
				//	console.log("Dialer Error:" + JSON.stringify(result));
				//}, phoneNumber, false);

			}
		}
    }

	ngOnInit() {

		// Load initial data set here
		//let loading = this.loadingCtrl.create({
		//	spinner: 'crescent',
		//	content: 'Please wait...'
		//});

		//loading.present();

		// Blank and show loading info
		this.IssueAreaListing = [];
		this.CongressionalMemberList = [];
		this.cd.markForCheck();
		
		// Temporary use variables
		var flags = "sd|Alpha|0|0|" + this.navParams.get('cmsID');
        var DisplayName = "";
        var BioDisplay = "";
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
		
		// Get the data
		this.databaseprovider.getCongressionalData(flags, AttendeeID).then(data => {
			
			console.log("getCongressionalData: " + JSON.stringify(data));

			if (data['length']>0) {
				
				DisplayName = "";

				// Concatenate fields to build displayable name
				DisplayName = data[0].FirstName;
				DisplayName = DisplayName + " " + data[0].LastName;
				
				this.visualTitle = data[0].Title;
				
				// Contact Information
				if (data[0].Email != "" && data[0].Email != null) {
					this.visEmail = data[0].Email;
					this.showContactEmail = true;
				} else {
					this.showContactEmail = false;
				}
				if (data[0].Phone != "" && data[0].Phone != null) {
					this.visPhone = data[0].Phone;
					this.showContactPhone = true;
				} else {
					this.showContactPhone = false;
				}
				if (data[0].Fax != "" && data[0].Fax != null) {
					this.visFax = data[0].Fax;
					this.showContactFax = true;
				} else {
					this.showContactFax = false;
				}
				
				// Thumbnail
				if (data[0].imageFilename != "" && data[0].imageFilename != null) {
					var imageURL = "assets/img/CongressionalMembers/" + data[0].imageFilename;
					this.visualImageURL = imageURL;
					console.log("ImageURL: " + imageURL);
				}
				
				this.visualDisplayName = DisplayName;
				
				
				// Get issue area records
				flags = "ia|Alpha|0|0|" + this.navParams.get('cmsID');
				
				console.log('Getting issue area listing');
				
				// Get the list of committees relevant to this speaker
				this.databaseprovider.getCongressionalData(flags, "0").then(data2 => {
					
					console.log("getCongressionalData, issue area data: " + JSON.stringify(data2));
					console.log('getCongressionalData issue area records: ' + data2['length']);
					
					if (data2['length']>0) {
						
						for (var i = 0; i < data2['length']; i++) {

							var ia = data2[i].IssueArea;
							ia = ia.replace(/(?:\\[rn]|[\r\n]+)+/g, '');
							console.log('Issue Area Name: ' + ia);
							
							this.IssueAreaListing.push({
								DisplayIssueAreaName: ia
							});

						}


					} else {
						
						// No records to show
						this.IssueAreaListing.push({
							DisplayIssueAreaName: "Not assigned to any issue areas"
						});

					}

					this.cd.markForCheck();
					
				}).catch(function () {
					console.log("Issue Area Promise Rejected");
				});



				// --------------------------------
                // Get Linked Congressional Members
                // --------------------------------				
				var flags = "cm|Alpha|0|0|" + this.navParams.get('cmsID');
				
				this.databaseprovider.getCongressionalData(flags, AttendeeID).then(data2 => {
					
					console.log("getCongressionalData, Congressional Members: " + JSON.stringify(data2));

					if (data2['length']>0) {
					
						console.log("getCongressionalData, Congressional Members, Record count: " + data2['length']);
					
						for (var i = 0; i < data2['length']; i++) {

							DisplayName = "";
							
							console.log("getCongressionalData, Congressional Members, Build DisplayName: " + DisplayName);

							// Concatenate fields to build displayable name
							DisplayName = DisplayName + data2[i].LastName;
							
							console.log("getCongressionalData, Congressional Members, Build DisplayName: " + DisplayName);
							
							if (data2[i].Suffix != "" && data2[i].Suffix != null) {
								DisplayName = DisplayName + " " + data2[i].Suffix;
								console.log("getCongressionalData, Congressional Members, Build DisplayName: " + DisplayName);
							}

							// If available, use Nickname field for First Name
							if (data2[i].Nickname != "" && data2[i].Nickname != null) {
								DisplayName = DisplayName + ", " + data2[i].Nickname;
							} else {
								DisplayName = DisplayName + ", " + data2[i].FirstName;
							}
							
							console.log("getCongressionalData, Congressional Members, Build DisplayName: " + DisplayName);
							
							if (data2[i].MiddleInitial != "" && data2[i].MiddleInitial != null) {
								DisplayName = DisplayName + " " + data2[i].MiddleInitial;
								console.log("getCongressionalData, Congressional Members, Build DisplayName: " + DisplayName);
							}
							
							var imageAvatar = "";
							var navArrow = "";
							var visDisplayPartyState = "";
							
							visDisplayPartyState = data2[i].Chamber + " - " + data2[i].Party + " - " + data2[i].State;
							imageAvatar = data2[i].imageFilename;
							imageAvatar = "assets/img/CongressionalMembers/" + imageAvatar;
							navArrow = "arrow-dropright";

							this.CongressionalMemberList.push({
								Avatar: imageAvatar,
								navigationArrow: navArrow,
								cmID: data2[i].congressionalMemberID,
								DisplayNameLastFirst: DisplayName,
								DisplayPartyState: visDisplayPartyState
							});

							console.log("getCongressionalData, Congressional Members, Added entry to Congressioanl Member array");
							
						}
						
						console.log("getCongressionalData, Congressional Members, Setting Congressioanl array to visible");
						this.cd.markForCheck();
						
					}
					
				}).catch(function () {
					console.log("Linked Congressional Members Promise Rejected");
				});
				
			}

			this.cd.markForCheck();

			//loading.dismiss();
			
		}).catch(error => {
			console.log("Congressional Staff Data Promise Rejected: " + error);
		});
		
	}

    CongressionalMemberDetails(MemberID) {
		
		this.navCtrl.push(CongressionalDetailsPage, {cmID: MemberID}, {animate: true, direction: 'forward'});

    };

}






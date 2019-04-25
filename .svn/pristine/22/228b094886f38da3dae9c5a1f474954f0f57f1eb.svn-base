// Components, functions, plugins
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgModule } from '@angular/core';
import { Modal, ModalController, ModalOptions, LoadingController, ToastController, Events } from 'ionic-angular';
import { NavController, NavParams, AlertController, FabContainer } from 'ionic-angular';
//import 'rxjs/add/operator/map';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Database } from "../../providers/database/database";
import { Localstorage } from '../../providers/localstorage/localstorage';
import { Synchronization } from "../../providers/synchronization/synchronization";
import { Observable } from 'rxjs/Rx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SMS } from '@ionic-native/sms';
import { CallNumber } from '@ionic-native/call-number';
import { StatusBar } from '@ionic-native/status-bar';

// Preload Pages
import { MorePage } from '../more/more';
import { HelpPage } from '../help/help';
import { ConferenceCityPage } from '../conferencecity/conferencecity';
import { CongressionalDetailsPage } from '../congressionaldetails/congressionaldetails';
import { MapPage } from '../map/map';
import { MeetingDetailsPage } from '../meetingdetails/meetingdetails';
import { NotesPage } from '../notes/notes';
import { MyAgenda } from '../myagenda/myagenda';
import { LoginPage } from '../login/login';
import { ProfilePage } from '../profile/profile';

declare var formatTime: any;
declare var dateFormat: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HomePage {
	
	morePage = MorePage;
	helpPage = HelpPage;
	conferenceCityPage = ConferenceCityPage;
	mapPage = MapPage;
	notesPage = NotesPage;
	myAgendaPage = MyAgenda;
	loginPage = LoginPage;

	// Setup page variables
	public DevicePlatform: string;
	LogInOutIcon: string;
	LoggedInUser: string;
	AttendeeInitials: string;
	
	// Setup Menu Style variables
	public DisplayMenuVertical = false;
	public DisplayMenuGrid = false;
	public DisplayMenuDashboard = false;
	
	public MenuBackground: string;
	public appBanner: string;

	public upcomingAgendaItems: any[] = [];
	public upcomingContacts: any[] = [];
	public creditsTypeL: string;
	public creditsTypeP: string;

    public subscription;
    public DCsubscription;
    public i = 0;
	private db: SQLiteObject;
	public NewMessagesIndicator = false;
	public UserLoggedIn = false;

	public DisplayFABCall = false;
	public DisplayFABSMS = false;

	constructor(public navCtrl: NavController, 
				public alertCtrl: AlertController,
				private nav: NavController,
				private readonly loadingCtrl: LoadingController,
				private readonly toastCtrl: ToastController, 
				private storage: Storage,
				private statusBar: StatusBar,
				private databaseprovider: Database,
				private syncprovider: Synchronization,
				private cd: ChangeDetectorRef,
				public pltfrm: Platform,
				private sqlite: SQLite,
				private modal: ModalController,
				//private callNumber: CallNumber,
				public events: Events,
				private sms: SMS,
				private localstorage: Localstorage) {


				// Determine platform that the app is running on
				pltfrm.ready().then(() => {
					
					this.DevicePlatform = "Browser";
					if (pltfrm.is('android')) {
						console.log("Home: Running on an Android device!");
						this.DevicePlatform = "Android";
						this.connectToDb();
					}
					if (pltfrm.is('ios')==true && pltfrm.is('mobileweb')==false) {
						console.log("Home: Running the app on an iOS device!");
						this.DevicePlatform = "iOS";
						this.connectToDb();
					}
					if (pltfrm.is('ios')==true && pltfrm.is('mobileweb')==true) {
						console.log("Home: Running on browser on an iOS device!");
						this.DevicePlatform = "Browser";
						this.connectToDb();
					}

					console.log("Home: App platform: " + this.DevicePlatform);
					this.localstorage.setLocalValue('DevicePlatform', this.DevicePlatform);
					
				}).catch(function () {
					console.log("Home: Promise Rejected");
				});
				
				// Listen for staff change events and 
				// refresh the main page
				this.events.subscribe('user:Staff', (statusType) => {
					console.log('Home: Staff has ', statusType);
					this.ReLoadHome();
				});
				
	}


	private connectToDb(): void {

		console.log('Home: Connecting to DB...');
		this.sqlite.create({name: 'flyinPlanner.db', location: 'default', createFromLocation: 1}).then((db: SQLiteObject) => {
			console.log('Home: Connected.');
			this.db = db;
			//this.createTables();
			
		})
	}

	imageExists(url, callback) {
		var img = new Image();
		img.onload = function() { callback('true'); };
		img.onerror = function() { callback('false'); };
		img.src = url;
	}

	ionViewWillEnter() {
		
		// Activate menu style accoridng to stored value
		console.log('Home: ionViewWillEnter: HomePage');
		
		// Determine screen aspect ratio to set the number
		// of upcoming agenda items to display
		var DefaultAgendaRows = 4;
		
		this.pltfrm.ready().then(() => {
			
			console.log('ionViewWillEnter, this.platform.width(): ' + this.pltfrm.width());
			console.log('ionViewWillEnter, this.platform.height(): ' + this.pltfrm.height());
			var AspectRatio = this.pltfrm.height() / this.pltfrm.width();
			
			if (AspectRatio <= 0.80) {
				DefaultAgendaRows = 4;
			}
			if (AspectRatio > 0.80 && AspectRatio <= 1.07) {
				DefaultAgendaRows = 5;
			}
			if (AspectRatio > 1.07) {
				DefaultAgendaRows = 6;
			}			
			console.log('ionViewWillEnter, AspectRatio: ' + AspectRatio);
			console.log('ionViewWillEnter, DefaultAgendaRows: ' + DefaultAgendaRows);
			
		});

		// Show home screen layout style
		var HomeLayoutStyle = this.localstorage.getLocalValue('HomeLayoutStyle');
		switch(HomeLayoutStyle) {
			case "List":
				this.DisplayMenuVertical = true;
				this.DisplayMenuGrid = false;
				this.DisplayMenuDashboard = false;
				break;
			case "Grid":
				this.DisplayMenuVertical = false;
				this.DisplayMenuGrid = true;
				this.DisplayMenuDashboard = false;
				break;
			case "Dashboard":
				this.DisplayMenuVertical = false;
				this.DisplayMenuGrid = false;
				this.DisplayMenuDashboard = true;
				break;
			default:
				this.DisplayMenuVertical = true;
				this.DisplayMenuGrid = false;
				this.DisplayMenuDashboard = false;
				break;
		}
		
		var HomeBackground = this.localstorage.getLocalValue('HomeBackground');
		this.MenuBackground = HomeBackground || 'bgCityscape';

		// Determine currently logged in user
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
		var LoginName = this.localstorage.getLocalValue('LoginFullName');
		var LoginNameInitials = this.localstorage.getLocalValue('LoginNameInitials');
		var DevPlatform = this.localstorage.getLocalValue('DevicePlatform');
		if (AttendeeID == '' || AttendeeID == null) {
			console.log('Home: AttendeeID blank');
			this.LogInOutIcon = 'log-in';
			this.cd.markForCheck();
		} else {
			console.log('Home: Stored AttendeeID: ' + AttendeeID);
			this.LogInOutIcon = '';
			this.UserLoggedIn = true;
			this.DisplayFABCall = true;
			this.DisplayFABSMS = true;
			this.cd.markForCheck();
		}
		
		if (LoginName != '' && LoginName != null && LoginName != 'undefined') {
			console.log('Home: Stored LoginName: ' + LoginName);
			//this.LoggedInUser = LoginName;
			this.AttendeeInitials = LoginNameInitials;
			var FlyinBanner = this.localstorage.getLocalValue("FlyinBanner");
			console.log('ionViewWillEnter, FlyinBanner: ' + FlyinBanner);
			console.log('ionViewWillEnter, FlyinBanner length: ' + FlyinBanner.length);
			
			if (DevPlatform == 'iOS' || DevPlatform == 'Android') {
				if (FlyinBanner == null) {
					this.appBanner = 'assets/img/FlyinBanners/default.png';
					this.cd.markForCheck();
				} else {
					if (FlyinBanner.length==0 || FlyinBanner == 'null') {
						this.appBanner = 'assets/img/FlyinBanners/default.png';
					} else {
						this.appBanner = 'assets/img/FlyinBanners/' + FlyinBanner;
					}
					this.cd.markForCheck();
				}
				
				/*
				// Banner from local assets folder
				if (FlyinBanner == null) {
					this.appBanner = 'assets/img/FlyinBanners/PPGBanner.png';
				} else {
					if (FlyinBanner.length==0) {
						this.appBanner = 'assets/img/FlyinBanners/PPGBanner.png';
					} else {
						var self=this;
						var BannerOnline = 'false';
						var BannerOffline = 'false';
						// Check for local copy in assets
						var imageUrl = 'assets/img/FlyinBanners/' + FlyinBanner;
						console.log('Checking for offline banner...');
						self.imageExists(imageUrl, function(exists) {
							BannerOffline = exists;
							var FlyinBanner = self.localstorage.getLocalValue("FlyinBanner");
							console.log('RESULT: url=' + imageUrl + ', exists=' + exists);
							if (BannerOffline == 'true') {
								self.appBanner = 'assets/img/FlyinBanners/' + FlyinBanner;
							} else {
								// Check for version on server
								var imageUrl2 = 'https://demoflyin.convergence-us.com/AdminGateway/images/FlyinBanners/' + FlyinBanner;
								console.log('Checking for online banner...');
								self.imageExists(imageUrl2, function(exists) {
									BannerOnline = exists;
									var FlyinBanner = self.localstorage.getLocalValue("FlyinBanner");
									console.log('RESULT: url=' + imageUrl2 + ', exists=' + exists);
							
									// Based on available banner images, prioritize the online
									// version over the offline version.  When none are available
									// then use the default banner
									if (BannerOnline == 'true' && BannerOffline == 'false') {
										var randNum = Math.floor((Math.random() * 100) + 1);
										self.appBanner = 'https://demoflyin.convergence-us.com/AdminGateway/images/FlyinBanners/' + FlyinBanner + '?rnd=' + randNum;
									}
									//if (BannerOffline == 'true') {
									//	self.appBanner = 'assets/img/FlyinBanners/' + FlyinBanner;
									//}
									if (BannerOnline == 'false' && BannerOffline == 'false') {
										self.appBanner = 'assets/img/FlyinBanners/PPGBanner.png';
									}
								});
							}
						});
					}
				}
				*/
				
			} else {
				
				var randNum = Math.floor((Math.random() * 100) + 1);
				if (FlyinBanner == null) {
					this.appBanner = 'https://primepolicy.convergence-us.com/AdminGateway/images/FlyinBanners/default.png?rnd=' + randNum;
				} else {
					if (FlyinBanner.length==0) {
						this.appBanner = 'https://primepolicy.convergence-us.com/AdminGateway/images/FlyinBanners/default.png?rnd=' + randNum;
					} else {
						// Banner from server images folder
						this.appBanner = 'https://primepolicy.convergence-us.com/AdminGateway/images/FlyinBanners/' + FlyinBanner + '?rnd=' + randNum;
					}
				}
			}
			console.log('Flyin Banner: ' + this.appBanner);
			this.UserLoggedIn = true;

		} else {
			console.log('Home: User not logged in');
			this.LoggedInUser = 'Sign In';
			this.localstorage.setLocalValue('LoginName', '');
			this.localstorage.setLocalValue('LoginFullName', '');
			this.localstorage.setLocalValue('AttendeeID', '');
			this.localstorage.setLocalValue("loginUsername", '');
			this.localstorage.setLocalValue("loginPassword", '');
			this.localstorage.setLocalValue("LoginNameInitials", '');
			this.localstorage.setLocalValue("FlyinBanner", '');
			this.localstorage.setLocalValue("FlyinMeetingID", '');
			this.localstorage.setLocalValue("AgendaDays", '');
			this.localstorage.setLocalValue("AgendaDates", '');
			this.localstorage.setLocalValue("AgendaDayButtonLabels", '');
			this.appBanner = 'assets/img/FlyinBanners/default.png';
		}

		this.cd.markForCheck();

		// Temporary use variables
		var flags;
		var visStartTime;
		var visEndTime;
		var eventIcon;
		var visEventName;
		var visEventLocation;
		var visAvatar;
		var eventAvatar;
		var maxRecs;

		// Reset mass variables
		this.localstorage.setLocalValue("MassAdd", "0");
        this.localstorage.setLocalValue("MassEval", "0");
		this.localstorage.setLocalValue("MassContact", "0");
		this.localstorage.setLocalValue("MassEmail", "0");
		this.localstorage.setLocalValue("MassAgenda", "0");
		this.localstorage.setLocalValue("MassNotes", "0");

		// Get the data
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
		var flyinID = this.localstorage.getLocalValue('FlyinMeetingID');
		visAvatar = true;

		console.log('Home, ionViewWillEnter: Refresh Upcoming Agenda');

		this.RefreshUpcomingAgenda();
		
	}

	ReLoadHome() {

		// Activate menu style accoridng to stored value
		console.log('Home: ReLoadHome: HomePage');
		
		// Determine screen aspect ratio to set the number
		// of upcoming agenda items to display
		var DefaultAgendaRows = 4;
		
		this.pltfrm.ready().then(() => {
			
			console.log('ReLoadHome, this.platform.width(): ' + this.pltfrm.width());
			console.log('ReLoadHome, this.platform.height(): ' + this.pltfrm.height());
			var AspectRatio = this.pltfrm.height() / this.pltfrm.width();
			
			if (AspectRatio <= 0.80) {
				DefaultAgendaRows = 4;
			}
			if (AspectRatio > 0.80 && AspectRatio <= 1.07) {
				DefaultAgendaRows = 5;
			}
			if (AspectRatio > 1.07) {
				DefaultAgendaRows = 6;
			}			
			console.log('ReLoadHome, AspectRatio: ' + AspectRatio);
			console.log('ReLoadHome, DefaultAgendaRows: ' + DefaultAgendaRows);
			
		});

		// Show home screen layout style
		var HomeLayoutStyle = this.localstorage.getLocalValue('HomeLayoutStyle');
		switch(HomeLayoutStyle) {
			case "List":
				this.DisplayMenuVertical = true;
				this.DisplayMenuGrid = false;
				this.DisplayMenuDashboard = false;
				break;
			case "Grid":
				this.DisplayMenuVertical = false;
				this.DisplayMenuGrid = true;
				this.DisplayMenuDashboard = false;
				break;
			case "Dashboard":
				this.DisplayMenuVertical = false;
				this.DisplayMenuGrid = false;
				this.DisplayMenuDashboard = true;
				break;
			default:
				this.DisplayMenuVertical = true;
				this.DisplayMenuGrid = false;
				this.DisplayMenuDashboard = false;
				break;
		}
		
		var HomeBackground = this.localstorage.getLocalValue('HomeBackground');
		this.MenuBackground = HomeBackground || 'bgCityscape';

		// Determine currently logged in user
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
		var LoginName = this.localstorage.getLocalValue('LoginFullName');
		var LoginNameInitials = this.localstorage.getLocalValue('LoginNameInitials');
		var DevPlatform = this.localstorage.getLocalValue('DevicePlatform');
		if (AttendeeID == '' || AttendeeID == null) {
			console.log('ReLoadHome: AttendeeID blank');
			this.LogInOutIcon = 'log-in';
			this.cd.markForCheck();
		} else {
			console.log('ReLoadHome: Stored AttendeeID: ' + AttendeeID);
			this.LogInOutIcon = '';
			this.UserLoggedIn = true;
			this.DisplayFABCall = true;
			this.DisplayFABSMS = true;
			this.cd.markForCheck();
		}
		
		if (LoginName != '' && LoginName != null && LoginName != 'undefined') {
			console.log('ReLoadHome: Stored LoginName: ' + LoginName);
			//this.LoggedInUser = LoginName;
			this.AttendeeInitials = LoginNameInitials;
			var FlyinBanner = this.localstorage.getLocalValue("FlyinBanner");
			console.log('ReLoadHome, FlyinBanner: ' + FlyinBanner);
			console.log('ReLoadHome, FlyinBanner length: ' + FlyinBanner.length);
			
			if (DevPlatform == 'iOS' || DevPlatform == 'Android') {
				if (FlyinBanner == null) {
					this.appBanner = 'assets/img/FlyinBanners/default.png';
					this.cd.markForCheck();
				} else {
					if (FlyinBanner.length==0 || FlyinBanner == 'null') {
						this.appBanner = 'assets/img/FlyinBanners/default.png';
					} else {
						this.appBanner = 'assets/img/FlyinBanners/' + FlyinBanner;
					}
					this.cd.markForCheck();
				}
				
				/*
				// Banner from local assets folder
				if (FlyinBanner == null) {
					this.appBanner = 'assets/img/FlyinBanners/PPGBanner.png';
				} else {
					if (FlyinBanner.length==0) {
						this.appBanner = 'assets/img/FlyinBanners/PPGBanner.png';
					} else {
						var self=this;
						var BannerOnline = 'false';
						var BannerOffline = 'false';
						// Check for local copy in assets
						var imageUrl = 'assets/img/FlyinBanners/' + FlyinBanner;
						console.log('ReLoadHome: Checking for offline banner...');
						self.imageExists(imageUrl, function(exists) {
							BannerOffline = exists;
							var FlyinBanner = self.localstorage.getLocalValue("FlyinBanner");
							console.log('ReLoadHome: RESULT: url=' + imageUrl + ', exists=' + exists);
							if (BannerOffline == 'true') {
								self.appBanner = 'assets/img/FlyinBanners/' + FlyinBanner;
							} else {
								// Check for version on server
								var imageUrl2 = 'https://demoflyin.convergence-us.com/AdminGateway/images/FlyinBanners/' + FlyinBanner;
								console.log('ReLoadHome: Checking for online banner...');
								self.imageExists(imageUrl2, function(exists) {
									BannerOnline = exists;
									var FlyinBanner = self.localstorage.getLocalValue("FlyinBanner");
									console.log('ReLoadHome: RESULT: url=' + imageUrl2 + ', exists=' + exists);
							
									// Based on available banner images, prioritize the online
									// version over the offline version.  When none are available
									// then use the default banner
									if (BannerOnline == 'true' && BannerOffline == 'false') {
										var randNum = Math.floor((Math.random() * 100) + 1);
										self.appBanner = 'https://demoflyin.convergence-us.com/AdminGateway/images/FlyinBanners/' + FlyinBanner + '?rnd=' + randNum;
									}
									//if (BannerOffline == 'true') {
									//	self.appBanner = 'assets/img/FlyinBanners/' + FlyinBanner;
									//}
									if (BannerOnline == 'false' && BannerOffline == 'false') {
										self.appBanner = 'assets/img/FlyinBanners/PPGBanner.png';
									}
								});
							}
						});
					}
				}
				*/
				
			} else {
				
				var randNum = Math.floor((Math.random() * 100) + 1);
				if (FlyinBanner == null) {
					this.appBanner = 'https://primepolicy.convergence-us.com/AdminGateway/images/FlyinBanners/default.png?rnd=' + randNum;
				} else {
					if (FlyinBanner.length==0) {
						this.appBanner = 'https://primepolicy.convergence-us.com/AdminGateway/images/FlyinBanners/default.png?rnd=' + randNum;
					} else {
						// Banner from server images folder
						this.appBanner = 'https://primepolicy.convergence-us.com/AdminGateway/images/FlyinBanners/' + FlyinBanner + '?rnd=' + randNum;
					}
				}
			}
			console.log('ReLoadHome: Flyin Banner: ' + this.appBanner);
			this.UserLoggedIn = true;

		} else {
			console.log('ReLoadHome: User not logged in');
			this.LoggedInUser = 'Sign In';
			this.localstorage.setLocalValue('LoginName', '');
			this.localstorage.setLocalValue('LoginFullName', '');
			this.localstorage.setLocalValue('AttendeeID', '');
			this.localstorage.setLocalValue("loginUsername", '');
			this.localstorage.setLocalValue("loginPassword", '');
			this.localstorage.setLocalValue("LoginNameInitials", '');
			this.localstorage.setLocalValue("FlyinBanner", '');
			this.localstorage.setLocalValue("FlyinMeetingID", '');
			this.localstorage.setLocalValue("AgendaDays", '');
			this.localstorage.setLocalValue("AgendaDates", '');
			this.localstorage.setLocalValue("AgendaDayButtonLabels", '');
			this.appBanner = 'assets/img/FlyinBanners/default.png';
		}

		this.cd.markForCheck();

		// Temporary use variables
		var flags;
		var visStartTime;
		var visEndTime;
		var eventIcon;
		var visEventName;
		var visEventLocation;
		var visAvatar;
		var eventAvatar;
		var maxRecs;

		// Reset mass variables
		this.localstorage.setLocalValue("MassAdd", "0");
        this.localstorage.setLocalValue("MassEval", "0");
		this.localstorage.setLocalValue("MassContact", "0");
		this.localstorage.setLocalValue("MassEmail", "0");
		this.localstorage.setLocalValue("MassAgenda", "0");
		this.localstorage.setLocalValue("MassNotes", "0");

		// Get the data
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
		var flyinID = this.localstorage.getLocalValue('FlyinMeetingID');
		visAvatar = true;

		console.log('Home, ReLoadHome: Refresh Upcoming Agenda');

		this.RefreshUpcomingAgenda();

	}
	
	ionViewDidEnter() {
		
		console.log('Home: ionViewDidEnter: HomePage');
			
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
		var LoginName = this.localstorage.getLocalValue('LoginName');

		var AutoSync = this.localstorage.getLocalValue('AutoSync');
		//var DirectChatMonitoring = this.localstorage.getLocalValue('DirectChatMonitoring');
		
		// Check to start AutoSync if not running a browser and user is logged in
		//if ((this.DevicePlatform != "Browser") && (AttendeeID !== null && AttendeeID != '')) {
		//if (this.DevicePlatform != "Browser") {
			
			// If AutoSync = 0 then it has been disabled
			if (AutoSync != '0') {
				
				if (AutoSync == '' || AutoSync == null) {

					console.log('Home: First AutoSync');

					// Set localstorage value with length in minutes
					this.localstorage.setLocalValue('AutoSync', '10');
					// First time startup of AutoSync
					this.startAutoSync2();
					
				} else {
					
					// Reset AutoSync when entering the Home page (either from fresh start
					// or coming back within the same instance of the app)
					console.log('Home: Stop/Start AutoSync');
					this.stopAutoSync2();
					this.startAutoSync2();
					
				}
			
			}
		
		//} else {
		
		//	console.log('Home: AutoSync disabled because platform is browser');
			
		//}
	
		// Check on first run in order to reset AutoSync
		var AutoSyncReset = this.localstorage.getLocalValue('AutoSyncReset');
		
		if (AutoSyncReset == '' || AutoSyncReset == null) {

			// If first run, check if platform is not web browser			
			//if (this.DevicePlatform != "Browser") {
				
				// Reset AutoSync and then disable this section of code by setting 
				// the localstorage value to 1
				var DefaultSyncStart = this.localstorage.getLocalValue('DefaultSyncStart');
				this.localstorage.setLocalValue('LastSync', DefaultSyncStart);		
				this.localstorage.setLocalValue('AutoSyncReset', '1');		
			
			//}
			
		}
	
	}
	
	startAutoSync2() {

		console.log('Start AutoSync');
		console.log('Home: AutoSync subscription value: ' + this.subscription);
		// Set sync interval
		// Entry is in milliseconds
		// 600000 for every 10 minutes
		// 60000 for every minute
		// 30000 for every 30 seconds (for testing)

		this.subscription = Observable.interval(60000).subscribe(x => {
		
			console.log('Home: AutoSync processing...');
			// Previously successful sync time
			var DefaultSyncStart = this.localstorage.getLocalValue('DefaultSyncStart');
			var LastSync3 = this.localstorage.getLocalValue('LastSync');
			if (LastSync3 == '' || LastSync3 === null) {
				LastSync3 = DefaultSyncStart;
			}
			var LastSync2 = new Date(LastSync3).toUTCString();
			var LastSync = dateFormat(LastSync2, "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'");
			
			// Current sync time in UTC
			var ThisSync2 = new Date().toUTCString();
			var ThisSync = dateFormat(ThisSync2, "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'");

			console.log('Home: AutoSync event: ' + this.i);
			console.log('Sync period: ' + LastSync + ' to ' + ThisSync);
			this.i++;
			
			// Call AutoSync service in providers
			this.syncprovider.DBSyncUpdateM2S(LastSync, ThisSync).then(data => {
				
				console.log('Home: Executed UpdateM2S Sync: ' + data);
				
				// Update LastSync date for next run
				this.localstorage.setLocalValue('LastSync', ThisSync);
				
				console.log('Home: Refreshing Upcoming Agenda display');
				this.RefreshUpcomingAgenda();
				
				// Trigger update to the staff fly-in dropdown
				this.events.publish('user:StaffSync', 'Update Dropdown');
				
			}).catch(function () {
				console.log("Home: UpdateM2S Sync Promise Rejected");
			});
			this.syncprovider.DBSyncUpdateS2M(LastSync, ThisSync).then(data => {
				console.log('Home: Executed UpdateS2M Sync: ' + data);
				// Update LastSync date for next run
				this.localstorage.setLocalValue('LastSync', ThisSync);
				console.log('Home: Refreshing Upcoming Agenda display');
				this.RefreshUpcomingAgenda();
			}).catch(function () {
				console.log("Home: UpdateS2M Sync Promise Rejected");
			});

			
		});
	}
	
	stopAutoSync2() {

		console.log('Home: Stop AutoSync check');
		console.log('Home: AutoSync subscription value: ' + this.subscription);
		if (this.subscription != null) {
			console.log('Home: Stop AutoSync');
			this.subscription.unsubscribe();
		}
		
	}

	RefreshUpcomingAgenda() {
	
		console.log('Home: RefreshUpcomingAgenda');
		
		// Temporary use variables
		var flags;
		var visStartTime;
		var visEndTime;
		var eventIcon;
		var visEventName;
		var visEventLocation;
		var visAvatar;
		var eventAvatar;
		var maxRecs;
		visAvatar = true;

		// Get the data
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');
		var flyinID = this.localstorage.getLocalValue('FlyinMeetingID');
		var DevPlatform = this.localstorage.getLocalValue('DevicePlatform');
		
		if (AttendeeID != '' && AttendeeID != null) {

			console.log('Home: Attendee logged in, dashboard data loading...');
			
			flags = "li2|0|0|0|0|0|0|0|0|0|0|0|" + flyinID;
			
			this.databaseprovider.getAgendaData(flags, AttendeeID).then(data => {
				
				console.log('Home, RefreshUpcomingAgenda: getAgendaData: ' + JSON.stringify(data));
			
				this.upcomingAgendaItems = [];	
				//this.upcomingContacts = [];	
				
				if (data['length']>0) {
					
						var ContactCheck = 0;
						
						//if (data['length'] > DefaultAgendaRows) {
						//	maxRecs = DefaultAgendaRows;
						//} else {
							maxRecs = data['length'];
							console.log('Records: ' + maxRecs);
						//}
						
						for (var i = 0; i < maxRecs; i++) {

							var dbEventDateTime = data[i].EventDate.substring(5, 10);
							var DisplayDateTime = dbEventDateTime.replace(/-/g, '/');

							visStartTime = formatTime(data[i].EventStartTime);
							visEndTime = formatTime(data[i].EventEndTime);
							
							DisplayDateTime = DisplayDateTime + " from " + visStartTime + " to " + visEndTime;
														
							if (data[i].MeetingType == 'Other') {
								visEventName = data[i].EventName;
								visEventLocation = data[i].EventLocation;
								
								// Auto-icon determination
								var eventTitle = data[i].EventName.toLowerCase();
								var iconSet = false;
								
								if (eventTitle.includes("breakfast") || eventTitle.includes("dinner") || eventTitle.includes("lunch")) {
									if (DevPlatform == 'iOS') {
										eventAvatar = "assets/img/ios-restaurant.png";
									} else {
										eventAvatar = "assets/img/android-restaurant.png";
									}
									iconSet = true;
								}
								if (eventTitle.includes("photo")) {
									if (DevPlatform == 'iOS') {
										eventAvatar = "assets/img/ios-camera.png";
									} else {
										eventAvatar = "assets/img/android-camera.png";
									}
									iconSet = true;
								}
								if (eventTitle.includes("cocktail") || eventTitle.includes("reception")) {
									if (DevPlatform == 'iOS') {
										eventAvatar = "assets/img/ios-wine.png";
									} else {
										eventAvatar = "assets/img/android-wine.png";
									}
									iconSet = true;
								}
								if (eventTitle.includes("bus") || eventTitle.includes("taxi") || eventTitle.includes("car") || eventTitle.includes("train")) {
									if (DevPlatform == 'iOS') {
										eventAvatar = "assets/img/ios-bus.png";
									} else {
										eventAvatar = "assets/img/android-bus.png";
									}
									iconSet = true;
								}
								if (eventTitle.includes("hotel") || eventTitle.includes("accommodation") || eventTitle.includes("motel") || eventTitle.includes("stay")) {
									if (DevPlatform == 'iOS') {
										eventAvatar = "assets/img/ios-bed.png";
									} else {
										eventAvatar = "assets/img/android-bed.png";
									}
									iconSet = true;
								}
								
								if (iconSet == false) {
									if (DevPlatform == 'iOS') {
										eventAvatar = "assets/img/ios-time.png";
									} else {
										eventAvatar = "assets/img/android-time.png";
									}
								}
								
							} else {
								
								if (data[i].EventName == '' || data[i].EventName === null) {
									var tempTitle = "Meeting with ";
									// If available, use Nickname field for First Name
									if (data[i].Nickname != "" && data[i].Nickname != null) {
										tempTitle = tempTitle + data[i].Nickname;
									} else {
										tempTitle = tempTitle + data[i].FirstName;
									}
									tempTitle = tempTitle + " " + data[i].LastName;
									tempTitle = tempTitle + " (" + data[i].Party.charAt(0) + " - " + data[i].State + ")";
									visEventName = tempTitle;
									visEventLocation = data[i].Address;
								} else {
									visEventName = data[i].EventName;
									visEventLocation = data[i].EventLocation;
								}

								if (data[i].imageFilename != '' && data[i].imageFilename != null && data[i].imageFilename != undefined) {
									eventAvatar = "assets/img/CongressionalMembers/" + data[i].imageFilename;
								} else {
									if (DevPlatform == 'iOS') {
										eventAvatar = "assets/img/ios-listbox.png";
									} else {
										eventAvatar = "assets/img/android-listbox.png";
									}
								}
							}
							
							this.upcomingAgendaItems.push({
								EventName: visEventName,
								visEventTimeframe: DisplayDateTime,
								visEventID: "'" + data[i].EventID + "|" + data[i].itID + "'",
								EventLocation: visEventLocation,
								eventTypeIcon: eventIcon,
								visAvatar: true,
								ContactAvatar: eventAvatar
							});

							/*
							if (ContactCheck == 0) {
								
								if (data[i].FirstName != '' && data[i].FirstName != null && data[i].FirstName != undefined) {
									
									var tempTitle = data[i].FirstName + " " + data[i].LastName;
									var tempAffiliation = data[i].Party + " - " + data[i].State;
									var tempAvatar = "assets/img/CongressionalMembers/" + data[i].imageFilename;
									
									this.upcomingContacts.push({
										cmID: data[i].congressionalMemberID,
										ContactAvatar: tempAvatar,
										visContactName: tempTitle,
										visAffiliation: tempAffiliation
									});
									
									ContactCheck = 1;
								
								}
							}
							*/
						}

				} else {
					
					if (DevPlatform == 'iOS') {
						eventAvatar = "assets/img/ios-removecircle.png";
					} else {
						eventAvatar = "assets/img/android-removecircle.png";
					}

					this.upcomingAgendaItems.push({
						EventName: "No upcoming agenda entries",
						visEventTimeframe: "",
						EventLocation: "",
						visEventID: "'0|0'",
						eventTypeIcon: "",
						visAvatar: true,
						ContactAvatar: eventAvatar
					});
					
				}

				this.cd.markForCheck();
				
			}).catch(function () {
				console.log("Home: Promise Rejected");
			});
			
		} else {
			
			console.log('Home: Attendee not logged in, dashboard data not loaded');
			
			this.upcomingAgendaItems = [];	

			this.upcomingAgendaItems.push({
				EventName: "You need to be logged in to see your agenda",
				visEventTimeframe: "",
				EventLocation: "",
				visEventID: "'0|0'",
				eventTypeIcon: "remove-circle"
			});

			this.cd.markForCheck();

		}
		
	}
	
	AvatarNavigation() {

		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');

		if (AttendeeID !='' && AttendeeID != null) {
			this.navCtrl.push(ProfilePage, {}, {animate: true, direction: 'forward'});
		} else {
			this.localstorage.setLocalValue('LoginWarning', '0');
			this.localstorage.setLocalValue('ForwardingPage', 'Home');
			this.navCtrl.push(LoginPage, {}, {animate: true, direction: 'forward'});
		}
		
	}



	
	// The following pages require the user to be logged in.
	// If not, go to login page before continuing on
	// otherwise, go to requested page.
	NavigateToAuthenticatedPage(PageID) {
		
		var AttendeeID = this.localstorage.getLocalValue('AttendeeID');

		if (AttendeeID !='' && AttendeeID != null) {

			this.localstorage.setLocalValue('LoginWarning', '0');
			this.localstorage.setLocalValue('ForwardingPage', '');
			switch(PageID) {
				case "MyAgenda":
					this.navCtrl.push(MyAgenda, {}, {animate: true, direction: 'forward'});
					break;
				case "Notes":
					this.navCtrl.push(NotesPage, {}, {animate: true, direction: 'forward'});
					break;
				case "Home":
					this.navCtrl.push(HomePage, {}, {animate: true, direction: 'forward'});
					break;
			}
			
		} else {
			
			this.localstorage.setLocalValue('ForwardingPage', PageID);
			this.localstorage.setLocalValue('LoginWarning', '1');
			this.navCtrl.push(LoginPage, {}, {animate: true, direction: 'forward'});

		}
			
	
	}

	NavigateToLoginPage() {
		
		this.localstorage.setLocalValue('LoginWarning', '0');
		this.localstorage.setLocalValue('ForwardingPage', '');
		this.navCtrl.push(LoginPage, {}, {animate: true, direction: 'forward'});
	
	}
	
    EventDetails(EventID) {
		
		console.log("Btn ID: " + EventID);
		
        var IDSplit = EventID.split("|");

        var storeEventID = IDSplit[0].replace("'","");
        var storePersonalEventID = IDSplit[1].replace("'", "");
		console.log("Home: storeEventID: " + storeEventID);
		console.log("Home: storePersonalEventID: " + storePersonalEventID);

        if (storeEventID == "0" && storePersonalEventID == "0") {
            // Do nothing
        } else {
            if (storeEventID == "0") {

                // Set EventID to LocalStorage
				this.localstorage.setLocalValue('PersonalEventID', storePersonalEventID);

                // Navigate to Education Details page
				this.navCtrl.push('MyAgendaPersonal', {EventID: storePersonalEventID}, {animate: true, direction: 'forward'});

            } else {

                // Set EventID to LocalStorage
				this.localstorage.setLocalValue('EventID', storeEventID);

                // Navigate to Education Details page
				this.navCtrl.push(MeetingDetailsPage, {EventID: storeEventID}, {animate: true, direction: 'forward'});

            }
        }
    };

    CongressionalDetails(cmID) {
		
		console.log('cmID: ' + cmID);
		
		if (cmID != "0") {

			this.navCtrl.push(CongressionalDetailsPage, {cmID: cmID}, {animate: true, direction: 'forward'});

		}

    };

    CallPrimePolicy(fab: FabContainer) {

		// Close fab buttons
		fab.close();

		var CallPrimeNumber = this.localstorage.getLocalValue('CallPrimeNumber');
		//CallPrimeNumber = '7035177586';
		//console.log('Dialer: tel:' + CallPrimeNumber);
		console.log('Home, Dialer: original tel:' + CallPrimeNumber);
		
		// Remove characters from phone number string and format accordingly
		//phoneNumber = phoneNumber.replace(/-/g, '');
		//CallPrimeNumber = CallPrimeNumber.replace(/./g, '-');
		CallPrimeNumber = CallPrimeNumber.replace('(', '');
		CallPrimeNumber = CallPrimeNumber.replace(')', '');
		CallPrimeNumber = CallPrimeNumber.replace(' ', '-');
		
		console.log('Home, Dialer: corrected tel:' + CallPrimeNumber);
		
		window.open(`tel:${CallPrimeNumber}`, '_system');
		
		//this.callNumber.callNumber('7038801636', true)
		//	.then(res => console.log('Launched dialer!', res))
		//	.catch(err => console.log('Error launching dialer', err));
		
		//this.callNumber.callNumber(CallPrimeNumber, true);
		
    };

    TextPrimePolicy(fab: FabContainer) {

		const SendSMSModalOptions: ModalOptions = {
			enableBackdropDismiss: false
		};

		const SendSMSModal: Modal = this.modal.create('SMSMessagePage', {}, SendSMSModalOptions);

		SendSMSModal.present();

		SendSMSModal.onDidDismiss((data) => {
			if (data == "Send") {
				
				// Get details
				var TextPrimeNumber = this.localstorage.getLocalValue('TextPrimeNumber');
				var TextMessage = this.localstorage.getLocalValue('SMSMessage');
				var LoginName = this.localstorage.getLocalValue('LoginFullName');
				
				// Make sure values are filled in
				if (LoginName == null || LoginName == '') {
					LoginName = 'Guest User';
				}
				if (TextPrimeNumber == null || TextPrimeNumber == '') {
					TextPrimeNumber = '2025304594';
				}
				
				// Concatenate login name with message
				TextMessage = "Msg from: " + LoginName + ", Msg: " + TextMessage;
				
				console.log('Sending SMS to: ' + TextPrimeNumber);
				console.log(TextMessage);

				var options = {
					replaceLineBreaks: false, // true to replace \n by a new line, false by default
					android: {
						intent: 'INTENT'  // send SMS with the native android SMS messaging
						//intent: '' // send SMS without opening any other app
					}
				};
				
				// Send message
				this.sms.send(TextPrimeNumber, TextMessage, options);
				
				// Erase message from local storage
				this.localstorage.setLocalValue('SMSMessage', '');
			}
		});

		// Close fab buttons
		fab.close();

		
    };

	AppHelp(fab: FabContainer) {

		// Close fab buttons
		fab.close();

		this.navCtrl.push(HelpPage, {}, {animate: true, direction: 'forward'});
		
    };

}


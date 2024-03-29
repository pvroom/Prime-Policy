// Components, functions, plugins
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Pro } from '@ionic/pro';
import { ErrorHandler, Injectable, Injector, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { MyApp } from './app.component';
import { OneSignal } from '@ionic-native/onesignal';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { Camera } from '@ionic-native/camera';
import { IonTextAvatar } from 'ionic-text-avatar';
import { Ionic2RatingModule } from 'ionic2-rating';
import { IonicImageLoader } from 'ionic-image-loader';
import { ChartsModule } from 'ng2-charts';
import { IonAlphaScrollModule } from 'ionic2-alpha-scroll';
//import { Zoom } from '@ionic-native/zoom';
import { AngularAgoraRtcModule, AgoraConfig } from 'angular-agora-rtc';

//import { CallNumber } from '@ionic-native/call-number';
import { SMS } from '@ionic-native/sms';
//import { Network } from '@ionic-native/network'


// Providers
import { Database } from '../providers/database/database';
import { Localstorage } from '../providers/localstorage/localstorage';
import { Synchronization } from '../providers/synchronization/synchronization';
import { RelativeTime } from '../pipes/relative-time';
//import { NetworkProvider } from '../providers/network/network';

// File Transfer and Navigation
import { FileUploadModule } from 'ng2-file-upload';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer'; 

// Pages
import { ConferenceCityPage } from '../pages/conferencecity/conferencecity';
import { CongressionalDetailsPage } from '../pages/congressionaldetails/congressionaldetails';
import { CongressionalMembersPage } from '../pages/congressionalmembers/congressionalmembers';
import { CongressionalStaffDetailsPage } from '../pages/congressionalstaffdetails/congressionalstaffdetails';
import { CongressionalStaffSearchPage } from '../pages/congressionalstaffsearch/congressionalstaffsearch';
import { DatabasePage } from '../pages/database/database';
import { HelpPage } from '../pages/help/help';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { MeetingDetailsPage } from '../pages/meetingdetails/meetingdetails';
import { MorePage } from '../pages/more/more';
import { MyAgenda } from '../pages/myagenda/myagenda';
import { MyAgendaFull } from '../pages/myagendafull/myagendafull';
//import { NotesPage } from '../pages/notes/notes';
import { NotesDetailsPage } from '../pages/notesdetails/notesdetails';
import { NotificationsPage } from '../pages/notifications/notifications';
import { NetworkingPage } from '../pages/networking/networking';
import { SliderPage } from '../pages/slider/slider';
import { ProfilePage } from '../pages/profile/profile';
import { SocialPage } from '../pages/social/social';
//import { SettingPage } from '../pages/setting/setting';
import { SplashPage } from '../pages/splash/splash';
import { IssuesPage } from '../pages/issues/issues';
import { SurveyPage } from '../pages/survey/survey';

// Temporary Support Pages
//import { FloorplanMappingPage } from '../pages/floorplanmapping/floorplanmapping';


@Injectable()
export class MyErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch(e) {
      // Unable to get the IonicErrorHandler provider, ensure
      // IonicErrorHandler has been added to the providers list below
    }
  }







  handleError(err: any): void {
    //Pro.monitoring.handleNewError(err);
    // Remove this if you want to disable Ionic's auto exception handling
	// in development mode.
    this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
  }
}




const agoraConfig: AgoraConfig = { AppID: '3076a12a1aa242359ad38b2180c01f01' };




@NgModule({
  declarations: [
    ConferenceCityPage,
	CongressionalDetailsPage,
	CongressionalMembersPage,
	CongressionalStaffDetailsPage,
    CongressionalStaffSearchPage,
    DatabasePage,
	//FloorplanMappingPage,
    HelpPage,
    HomePage,
    LoginPage,
    MapPage,
	MeetingDetailsPage,
    MorePage,
	MyAgenda,
	MyAgendaFull,
    MyApp,
    NotesDetailsPage,
    MeetingDetailsPage,
    NotificationsPage,
	NetworkingPage,
    ProfilePage,
    SliderPage,
    SocialPage,
    IssuesPage,
    SurveyPage,
    SplashPage,
    IonTextAvatar,
	RelativeTime
  ],

  imports: [
  BrowserModule,
    FormsModule,
    AngularAgoraRtcModule.forRoot(agoraConfig),
    HttpModule,
	ChartsModule,
	FileUploadModule,
    IonicImageViewerModule,
    IonAlphaScrollModule,
    Ionic2RatingModule,
    HttpClientModule,
	IonicStorageModule.forRoot(),
	IonicImageLoader.forRoot(),
	IonicModule.forRoot(MyApp,{tabsPlacement: 'bottom'})
	],

  bootstrap: [IonicApp],

  entryComponents: [
    ConferenceCityPage,
	CongressionalDetailsPage,
	CongressionalMembersPage,
	CongressionalStaffDetailsPage,
    CongressionalStaffSearchPage,
    DatabasePage,
	//FloorplanMappingPage,
    HelpPage,
    HomePage,
    LoginPage,
    MapPage,
	MeetingDetailsPage,
    MorePage,
	MyAgenda,
    MyAgendaFull,
    MyApp,
  //  NotesPage,
	NotesDetailsPage,
    SurveyPage,
    IssuesPage,
    NotificationsPage,
	NetworkingPage,
	ProfilePage,
    SliderPage,
    SocialPage,
    SplashPage
  ],

  providers: [
	Camera,
	//CallNumber,
	Database,
	FileTransfer, 
	FileTransferObject, 
	Localstorage,
	//Network,
    //NetworkProvider,
	OneSignal,
	SMS,
    StatusBar,
    SplashScreen,
    IonTextAvatar,
	SQLite,
  Synchronization,
  //Zoom,
	IonicErrorHandler,
        [{ provide: ErrorHandler, useClass: MyErrorHandler }]
	//	{provide: ErrorHandler, useClass: IonicErrorHandler},
	//[{ provide: ErrorHandler, useClass: MyErrorHandler }],
	]
  })

  export class AppModule {}




import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Database } from './../../providers/database/database';
import { Localstorage } from './../../providers/localstorage/localstorage';

@IonicPage()
@Component({
  selector: 'page-smsmessage',
  templateUrl: 'smsmessage.html',
})
export class SMSMessagePage {

	public SMSMessageEntry: string;
	
	constructor(private navParams: NavParams, 
				private storage: Storage,
				private databaseprovider: Database,
				private view: ViewController,
				private localstorage: Localstorage) {
					
	}

	ngOnInit() {

	}
	
	closeModal(UserAction) {
		
		if (UserAction == "Send") {

			var SMSMessage = this.SMSMessageEntry;
			this.localstorage.setLocalValue('SMSMessage', SMSMessage);
			
			this.view.dismiss(UserAction);
						
		}
		
		if (UserAction == "Cancel") {
			this.view.dismiss(UserAction);
		}
		
	}
}

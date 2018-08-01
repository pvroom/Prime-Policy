// Components, functions, plugins
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { map } from 'rxjs/operators/map';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Database } from './../../providers/database/database';
import { Localstorage } from '../../providers/localstorage/localstorage';

export class ChatMessage {
  messageId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  toUserId: string;
  time: number | string;
  message: string;
  status: string;
}

export class UserInfo {
  id: string;
  name?: string;
  avatar?: string;
}

//export const userAvatar = 'https://naeyc.convergence-us.com/AdminGateway/images/Attendees/900000.jpg';
//export const toUserAvatar = 'https://naeyc.convergence-us.com/AdminGateway/images/Attendees/900001.jpg';
export const userAvatar = '';
export const toUserAvatar = '';

// Global URL and conference year reference used for all AJAX-to-MySQL calls
var APIURLReference: string = "https://naeyc.convergence-us.com/cvPlanner.php?acy=2018&";

@Injectable()
export class ChatService {

	//public userAvatar: string;
	//public toUserAvatar: string;
	
	constructor(private http: HttpClient,
				private events: Events) {
	}

	mockNewMsg(msg) {
		const mockMsg: ChatMessage = {
		  messageId: Date.now().toString(),
		  userId: '900001',
		  userName: 'Peter Vroom',
		  userAvatar: toUserAvatar,
		  toUserId: '900000',
		  time: Date.now(),
		  message: msg.message,
		  status: 'success'
		};

		setTimeout(() => {
		  this.events.publish('chat:received', mockMsg, Date.now())
		}, Math.random() * 300)

	}

	getNewMessages(AttendeeID, cAttendeeID) {

		var temp = this;
		var newMsgsUrl = APIURLReference + "action=msgquery&flags=rc|0|" + cAttendeeID + "&AttendeeID=" + AttendeeID;

		this.http.get(newMsgsUrl).subscribe(result => {

			if (Object.keys(result).length>0) {

				console.log('Receive Msg Check: ' + JSON.stringify(result));
			
				const newMsg: ChatMessage = {
					messageId: result[0].messageId,
					userId: result[0].userId,
					userName: result[0].userName,
					userAvatar: result[0].UserAvatar,
					toUserId: result[0].toUserId,
					time: result[0].time,
					message: result[0].message,
					status: 'success'
				};
				
				this.events.publish('chat:received', newMsg, Date.now());
				
				console.log(JSON.stringify(newMsg));
			
			}
		},
			err => {
					console.log("API Error: ", err);
			}
		);
	
		
		
	}
	
	getMsgList(AttendeeID, cAttendeeID): Observable<ChatMessage[]> {
		
		var msgListUrl = APIURLReference + "action=msgquery&flags=in|0|" + cAttendeeID + "&AttendeeID=" + AttendeeID;
		return this.http.get<any>(msgListUrl)
		.pipe(map(response => response.map(msg => ({
		  ...msg
		}))));
						
		//return this.http.get<any>(msgListUrl)
		//.pipe(map(response => response.map(msg => ({
		//  ...msg,
		//  userAvatar: msg.userAvatar === 'assets/img/personIcon.png' ? userAvatar : toUserAvatar
		//}))));

		//return this.http.get<any>(msgListUrl).then(
		//	response => msg
		//);
			
	}

	sendMsg(msg: ChatMessage, AttendeeID) {

		var url = APIURLReference + "action=msgquery&flags=sd|0|0|" + JSON.stringify(msg) + "&AttendeeID=" + AttendeeID;
		console.log('Message send: ' + url);
		
		return new Promise(resolve => {
			this.http.get(url).subscribe(
				response => {
					console.log('Message send result: ' + JSON.stringify(response));
					resolve(msg);
				},
				err => {
					if (err.status == "412") {
						console.log("App and API versions don't match.");
						var emptyJSONArray = {};
						resolve(emptyJSONArray);
					} else {
						console.log(err.status);
						console.log("API Error: ", err);
					}
				}
			);
		});

	}

}

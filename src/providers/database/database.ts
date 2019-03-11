// Components, functions, plugins
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/catch';
import { Localstorage } from './../../providers/localstorage/localstorage';

declare var formatTime: any;
declare var dateFormat: any;

// ------------------------
// Index to functions
// 
// Agenda			1875
// Database Stats	2492
// Evaluations		478
// Messaging		3122
// Misc				2171
// Notes			2327
// Program Guide	958
// Settings			886
// Speakers			1478
// 
// ------------------------


// Global URL and conference year referenceused for all AJAX-to-MySQL calls
var APIURLReference: string = "https://primepolicy.convergence-us.com/flyinPlanner.php?";

@Injectable()
export class Database {

	/* Setup page variables */
    private storage: SQLite;
	private db: SQLiteObject;
	 
    public constructor(public pltfrm: Platform, 
						public httpCall: Http,
						public alertCtrl: AlertController,
						private sqlite: SQLite,
						private localstorage: Localstorage) {

	}

	// -----------------------------------
	// 
	// Congressional Member Database Functions
	// 
	// -----------------------------------
	public getCongressionalData(flags, AttendeeID) {

		console.log("getCongressionalData: flags passed: " + flags);
		var SQLquery = "";
		var DevicePlatform = this.localstorage.getLocalValue('DevicePlatform');
		
		if (DevicePlatform == "iOS" || DevicePlatform == "Android") {
			
			console.log('getCongressionalData: Pull data from SQLite');
			var flagValues = flags.split("|");			// Split concatenated values
			var listingType = flagValues[0];			// Listing Type
			var sortOrder = flagValues[1];    			// Specific date of sessions
			var chamberID = flagValues[2];    			// Output sort order
			var QueryParam = flagValues[3];				// Specific course ID
			var congressionalMemberID = flagValues[4];	// Search parameters

			if (listingType == "li" || listingType == "sr") {	// List of speakers
			
				// Split search terms by space to create WHERE clause
				SQLquery = "SELECT DISTINCT cm.congressionalMemberID, cm.FirstName, cm.LastName, cm.MiddleInitial, cm.Nickname, ";
				SQLquery = SQLquery + "cm.Suffix, cm.Party, cm.State, ls.StateFullname, cm.imageFilename, '1' AS CongressionalMember, ";
				SQLquery = SQLquery + "cm.District, CAST(cm.District AS UNSIGNED) AS SortNum ";
				SQLquery = SQLquery + "FROM congressional_members cm ";
				SQLquery = SQLquery + "INNER JOIN lookup_state ls ON ls.StateLetter = cm.State ";
				SQLquery = SQLquery + "WHERE cm.ActiveYN = 'Y' ";
				SQLquery = SQLquery + "AND Chamber = '" + chamberID + "' ";

				if (listingType == "sr") {		// If searching, then add where clause criteria
					// Split search terms by space to create WHERE clause
					var whereClause = 'AND (';
					var searchTerms = QueryParam.split(" ");
					
					for (var i = 0; i < searchTerms.length; i++){
						whereClause = whereClause + 'cm.SearchField LIKE "%' + searchTerms[i] + '%" AND ';
					}
					// Remove last AND from where clause
					whereClause = whereClause.substring(0, whereClause.length-5);        
					whereClause = whereClause + ') ';
					SQLquery = SQLquery + whereClause ;
				}
				if (sortOrder == "Alpha") {
					SQLquery = SQLquery + "ORDER BY LastName, FirstName";
				}
				if (sortOrder == "State") {
					if (chamberID == "Senate") {
						SQLquery = SQLquery + "ORDER BY StateFullname, LastName, FirstName";
					} else {
						SQLquery = SQLquery + "ORDER BY StateFullname, SortNum, LastName, FirstName";
					}
				}
			}

			if (listingType == "dt") {	// Details of Congressional Member
				SQLquery = "SELECT DISTINCT cm.congressionalMemberID, cm.FirstName, cm.LastName, cm.MiddleInitial, cm.Nickname, ";
				SQLquery = SQLquery + "cm.Suffix, cm.Party, ls.StateFullname, cm.imageFilename, cm.Chamber, cm.District, cm.Bio, cm.Website, ";
				SQLquery = SQLquery + "cm.Email, cm.Phone, cm.Address, cm.City, cm.AddressState, cm.Zipcode, cm.TwitterAccount, cm.FacebookURL, ";
				SQLquery = SQLquery + "fm.mapX AS OfficeX, fm.mapY AS OfficeY, fm.RoomID AS RoomNumber ";
				SQLquery = SQLquery + "FROM congressional_members cm ";
				SQLquery = SQLquery + "INNER JOIN lookup_state ls ON ls.StateLetter = cm.State ";
				SQLquery = SQLquery + "LEFT OUTER JOIN floorplan_mapping fm ON fm.mappingID = cm.mappingID ";
				SQLquery = SQLquery + "WHERE cm.ActiveYN = 'Y' ";
				SQLquery = SQLquery + "AND cm.congressionalMemberID = " + congressionalMemberID + " ";
			}

			if (listingType == "cl") {	// Committee listing for specific congressional member
				SQLquery = "SELECT c.CommitteeName, c.Website ";
				SQLquery = SQLquery + "FROM lookup_committees c ";
				SQLquery = SQLquery + "INNER JOIN congressional_members_committees cmc ON cmc.committeeID = c.committeeID ";
				SQLquery = SQLquery + "WHERE cmc.congressionalMemberID = " + congressionalMemberID + " ";
				SQLquery = SQLquery + "AND c.ActiveYN = 'Y' ";
				SQLquery = SQLquery + "ORDER BY c.CommitteeName";
			}
			
			if (listingType == "cd") {	// List of congressional members for specific meeting
				SQLquery = "SELECT cm.* ";
				SQLquery = SQLquery + "FROM congressional_members cm ";
				SQLquery = SQLquery + "INNER JOIN meetings m ON m.congressionalMemberID = cm.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE m.meetingID = " + congressionalMemberID + " ";
				SQLquery = SQLquery + "ORDER BY cm.LastName, cm.FirstName";
			}

			console.log("Congressional Members Query: " + SQLquery);

			// Perform query against local SQLite database
			return new Promise(resolve => {
				
				this.sqlite.create({name: 'flyinPlanner.db', location: 'default', createFromLocation: 1}).then((db: SQLiteObject) => {

					console.log('Database: Opened DB for congressional members query');
					
					this.db = db;
					
					console.log('Database: Set congressional members query db variable');
					
					this.db.executeSql(SQLquery, <any>{}).then((data) => {
						console.log('Database: congressional members query: ' + JSON.stringify(data));
						console.log('Database: congressional members query rows: ' + data.rows.length);
						let DatabaseResponse = [];
						if(data.rows.length > 0) {
							for(let i = 0; i < data.rows.length; i++) {
								if (listingType == "li" || listingType == "sr") {
									DatabaseResponse.push({
										congressionalMemberID: data.rows.item(i).congressionalMemberID,
										LastName: data.rows.item(i).LastName,
										FirstName: data.rows.item(i).FirstName,
										MiddleInitial: data.rows.item(i).MiddleInitial,
										Nickname: data.rows.item(i).Nickname,
										Suffix: data.rows.item(i).Suffix,
										Party: data.rows.item(i).Party,
										State: data.rows.item(i).State,
										District: data.rows.item(i).District,
										StateFullname: data.rows.item(i).StateFullname,
										imageFilename: data.rows.item(i).imageFilename,
										CongressionalMember: data.rows.item(i).CongressionalMember
									});
								}
								if (listingType == "dt") {
									DatabaseResponse.push({
										congressionalMemberID: data.rows.item(i).congressionalMemberID,
										LastName: data.rows.item(i).LastName,
										FirstName: data.rows.item(i).FirstName,
										MiddleInitial: data.rows.item(i).MiddleInitial,
										Nickname: data.rows.item(i).Nickname,
										Suffix: data.rows.item(i).Suffix,
										Party: data.rows.item(i).Party,
										Chamber: data.rows.item(i).Chamber,
										StateFullname: data.rows.item(i).StateFullname,
										imageFilename: data.rows.item(i).imageFilename,
										District: data.rows.item(i).District,
										Bio: data.rows.item(i).Bio,
										Website: data.rows.item(i).Website,
										Email: data.rows.item(i).Email,
										Phone: data.rows.item(i).Phone,
										Address: data.rows.item(i).Address,
										City: data.rows.item(i).City,
										AddressState: data.rows.item(i).AddressState,
										Zipcode: data.rows.item(i).Zipcode,
										TwitterAccount: data.rows.item(i).TwitterAccount,
										FacebookURL: data.rows.item(i).FacebookURL,
										OfficeX: data.rows.item(i).OfficeX,
										OfficeY: data.rows.item(i).OfficeY,
										RoomNumber: data.rows.item(i).RoomNumber
									});
								}
								if (listingType == "cl") {
									DatabaseResponse.push({
										CommitteeName: data.rows.item(i).CommitteeName,
										Website: data.rows.item(i).Website,
									});
								}
							}
						}
						resolve(DatabaseResponse);
					})
					.catch(e => console.log('Database: congressional members query error: ' + JSON.stringify(e)))
				});
				console.log('Database: congressional members query complete');

			});

			
		} else {
			
			console.log('getCongressionalData: Pull data from MySQL');

			// Perform query against server-based MySQL database
			var url = APIURLReference + "action=cmquery&flags=" + flags + "&AttendeeID=" + AttendeeID;

			return new Promise(resolve => {
				this.httpCall.get(url).subscribe(
					response => {
						console.log("Database: Congressional Member data: " + JSON.stringify(response.json()));
						resolve(response.json());
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


	// -----------------------------------
	// 
	// Agenda Database Functions
	// 
	// -----------------------------------
	public getAgendaData(flags, AttendeeID) {

		console.log("Database, getAgendaData: flags passed: " + flags);
		console.log("Database, getAgendaData: AttendeeID passed: " + AttendeeID);

		var DevicePlatform = this.localstorage.getLocalValue('DevicePlatform');
		
		if (DevicePlatform == "iOS" || DevicePlatform == "Android") {
			
			console.log('Database, getAgendaData: Pull data from SQLite');
			var re = /\'/gi; 

			var flagValues = flags.split("|");		// Split concatenated values
			var listingType = flagValues[0];
			var selectedDay = flagValues[1];
			var EventID = flagValues[2];
			var EventStartTime = flagValues[3];
			var EventEndTime = flagValues[4];
			var EventLocation = flagValues[5];
			//EventLocation = EventLocation.replace(re, "''");
			var EventName = flagValues[6];
			//EventName = EventName.replace(re, "''");
			var EventDate = flagValues[7];
			var AAOID = flagValues[8];
			var LastUpdated = flagValues[9];
			var EventDescription = flagValues[10];
			var QueryParam = flagValues[11];
			var FlyinID = flagValues[12];
			//EventDescription = EventDescription.replace(re, "''");
			var SQLquery = "";
			var SQLDate;
			var DisplayDateTime;
			var dbEventDateTime;
			var visStartTime;
			var visEndTime;
			var flID = this.localstorage.getLocalValue("FlyinMeetingID");

			if (listingType == "li") {	// List of events
			
				// Personal agenda items
				SQLquery = "SELECT DISTINCT itID AS meetingID, EventID, mtgID, Date_Start || ' ' || Time_Start AS StartDateTime, Date_End || ' ' || Time_End AS EndDateTime, Location, Description AS EventDescription, ";
				SQLquery = SQLquery + "SUBJECT AS MeetingTitle, ";
				SQLquery = SQLquery + "'' AS FirstName, '' AS LastName, '' AS Nickname, '' AS Party, '' AS State, '' AS Address, '' AS imageFilename ";
				SQLquery = SQLquery + "FROM itinerary WHERE Date_Start = '" + selectedDay + "' AND AttendeeID = '" + AttendeeID + "' ";
				SQLquery = SQLquery + "AND EventID = '0' ";
				SQLquery = SQLquery + "AND UpdateType != 'Delete' "; 

				SQLquery = SQLquery + "UNION ";

				// Regular client member agenda items
				SQLquery = SQLquery + "SELECT DISTINCT m.meetingID, m.meetingID AS EventID, '0' AS mtgID, StartDateTime, EndDateTime, Location, EventDescription, MeetingTitle, ";
				SQLquery = SQLquery + "con.FirstName, con.LastName, con.Nickname, con.Party, con.State, con.Address, con.imageFilename ";
				SQLquery = SQLquery + "FROM meetings m ";
				SQLquery = SQLquery + "INNER JOIN meetings_clients mc ON mc.meetingID = m.meetingID ";
				SQLquery = SQLquery + "LEFT OUTER JOIN congressional_members con ON m.congressionalMemberID = con.congressionalMemberID ";
				SQLquery = SQLquery + "INNER JOIN clients_members cm ON cm.clientmemberID = mc.clientmemberID ";
				SQLquery = SQLquery + "INNER JOIN clients c ON cm.clientID = c.clientID ";
				SQLquery = SQLquery + "INNER JOIN flyins f ON c.clientID = f.clientID AND m.flID = f.flID ";
				SQLquery = SQLquery + "WHERE m.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND m.CancelledYN = 'N' ";
				SQLquery = SQLquery + "AND c.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND cm.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND mc.ActiveYN = 'Y' ";
				SQLquery = SQLquery + "AND f.ActiveYN = 'Y' ";
				SQLquery = SQLquery + "AND f.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND mc.clientmemberID = " + AttendeeID + " ";
				SQLquery = SQLquery + "AND DATE(m.StartDateTime) = '" + selectedDay + "' ";
				
				SQLquery = SQLquery + "UNION ";

				// Staff member agenda items
				SQLquery = SQLquery + "SELECT DISTINCT m.meetingID, m.meetingID AS EventID, '0' AS mtgID, StartDateTime, EndDateTime, Location, EventDescription, MeetingTitle, ";
				SQLquery = SQLquery + "con.FirstName, con.LastName, con.Nickname, con.Party, con.State, con.Address, con.imageFilename ";
				SQLquery = SQLquery + "FROM meetings m ";
				SQLquery = SQLquery + "INNER JOIN meetings_clients mc ON mc.meetingID = m.meetingID ";
				SQLquery = SQLquery + "LEFT OUTER JOIN congressional_members con ON m.congressionalMemberID = con.congressionalMemberID ";
				//SQLquery = SQLquery + "INNER JOIN flyins_staff fs ON fs.staffID = mc.clientmemberID ";
				SQLquery = SQLquery + "WHERE m.ActiveYN = 'Y' ";
				SQLquery = SQLquery + "AND m.CancelledYN = 'N' ";
				SQLquery = SQLquery + "AND mc.ActiveYN = 'Y' ";
				SQLquery = SQLquery + "AND mc.clientmemberID = " + AttendeeID + " ";
				//SQLquery = SQLquery + "AND fs.flID = " + flID + " ";
				SQLquery = SQLquery + "AND DATE(m.StartDateTime) = '" + selectedDay + "' ";

				SQLquery = SQLquery + "ORDER BY StartDateTime ";

			}

			if (listingType == "li2") {

				// Personal agenda items
				SQLquery = "SELECT DISTINCT itID AS meetingID, '0' AS flID, EventID, mtgID, Date_Start || ' ' || Time_Start AS StartDateTime, Date_End || ' ' || Time_End AS EndDateTime, ";
				SQLquery = SQLquery + "'Other' AS MeetingType, SUBJECT AS MeetingTitle, Description AS EventDescription, Location, ";
				SQLquery = SQLquery + "'Y' AS ActiveYN, 'N' AS CancelledYN, ";
				SQLquery = SQLquery + "'0' AS congressionalMemberID, '' AS FirstName, '' AS LastName, '' AS Nickname, '' AS Party, '' AS State, '' AS Address, '' AS imageFilename ";
				SQLquery = SQLquery + "FROM itinerary WHERE AttendeeID = '" + AttendeeID + "' ";
				SQLquery = SQLquery + "AND EventID = '0' ";
				SQLquery = SQLquery + "AND UpdateType != 'Delete' ";

				SQLquery = SQLquery + "UNION ";

				// Meetings where client members are attending
				SQLquery = SQLquery + "SELECT DISTINCT m.meetingID, m.flID, m.meetingID AS EventID, '0' AS mtgID, m.StartDateTime, ";
				SQLquery = SQLquery + "m.EndDateTime, m.MeetingType, m.MeetingTitle, m.EventDescription, m.Location, m.ActiveYN, m.CancelledYN, ";
				//SQLquery = "SELECT DISTINCT m.meetingID, m.flID, m.StartDateTime, m.EndDateTime, m.MeetingType, m.MeetingTitle, m.EventDescription, m.Location, m.ActiveYN, m.CancelledYN, ";
				SQLquery = SQLquery + "(SELECT con1.congressionalMemberID ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS congressionalMemberID, ";
				SQLquery = SQLquery + "(SELECT con1.FirstName ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS FirstName, ";
				SQLquery = SQLquery + "(SELECT con1.LastName ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS LastName, ";
				SQLquery = SQLquery + "(SELECT con1.Nickname ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS Nickname, ";
				SQLquery = SQLquery + "(SELECT con1.Party ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS Party, ";
				SQLquery = SQLquery + "(SELECT con1.State ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS State, ";
				SQLquery = SQLquery + "(SELECT con1.Address ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS Address, ";
				SQLquery = SQLquery + "(SELECT con1.imageFilename ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID ";
				SQLquery = SQLquery + "UNION ";
				SQLquery = SQLquery + "SELECT cm2.imageFilename ";
				SQLquery = SQLquery + "FROM meetings_congressionals mc2 ";
				SQLquery = SQLquery + "INNER JOIN congressional_members_staff cms2 ON cms2.cmsID = mc2.cmsID ";
				SQLquery = SQLquery + "INNER JOIN congressional_members cm2 ON cm2.congressionalMemberID = cms2.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc2.meetingID = m.meetingID ";
				SQLquery = SQLquery + "LIMIT 1) AS imageFilename ";
				SQLquery = SQLquery + "FROM meetings m ";
				SQLquery = SQLquery + "INNER JOIN meetings_clients mc ON mc.meetingID = m.meetingID ";
				//SQLquery = SQLquery + "LEFT OUTER JOIN congressional_members con ON m.congressionalMemberID = con.congressionalMemberID ";
				SQLquery = SQLquery + "INNER JOIN clients_members cm ON cm.clientmemberID = mc.clientmemberID ";
				SQLquery = SQLquery + "INNER JOIN clients c ON cm.clientID = c.clientID ";
				SQLquery = SQLquery + "INNER JOIN flyins f ON c.clientID = f.clientID AND m.flID = f.flID ";
				//SQLquery = SQLquery + "WHERE m.flID = f.flID ";
				
				//SQLquery = SQLquery + "=(SELECT f.flID ";
				//SQLquery = SQLquery + "FROM clients_members cm ";
				//SQLquery = SQLquery + "INNER JOIN clients c ON cm.clientID = c.clientID ";
				//SQLquery = SQLquery + "INNER JOIN flyins f ON f.clientID = c.clientID ";
				//SQLquery = SQLquery + "WHERE cm.clientmemberID = " + AttendeeID + " ";
				//SQLquery = SQLquery + "AND f.ActiveYN = 'Y') ";
				
				//SQLquery = SQLquery + "AND strftime('%Y',StartDateTime) = strftime('%Y','now') ";
				//SQLquery = SQLquery + "AND EndDateTime>= DATE('now') ";
				
				SQLquery = SQLquery + "WHERE mc.clientmemberID = " + AttendeeID + " ";
				SQLquery = SQLquery + "AND m.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND m.CancelledYN = 'N' ";
				SQLquery = SQLquery + "AND c.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND cm.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND mc.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND f.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND f.ActiveYN = 'Y' ";
				
				SQLquery = SQLquery + "UNION ";

				// Meetings where staff members are attending
				SQLquery = SQLquery + "SELECT DISTINCT m.meetingID, m.flID, m.meetingID AS EventID, '0' AS mtgID, m.StartDateTime, ";
				SQLquery = SQLquery + "m.EndDateTime, m.MeetingType, m.MeetingTitle, m.EventDescription, m.Location, m.ActiveYN, m.CancelledYN, ";
				//SQLquery = "SELECT DISTINCT m.meetingID, m.flID, m.StartDateTime, m.EndDateTime, m.MeetingType, m.MeetingTitle, m.EventDescription, m.Location, m.ActiveYN, m.CancelledYN, ";
				SQLquery = SQLquery + "(SELECT con1.congressionalMemberID ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS congressionalMemberID, ";
				SQLquery = SQLquery + "(SELECT con1.FirstName ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS FirstName, ";
				SQLquery = SQLquery + "(SELECT con1.LastName ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS LastName, ";
				SQLquery = SQLquery + "(SELECT con1.Nickname ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS Nickname, ";
				SQLquery = SQLquery + "(SELECT con1.Party ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS Party, ";
				SQLquery = SQLquery + "(SELECT con1.State ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS State, ";
				SQLquery = SQLquery + "(SELECT con1.Address ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID) AS Address, ";
				SQLquery = SQLquery + "(SELECT con1.imageFilename ";
				SQLquery = SQLquery + "FROM congressional_members con1 ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc1 ON mc1.congressionalMemberID = con1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc1.meetingID = m.meetingID ";
				SQLquery = SQLquery + "UNION ";
				SQLquery = SQLquery + "SELECT cm2.imageFilename ";
				SQLquery = SQLquery + "FROM meetings_congressionals mc2 ";
				SQLquery = SQLquery + "INNER JOIN congressional_members_staff cms2 ON cms2.cmsID = mc2.cmsID ";
				SQLquery = SQLquery + "INNER JOIN congressional_members cm2 ON cm2.congressionalMemberID = cms2.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc2.meetingID = m.meetingID ";
				SQLquery = SQLquery + "LIMIT 1) AS imageFilename ";
				SQLquery = SQLquery + "FROM meetings m ";
				SQLquery = SQLquery + "INNER JOIN meetings_clients mc ON mc.meetingID = m.meetingID ";
				SQLquery = SQLquery + "INNER JOIN staff s ON s.staffID = mc.clientmemberID ";
				SQLquery = SQLquery + "INNER JOIN flyins f ON m.flID = f.flID ";
				SQLquery = SQLquery + "WHERE mc.clientmemberID = " + AttendeeID + " ";
				SQLquery = SQLquery + "AND m.flID = " + flID + " ";
				SQLquery = SQLquery + "AND m.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND m.CancelledYN = 'N' ";
				SQLquery = SQLquery + "AND mc.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND s.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND s.ActiveYN = 'Y' ";
				SQLquery = SQLquery + "AND f.ActiveYN = 'Y' ";
				SQLquery = SQLquery + "AND f.DeletedYN = 'N' ";
				
				SQLquery = SQLquery + "ORDER BY StartDateTime ";

			}
			
			if (listingType == "sr") {	// List of speakers
			
				SQLquery = "SELECT DISTINCT m.*, cm.FirstName, cm.LastName, cm.Nickname, cm.Party, cm.State, cm.Address ";
				SQLquery = SQLquery + "FROM meetings m ";
				SQLquery = SQLquery + "INNER JOIN meetings_clients mc ON m.meetingID = mc.meetingID ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mcon ON mcon.meetingID = m.meetingID ";
				SQLquery = SQLquery + "LEFT OUTER JOIN congressional_members cm ON m.congressionalMemberID = cm.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE mc.clientmemberID = 1 ";
				SQLquery = SQLquery + "AND mcon.congressionalMemberID IN ( ";
				SQLquery = SQLquery + "SELECT DISTINCT cm.congressionalMemberID ";
				SQLquery = SQLquery + "FROM congressional_members cm ";

				// Split search terms by space to create WHERE clause
				var whereClause = 'WHERE (';
				var searchTerms = QueryParam.split(" ");
				
				for (var i = 0; i < searchTerms.length; i++){
					whereClause = whereClause + 'SearchField LIKE "%' + searchTerms[i] + '%" AND ';
				}
				// Remove last AND from where clause
				whereClause = whereClause.substring(0, whereClause.length-5);        
				whereClause = whereClause + ') ';
				SQLquery = SQLquery + whereClause ;

				SQLquery = SQLquery + "AND cm.ActiveYN = 'Y' ";
				SQLquery = SQLquery + ") ";
				SQLquery = SQLquery + "AND m.DeletedYN = 'N' ";
				SQLquery = SQLquery + "ORDER BY m.StartDateTime ";
				
			}

			if (listingType == "dt") {	// Details of Congressional Member

				SQLquery = "SELECT DISTINCT m.*, cm.FirstName, cm.LastName, cm.Nickname, cm.Party, cm.State, ";
				SQLquery = SQLquery + "cm.Address, cm.City, cm.AddressState, cm.Zipcode, cm.imageFilename, ";

				SQLquery = SQLquery + "(SELECT DISTINCT fm.mapX ";
				SQLquery = SQLquery + "FROM meetings_congressionals mc ";
				SQLquery = SQLquery + "INNER JOIN congressional_members cm ON mc.congressionalMemberID = cm.congressionalMemberID ";
				SQLquery = SQLquery + "LEFT OUTER JOIN floorplan_mapping fm ON fm.mappingID = cm.mappingID  ";
				SQLquery = SQLquery + "WHERE mc.meetingID = m.meetingID ";
				SQLquery = SQLquery + "AND mc.congressionalMemberID != 0 ";
				SQLquery = SQLquery + "UNION ";
				SQLquery = SQLquery + "SELECT DISTINCT fm.mapX ";
				SQLquery = SQLquery + "FROM meetings_congressionals mc ";
				SQLquery = SQLquery + "INNER JOIN congressional_members_staff cms ON mc.cmsID = cms.cmsID ";
				SQLquery = SQLquery + "INNER JOIN congressional_members cm ON cms.congressionalMemberID = cm.congressionalMemberID ";
				SQLquery = SQLquery + "LEFT OUTER JOIN floorplan_mapping fm ON fm.mappingID = cm.mappingID  ";
				SQLquery = SQLquery + "WHERE mc.meetingID = m.meetingID ";
				SQLquery = SQLquery + "AND mc.congressionalMemberID = 0) AS OfficeX, ";

				SQLquery = SQLquery + "(SELECT DISTINCT fm.mapY ";
				SQLquery = SQLquery + "FROM meetings_congressionals mc ";
				SQLquery = SQLquery + "INNER JOIN congressional_members cm ON mc.congressionalMemberID = cm.congressionalMemberID ";
				SQLquery = SQLquery + "LEFT OUTER JOIN floorplan_mapping fm ON fm.mappingID = cm.mappingID  ";
				SQLquery = SQLquery + "WHERE mc.meetingID = m.meetingID ";
				SQLquery = SQLquery + "AND mc.congressionalMemberID != 0 ";
				SQLquery = SQLquery + "UNION ";
				SQLquery = SQLquery + "SELECT DISTINCT fm.mapY ";
				SQLquery = SQLquery + "FROM meetings_congressionals mc ";
				SQLquery = SQLquery + "INNER JOIN congressional_members_staff cms ON mc.cmsID = cms.cmsID ";
				SQLquery = SQLquery + "INNER JOIN congressional_members cm ON cms.congressionalMemberID = cm.congressionalMemberID ";
				SQLquery = SQLquery + "LEFT OUTER JOIN floorplan_mapping fm ON fm.mappingID = cm.mappingID  ";
				SQLquery = SQLquery + "WHERE mc.meetingID = m.meetingID ";
				SQLquery = SQLquery + "AND mc.congressionalMemberID = 0) AS OfficeY, ";

				SQLquery = SQLquery + "(SELECT DISTINCT fm.RoomID ";
				SQLquery = SQLquery + "FROM meetings_congressionals mc ";
				SQLquery = SQLquery + "INNER JOIN congressional_members cm ON mc.congressionalMemberID = cm.congressionalMemberID ";
				SQLquery = SQLquery + "LEFT OUTER JOIN floorplan_mapping fm ON fm.mappingID = cm.mappingID  ";
				SQLquery = SQLquery + "WHERE mc.meetingID = m.meetingID ";
				SQLquery = SQLquery + "AND mc.congressionalMemberID != 0 ";
				SQLquery = SQLquery + "UNION ";
				SQLquery = SQLquery + "SELECT DISTINCT fm.RoomID ";
				SQLquery = SQLquery + "FROM meetings_congressionals mc ";
				SQLquery = SQLquery + "INNER JOIN congressional_members_staff cms ON mc.cmsID = cms.cmsID ";
				SQLquery = SQLquery + "INNER JOIN congressional_members cm ON cms.congressionalMemberID = cm.congressionalMemberID ";
				SQLquery = SQLquery + "LEFT OUTER JOIN floorplan_mapping fm ON fm.mappingID = cm.mappingID  ";
				SQLquery = SQLquery + "WHERE mc.meetingID = m.meetingID ";
				SQLquery = SQLquery + "AND mc.congressionalMemberID = 0) AS RoomNumber, ";

				SQLquery = SQLquery + "(SELECT DISTINCT cm.Chamber ";
				SQLquery = SQLquery + "FROM meetings_congressionals mc ";
				SQLquery = SQLquery + "INNER JOIN congressional_members cm ON mc.congressionalMemberID = cm.congressionalMemberID ";
				SQLquery = SQLquery + "LEFT OUTER JOIN floorplan_mapping fm ON fm.mappingID = cm.mappingID  ";
				SQLquery = SQLquery + "WHERE mc.meetingID = m.meetingID ";
				SQLquery = SQLquery + "AND mc.congressionalMemberID != 0 ";
				SQLquery = SQLquery + "UNION ";
				SQLquery = SQLquery + "SELECT DISTINCT cm.Chamber ";
				SQLquery = SQLquery + "FROM meetings_congressionals mc ";
				SQLquery = SQLquery + "INNER JOIN congressional_members_staff cms ON mc.cmsID = cms.cmsID ";
				SQLquery = SQLquery + "INNER JOIN congressional_members cm ON cms.congressionalMemberID = cm.congressionalMemberID ";
				SQLquery = SQLquery + "LEFT OUTER JOIN floorplan_mapping fm ON fm.mappingID = cm.mappingID  ";
				SQLquery = SQLquery + "WHERE mc.meetingID = m.meetingID) AS Chamber ";

				SQLquery = SQLquery + "FROM meetings m ";
				SQLquery = SQLquery + "INNER JOIN meetings_clients mc ON m.meetingID = mc.meetingID ";
				SQLquery = SQLquery + "LEFT OUTER JOIN congressional_members cm ON m.congressionalMemberID = cm.congressionalMemberID ";
				SQLquery = SQLquery + "LEFT OUTER JOIN floorplan_mapping fm ON fm.mappingID = cm.mappingID ";
				SQLquery = SQLquery + "WHERE m.meetingID = " + EventID + " ";
			}

			if (listingType == "ma") {	// Client Member and Staff attendees
				SQLquery = "SELECT DISTINCT cm.clientmemberID AS cmID, cm.LastName, cm.FirstName, cm.City, cm.State, '0' AS LoginType  ";
				SQLquery = SQLquery + "FROM clients_members cm  ";
				SQLquery = SQLquery + "INNER JOIN flyins f ON f.clientID = cm.clientID  ";
				SQLquery = SQLquery + "INNER JOIN meetings m ON m.flID = f.flID ";
				SQLquery = SQLquery + "INNER JOIN meetings_clients mc ON mc.meetingID = m.meetingID AND mc.clientmemberID = cm.clientmemberID ";
				SQLquery = SQLquery + "WHERE m.meetingID = " + EventID + " ";
				SQLquery = SQLquery + "AND cm.ActiveYN = 'Y' ";
				SQLquery = SQLquery + "AND cm.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND mc.ActiveYN = 'Y' ";
				SQLquery = SQLquery + "AND mc.DeletedYN = 'N' ";
				SQLquery = SQLquery + "UNION ";
				SQLquery = SQLquery + "SELECT DISTINCT s.staffID AS cmID, s.LastName, s.FirstName, 'Washington' AS City, 'DC' AS State, '1' AS LoginType ";
				SQLquery = SQLquery + "FROM staff s ";
				SQLquery = SQLquery + "INNER JOIN meetings_clients mc ON mc.clientmemberID = s.staffID ";
				SQLquery = SQLquery + "INNER JOIN meetings m ON mc.meetingID = m.meetingID ";
				SQLquery = SQLquery + "WHERE m.meetingID = " + EventID + " ";
				SQLquery = SQLquery + "AND s.ActiveYN = 'Y' ";
				SQLquery = SQLquery + "AND s.DeletedYN = 'N' ";
				SQLquery = SQLquery + "AND mc.ActiveYN = 'Y' ";
				SQLquery = SQLquery + "AND mc.DeletedYN = 'N' ";
				SQLquery = SQLquery + "ORDER BY LastName, FirstName ";
			}
			
			if (listingType == "cs") {	// List of congressional members for specific meeting
				SQLquery = "SELECT cm.congressionalMemberID, '0' AS staffID, cm.FirstName, cm.LastName, cm.MiddleInitial, cm.Nickname, ";
				SQLquery = SQLquery + "cm.Suffix, cm.Party, cm.State, cm.imageFilename, '1' AS CongressionalMember, ";
				SQLquery = SQLquery + "'' AS CongressionalMemberName, ";
				SQLquery = SQLquery + "CASE cm.Chamber ";
				SQLquery = SQLquery + "  WHEN 'Senate' THEN 'Senator' ";
				SQLquery = SQLquery + "  ELSE 'Representative' ";
				SQLquery = SQLquery + "  END AS Title, ";
				SQLquery = SQLquery + "'0' AS RepresentingType, ";
				SQLquery = SQLquery + "cm.congressionalMemberID AS RepresentingID, ";
				SQLquery = SQLquery + "'0' AS RepresentingLastName, ";
				SQLquery = SQLquery + "cm.State AS RepresentingState ";
				SQLquery = SQLquery + "FROM congressional_members cm ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc ON mc.congressionalMemberID = cm.congressionalMemberID ";
				SQLquery = SQLquery + "INNER JOIN meetings m ON m.meetingID = mc.meetingID ";
				SQLquery = SQLquery + "WHERE m.meetingID = " + EventID + " ";
				SQLquery = SQLquery + "AND m.DeletedYN = 'N' ";
				SQLquery = SQLquery + "UNION ";
				SQLquery = SQLquery + "SELECT '0' AS congressionalMemberID, cm.cmsID AS staffID, cm.FirstName, cm.LastName, '' AS MiddleInitial, '' AS Nickname, ";
				SQLquery = SQLquery + "'' AS Suffix, '' AS Party, '' AS State, '' AS imageFilename, '0' AS CongressionalMember, ";
				SQLquery = SQLquery + "'' AS CongressionalMemberName, cm.Title, ";
				SQLquery = SQLquery + "(SELECT CASE cm2.Chamber ";
				SQLquery = SQLquery + "  WHEN 'Senate' THEN 'Senator' ";
				SQLquery = SQLquery + "  ELSE 'Representative' ";
				SQLquery = SQLquery + "  END AS Title ";
				SQLquery = SQLquery + "FROM congressional_members cm2 ";
				SQLquery = SQLquery + "INNER JOIN congressional_members_staff cms2 ON cms2.congressionalMemberID = cm2.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE cms2.cmsID = cm.cmsID) AS RepresentingType, ";
				SQLquery = SQLquery + "(SELECT cm3.congressionalMemberID ";
				SQLquery = SQLquery + "FROM congressional_members cm3 ";
				SQLquery = SQLquery + "INNER JOIN congressional_members_staff cms3 ON cms3.congressionalMemberID = cm3.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE cms3.cmsID = cm.cmsID) AS RepresentingID, ";
				SQLquery = SQLquery + "(SELECT cm4.LastName ";
				SQLquery = SQLquery + "FROM congressional_members cm4 ";
				SQLquery = SQLquery + "INNER JOIN congressional_members_staff cms4 ON cms4.congressionalMemberID = cm4.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE cms4.cmsID = cm.cmsID) AS RepresentingLastName, ";
				SQLquery = SQLquery + "(SELECT cm1.State ";
				SQLquery = SQLquery + "FROM congressional_members cm1 ";
				SQLquery = SQLquery + "INNER JOIN congressional_members_staff cms1 ON cms1.congressionalMemberID = cm1.congressionalMemberID ";
				SQLquery = SQLquery + "WHERE cms1.cmsID = cm.cmsID) AS RepresentingState ";
				SQLquery = SQLquery + "FROM congressional_members_staff cm ";
				SQLquery = SQLquery + "INNER JOIN meetings_congressionals mc ON mc.cmsID = cm.cmsID ";
				SQLquery = SQLquery + "INNER JOIN meetings m ON m.meetingID = mc.meetingID ";
				SQLquery = SQLquery + "WHERE m.meetingID = " + EventID + " ";
				SQLquery = SQLquery + "AND m.DeletedYN = 'N' ";
				SQLquery = SQLquery + "ORDER BY LastName, FirstName  ";
			}

			// Personal sessions
			if (listingType == "pi") {	// Retrieve personal schedule item
			
				SQLquery = "SELECT DISTINCT itID, mtgID, Time_Start AS EventStartTime, Time_End AS EventEndTime, Location AS EventLocation, Description AS EventDescription, SUBJECT AS EventName, Date_Start AS EventDate ";
				SQLquery = SQLquery + "FROM itinerary ";
				SQLquery = SQLquery + "WHERE AttendeeID = '" + AttendeeID + "' ";
				SQLquery = SQLquery + "AND EventID = '0' ";
				SQLquery = SQLquery + "AND mtgID = " + EventID + " ";
				SQLquery = SQLquery + "AND UpdateType != 'Delete' ";
				SQLquery = SQLquery + "ORDER BY EventStartTime";

			}

			if (listingType == "pd") {	// Delete Personal agenda item
			
				SQLquery = "DELETE FROM itinerary WHERE AttendeeID = '" + AttendeeID + "' AND mtgID = " + EventID;

			}

			if (listingType == "ps") {	// Save (new/update) Personal agenda item

				SQLquery = "SELECT * FROM itinerary WHERE AttendeeID = '" + AttendeeID + "' AND mtgID = " + EventID;

			}
			
			//console.log("Database, getAgendaData Query: " + SQLquery);

			// Perform query against local SQLite database
			return new Promise(resolve => {
				
				this.sqlite.create({name: 'flyinPlanner.db', location: 'default', createFromLocation: 1}).then((db: SQLiteObject) => {

					console.log('Database: Opened DB for getAgendaData query');
					
					this.db = db;
					
					console.log('Database: Set getAgendaData query db variable');
					
					this.db.executeSql(SQLquery, <any>{}).then((data) => {
						console.log('Database: getAgendaData query: ' + JSON.stringify(data));
						console.log('Database: getAgendaData query rows: ' + data.rows.length);
						let DatabaseResponse = [];
						var SQLquery2 = "";
						if(data.rows.length > 0) {
							for(let i = 0; i < data.rows.length; i++) {
								if (listingType == "li") {
									
									dbEventDateTime = data.rows.item(i).StartDateTime;
									dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
									dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
									SQLDate = new Date(dbEventDateTime);
									visStartTime = dateFormat(SQLDate, "HH:MM:ss");
									
									dbEventDateTime = data.rows.item(i).EndDateTime;
									dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
									dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
									SQLDate = new Date(dbEventDateTime);
									visEndTime =  dateFormat(SQLDate, "HH:MM:ss");
									
									dbEventDateTime = data.rows.item(i).StartDateTime;
									dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
									dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
									SQLDate = new Date(dbEventDateTime);
									DisplayDateTime = dateFormat(SQLDate, "yyyy-mm-dd");
									
									DatabaseResponse.push({
										itID: data.rows.item(i).meetingID,
										EventID: data.rows.item(i).EventID,
										mtgID: 0,
										EventStartTime: visStartTime,
										EventEndTime: visEndTime,
										EventLocation: data.rows.item(i).Location,
										EventName: data.rows.item(i).MeetingTitle,
										EventDate: DisplayDateTime,
										congressionalMemberID: data.rows.item(i).congressionalMemberID,
										FirstName: data.rows.item(i).FirstName,
										LastName: data.rows.item(i).LastName,
										Nickname: data.rows.item(i).Nickname,
										Party: data.rows.item(i).Party,
										State: data.rows.item(i).State,
										Address: data.rows.item(i).Address,
										imageFilename: data.rows.item(i).imageFilename
									});
									resolve(DatabaseResponse);
									
								}
								if (listingType == "li2") {
									
									dbEventDateTime = data.rows.item(i).StartDateTime;
									dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
									dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
									SQLDate = new Date(dbEventDateTime);
									visStartTime = dateFormat(SQLDate, "HH:MM:ss");
									
									dbEventDateTime = data.rows.item(i).EndDateTime;
									dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
									dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
									SQLDate = new Date(dbEventDateTime);
									visEndTime =  dateFormat(SQLDate, "HH:MM:ss");
									
									dbEventDateTime = data.rows.item(i).StartDateTime;
									dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
									dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
									SQLDate = new Date(dbEventDateTime);
									DisplayDateTime = dateFormat(SQLDate, "yyyy-mm-dd");
									
									DatabaseResponse.push({
										itID: data.rows.item(i).meetingID,
										EventID: data.rows.item(i).EventID,
										mtgID: 0,
										EventStartTime: visStartTime,
										EventEndTime: visEndTime,
										EventLocation: data.rows.item(i).Location,
										MeetingType: data.rows.item(i).MeetingType,
										EventName: data.rows.item(i).MeetingTitle,
										EventDate: DisplayDateTime,
										congressionalMemberID: data.rows.item(i).congressionalMemberID,
										FirstName: data.rows.item(i).FirstName,
										LastName: data.rows.item(i).LastName,
										Nickname: data.rows.item(i).Nickname,
										Party: data.rows.item(i).Party,
										State: data.rows.item(i).State,
										Address: data.rows.item(i).Address,
										imageFilename: data.rows.item(i).imageFilename
									});
									resolve(DatabaseResponse);
									
								}
								if (listingType == "sr") {
									
									DatabaseResponse.push({
										meetingID: data.rows.item(i).meetingID,
										StartDateTime: data.rows.item(i).StartDateTime,
										EndDateTime: data.rows.item(i).EndDateTime,
										Location: data.rows.item(i).Location,
										MeetingTitle: data.rows.item(i).MeetingTitle,
										FirstName: data.rows.item(i).FirstName,
										LastName: data.rows.item(i).LastName,
										Nickname: data.rows.item(i).Nickname,
										Party: data.rows.item(i).Party,
										State: data.rows.item(i).State,
										Address: data.rows.item(i).Address,
										SQLquery: SQLquery
									});
									resolve(DatabaseResponse);
									
								}
								if (listingType == "dt") {
									
									dbEventDateTime = data.rows.item(i).StartDateTime;
									dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
									dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
									SQLDate = new Date(dbEventDateTime);
									visStartTime = dateFormat(SQLDate, "HH:MM:ss");
									
									dbEventDateTime = data.rows.item(i).EndDateTime;
									dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
									dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
									SQLDate = new Date(dbEventDateTime);
									visEndTime =  dateFormat(SQLDate, "HH:MM:ss");
									
									dbEventDateTime = data.rows.item(i).StartDateTime;
									dbEventDateTime = dbEventDateTime.replace(/-/g, '/');
									dbEventDateTime = dbEventDateTime.replace(/T/g, ' ');
									SQLDate = new Date(dbEventDateTime);
									DisplayDateTime = dateFormat(SQLDate, "yyyy-mm-dd");
									
									DatabaseResponse.push({
										itID: data.rows.item(i).meetingID,
										EventID: data.rows.item(i).meetingID,
										mtgID: 0,
										StartDateTime: data.rows.item(i).StartDateTime,
										EndDateTime: data.rows.item(i).EndDateTime,
										EventStartTime: visStartTime,
										EventEndTime: visEndTime,
										EventLocation: data.rows.item(i).Location,
										EventDescription: data.rows.item(i).EventDescription,
										MeetingType: data.rows.item(i).MeetingType,
										EventName: data.rows.item(i).MeetingTitle,
										EventDate: DisplayDateTime,
										congressionalMemberID: data.rows.item(i).congressionalMemberID,
										FirstName: data.rows.item(i).FirstName,
										LastName: data.rows.item(i).LastName,
										Nickname: data.rows.item(i).Nickname,
										Party: data.rows.item(i).Party,
										State: data.rows.item(i).State,
										Address: data.rows.item(i).Address,
										imageFilename: data.rows.item(i).imageFilename,
										OfficeX: data.rows.item(i).OfficeX,
										OfficeY: data.rows.item(i).OfficeY,
										RoomNumber: data.rows.item(i).RoomNumber,
										Chamber: data.rows.item(i).Chamber
									});
									resolve(DatabaseResponse);
									
								}
								if (listingType == "ma") {
									
									DatabaseResponse.push({
										cmID: data.rows.item(i).cmID,
										LastName: data.rows.item(i).LastName,
										FirstName: data.rows.item(i).FirstName,
										City: data.rows.item(i).City,
										State: data.rows.item(i).State,
										LoginType: data.rows.item(i).LoginType
									});
									resolve(DatabaseResponse);
									
								}
								if (listingType == "cs") {
									
									DatabaseResponse.push({
										congressionalMemberID: data.rows.item(i).congressionalMemberID,
										staffID: data.rows.item(i).staffID,
										LastName: data.rows.item(i).LastName,
										FirstName: data.rows.item(i).FirstName,
										MiddleInitial: data.rows.item(i).MiddleInitial,
										Nickname: data.rows.item(i).Nickname,
										Suffix: data.rows.item(i).Suffix,
										Party: data.rows.item(i).Party,
										State: data.rows.item(i).State,
										imageFilename: data.rows.item(i).imageFilename,
										CongressionalMember: data.rows.item(i).CongressionalMember,
										CongressionalMemberName: data.rows.item(i).CongressionalMemberName,
										Title: data.rows.item(i).Title,
										RepresentingType: data.rows.item(i).RepresentingType,
										RepresentingLastName: data.rows.item(i).RepresentingLastName
									});
									resolve(DatabaseResponse);
									
								}
								if (listingType == "pi") {
									DatabaseResponse.push({
										itID: data.rows.item(i).itID,
										EventID: data.rows.item(i).EventID,
										mtgID: data.rows.item(i).mtgID,
										EventStartTime: data.rows.item(i).EventStartTime,
										EventEndTime: data.rows.item(i).EventEndTime,
										EventLocation: data.rows.item(i).EventLocation,
										EventDescription: data.rows.item(i).EventDescription,
										EventName: data.rows.item(i).EventName,
										EventDate: data.rows.item(i).EventDate,
										Attendees: data.rows.item(i).Attendees,
										Waitlist: data.rows.item(i).Waitlist,
										RoomCapacity: data.rows.item(i).RoomCapacity
									});
									resolve(DatabaseResponse);
								}
								if (listingType == "ps") {
									if(data.rows.length > 0) {
										SQLquery2 = "UPDATE itinerary ";
										SQLquery2 = SQLquery2 + "SET UpdateType = 'Update', ";
										SQLquery2 = SQLquery2 + "Date_Start = '" + EventDate + "', ";
										SQLquery2 = SQLquery2 + "Date_End = '" + EventDate + "', ";
										SQLquery2 = SQLquery2 + "Time_Start = '" + EventStartTime + "', ";
										SQLquery2 = SQLquery2 + "Time_End = '" + EventEndTime + "', ";
										SQLquery2 = SQLquery2 + "Subject = '" + EventName + "', ";
										SQLquery2 = SQLquery2 + "Location = '" + EventLocation + "', ";
										SQLquery2 = SQLquery2 + "Description = '" + EventDescription + "', ";
										SQLquery2 = SQLquery2 + "LastUpdated = '" + LastUpdated + "' ";
										SQLquery2 = SQLquery2 + "WHERE mtgID = " + EventID + " ";
										SQLquery2 = SQLquery2 + "AND AttendeeID = '" + AttendeeID + "'";

										this.db.executeSql(SQLquery2, <any>{}).then((data2) => {
											console.log('Database: Agenda query2: ' + JSON.stringify(data2));
											console.log('Database: Agenda query rows2: ' + data2.rows.length);
											if(data2.rowsAffected > 0) {
												DatabaseResponse.push({
													PEStatus: "Success",
													PEQuery: ""
												});
											} else {
												DatabaseResponse.push({
													PEStatus: "Fail",
													PEQuery: ""
												});
											}
											resolve(DatabaseResponse);
										})
										.catch(e => console.log('Database: Agenda query2 error: ' + JSON.stringify(e)))
									} else {
										
										var itID = Math.floor(Math.random() * (9999999-1) + 1);

										SQLquery2 = "INSERT INTO itinerary (itID, AttendeeID, atID, mtgID, EventID, Time_Start, Time_End, Location, Subject, Description, Date_Start, Date_End, LastUpdated, UpdateType) ";
										SQLquery2 = SQLquery2 + "VALUES (" + itID + ", ";
										SQLquery2 = SQLquery2 + "'" + AttendeeID + "', ";
										SQLquery2 = SQLquery2 + "'" + AttendeeID + "', ";
										SQLquery2 = SQLquery2 + "'" + itID + "', ";
										SQLquery2 = SQLquery2 + "'0', ";
										SQLquery2 = SQLquery2 + "'" + EventStartTime + "', ";
										SQLquery2 = SQLquery2 + "'" + EventEndTime + "', ";
										SQLquery2 = SQLquery2 + "'" + EventLocation + "', ";
										SQLquery2 = SQLquery2 + "'" + EventName + "', ";
										SQLquery2 = SQLquery2 + "'" + EventDescription + "', ";
										SQLquery2 = SQLquery2 + "'" + EventDate + "', ";
										SQLquery2 = SQLquery2 + "'" + EventDate + "', ";
										SQLquery2 = SQLquery2 + "'" + LastUpdated + "', ";
										SQLquery2 = SQLquery2 + "'Insert')";

										this.db.executeSql(SQLquery2, <any>{}).then((data2) => {
											console.log('Database: Agenda query2: ' + JSON.stringify(data2));
											console.log('Database: Agenda query rows2: ' + data2.rows.length);
											if(data2.rowsAffected > 0) {
												DatabaseResponse.push({
													PEStatus: "Success",
													PEQuery: ""
												});
											} else {
												DatabaseResponse.push({
													PEStatus: "Fail",
													PEQuery: ""
												});
											}
											resolve(DatabaseResponse);
										})
										.catch(e => console.log('Database: Agenda query2 error: ' + JSON.stringify(e)))
									}
								}
							}
						} else {
							if (listingType == "ps") {
								var itID = Math.floor(Math.random() * (9999999-1) + 1);

								SQLquery2 = "INSERT INTO itinerary (itID, AttendeeID, atID, mtgID, EventID, Time_Start, Time_End, Location, Subject, Description, Date_Start, Date_End, LastUpdated, UpdateType) ";
								SQLquery2 = SQLquery2 + "VALUES (" + itID + ", ";
								SQLquery2 = SQLquery2 + "'" + AttendeeID + "', ";
								SQLquery2 = SQLquery2 + "'" + AttendeeID + "', ";
								SQLquery2 = SQLquery2 + "'" + itID + "', ";
								SQLquery2 = SQLquery2 + "'0', ";
								SQLquery2 = SQLquery2 + "'" + EventStartTime + "', ";
								SQLquery2 = SQLquery2 + "'" + EventEndTime + "', ";
								SQLquery2 = SQLquery2 + "'" + EventLocation + "', ";
								SQLquery2 = SQLquery2 + "'" + EventName + "', ";
								SQLquery2 = SQLquery2 + "'" + EventDescription + "', ";
								SQLquery2 = SQLquery2 + "'" + EventDate + "', ";
								SQLquery2 = SQLquery2 + "'" + EventDate + "', ";
								SQLquery2 = SQLquery2 + "'" + LastUpdated + "', ";
								SQLquery2 = SQLquery2 + "'Insert')";

								this.db.executeSql(SQLquery2, <any>{}).then((data2) => {
									console.log('Database: Agenda query2: ' + JSON.stringify(data2));
									console.log('Database: Agenda query rows2: ' + data2.rows.length);
									if(data2.rowsAffected > 0) {
										DatabaseResponse.push({
											PEStatus: "Success",
											PEQuery: ""
										});
									} else {
										DatabaseResponse.push({
											PEStatus: "Fail",
											PEQuery: ""
										});
									}
									resolve(DatabaseResponse);
								})
								.catch(e => console.log('Database: Agenda query2 error: ' + JSON.stringify(e)))
							}
							if (listingType == "pd") {
								if (data.rowsAffected == "1") {
									DatabaseResponse.push({
										PEStatus: "Success",
										PEQuery: "",
									});
								} else {
									DatabaseResponse.push({
										PEStatus: "Fail",
										PEQuery: "",
									});
								}
								resolve(DatabaseResponse);
							}
							if (listingType != "ps" && listingType != "pd") {
								resolve(DatabaseResponse);
							}
						}
						//resolve(DatabaseResponse);
					})
					.catch(e => console.log('Database: getAgendaData query error: ' + JSON.stringify(e)))
				});
				console.log('Database: getAgendaData query complete');

			});

			
		} else {
			
			// Perform query against server-based MySQL database
			var url = APIURLReference + "action=agendaquery&flags=" + flags + "&AttendeeID=" + AttendeeID;
			console.log('Database: URL call: ' + url);
			
			return new Promise(resolve => {
				this.httpCall.get(url).subscribe(
					response => {resolve(response.json());
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

	public getSearchData(flags, AttendeeID) {

		console.log("flags passed: " + flags);
		console.log("AttendeeID passed: " + AttendeeID);
		
		var searchTerms = flags || '';
		
		// Perform query against server-based MySQL database
		var url = APIURLReference + "action=searchquery&flags=" + flags + "&AttendeeID=" + AttendeeID;

		return new Promise(resolve => {
			this.httpCall.get(url).subscribe(
				response => {resolve(response.json());
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

	public getNotesData(flags, AttendeeID) {

		console.log("flags passed: " + flags);
		console.log("AttendeeID passed: " + AttendeeID);

		var DevicePlatform = this.localstorage.getLocalValue('DevicePlatform');
		var SQLquery = "";
		var flagValues = flags.split("|");
		var selectedDay = flagValues[0];    
		var listingType = flagValues[1];
		var EventID = flagValues[2];    
		var NoteID = flagValues[3];    
		var NoteText = flagValues[4];    
		var LastUpdated = flagValues[5];    
		var SQLquery = "";
		
		if (DevicePlatform == "iOS" || DevicePlatform == "Android") {
			
			if (listingType == "li") {	// List of notes
			
				// Validate query
				SQLquery = "SELECT DISTINCT n.cmnID, m.meetingID, m.MeetingTitle, m.StartDateTime, n.Note ";
				SQLquery = SQLquery + "FROM clients_members_notes n ";
				SQLquery = SQLquery + "INNER JOIN meetings m ON m.meetingID = n.meetingID ";
				SQLquery = SQLquery + "WHERE m.StartDateTime LIKE '" + selectedDay + "%' ";
				SQLquery = SQLquery + "AND n.clientmemberID = '" + AttendeeID + "'";

			}

			if (listingType == "dt") {	// Specific note
			
				// Validate query
				SQLquery = "SELECT cmn.*, m.MeetingTitle ";
				SQLquery = SQLquery + "FROM meetings m ";
				SQLquery = SQLquery + "LEFT OUTER JOIN clients_members_notes cmn ON m.meetingID = cmn.meetingID AND cmn.clientmemberID = " + AttendeeID + " ";
				SQLquery = SQLquery + "WHERE m.meetingID = " + EventID + " ";

			}

			if (listingType == "un") {	// Update specific note
			
				// Current sync time in UTC
				var LastUpdated2 = new Date().toUTCString();
				var LastUpdated = dateFormat(LastUpdated2, "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'");
				
				// Validate query
				var CorrectedNote = NoteText.replace(/'/g,"''");
				SQLquery = "UPDATE clients_members_notes SET Note = '" + CorrectedNote + "' WHERE cmnID = " + NoteID + " ";

			}
	
			if (listingType == "sn") {	// Save new note
		
				// Validate query
				//SQLquery = "INSERT INTO clients_members_notes(clientmemberID, meetingID, Note, LastUpdated, UpdateType) ";
				//SQLquery = SQLquery + "VALUES('" + AttendeeID + "','" + EventID + "','" + NoteText + "','" + LastUpdated + "','Insert')";
				var cmnID = Math.random() * (9999999-1) + 1;
				var CorrectedNote = NoteText.replace(/'/g,"''");
				SQLquery = "INSERT INTO clients_members_notes(cmnID, clientmemberID, meetingID, Note) ";
				SQLquery = SQLquery + "VALUES(" + cmnID + "," + AttendeeID + "," + EventID + ",'" + CorrectedNote + "')";

			}
			
			console.log("Notes Query: " + SQLquery);

			// Perform query against local SQLite database
			return new Promise(resolve => {
				
				this.sqlite.create({name: 'flyinPlanner.db', location: 'default', createFromLocation: 1}).then((db: SQLiteObject) => {
					
					this.db = db;
										
					this.db.executeSql(SQLquery, <any>{}).then((data) => {
						console.log('Database: Notes query: ' + JSON.stringify(data));
						console.log('Database: Notes query rows: ' + data.rows.length);
						let DatabaseResponse = [];
						if (listingType == "un" || listingType == "sn") {
							if (data.rowsAffected == "1") {
								DatabaseResponse.push({
									status: "Saved"
								});
							} else {
								DatabaseResponse.push({
									status: "Failed"
								});
							}
						} else {
							if(data.rows.length > 0) {
								for(let i = 0; i < data.rows.length; i++) {
									DatabaseResponse.push({
										cmnID: data.rows.item(i).cmnID,
										meetingID: data.rows.item(i).meetingID,
										MeetingTitle: data.rows.item(i).MeetingTitle,
										StartDateTime: data.rows.item(i).StartDateTime,
										Note: data.rows.item(i).Note
									});
								}
							}
						}
						resolve(DatabaseResponse);
					})
					.catch(e => console.log('Database: Notes query error: ' + JSON.stringify(e)))
				});
				console.log('Database: Notes query complete');

			});

		} else {

			// Perform query against server-based MySQL database
			var url = APIURLReference + "action=notesquery&flags=" + flags + "&AttendeeID=" + AttendeeID;

			return new Promise(resolve => {
				this.httpCall.get(url).subscribe(
					response => {resolve(response.json());
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

	public getDatabaseStats(flags, AttendeeID) {

		console.log("flags passed: " + flags);
		console.log("AttendeeID passed: " + AttendeeID);

		var flagValues = flags.split("|");
		var listingType = flagValues[0];
		var listingParameter = flagValues[1];
		var listingValue = flagValues[2];
		var AttendeeProfileTitle = flagValues[3];
		var AttendeeProfileOrganization = flagValues[4];
		
		// Perform query against server-based MySQL database
		var url = APIURLReference + "action=statsquery&flags=" + flags + "&AttendeeID=" + AttendeeID;

		return new Promise(resolve => {
			this.httpCall.get(url).subscribe(
				response => {resolve(response.json());
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

	// -----------------------------------
	// 
	// Messaging Functions
	// 
	// -----------------------------------
	public getMessagingData(flags, AttendeeID) {

		console.log("flags passed: " + flags);
		console.log("AttendeeID passed: " + AttendeeID);

		var DevicePlatform = this.localstorage.getLocalValue('DevicePlatform');
		var FlyinID = this.localstorage.getLocalValue("FlyinMeetingID");
		var flagValues = flags.split("|");
		var listingType = flagValues[0];
		var sortingType = flagValues[1];
		var receiverID = flagValues[2];
		var pnTitle = flagValues[3];
		var pnMessage = flagValues[4];
		var DateTimeReceived = flagValues[5];
		var SQLquery = "";
		
		if (DevicePlatform == "iOS" || DevicePlatform == "Android") {
			
			if (listingType == "pn") {	// List of notifications
			
				// Validate query
				SQLquery = "SELECT DISTINCT pushTitle, pushMessage, pushDateTimeReceived ";
				SQLquery = SQLquery + "FROM push_notifications ";
				SQLquery = SQLquery + "WHERE clientmemberID = '" + AttendeeID + "' ";
				SQLquery = SQLquery + "AND (flID = '" + FlyinID + "' OR flID IS NULL OR flID = '') ";
				SQLquery = SQLquery + "ORDER BY pushDateTimeReceived DESC ";
				
				console.log('Database, Push notification list query: ' + SQLquery);
			}

			// Perform query against local SQLite database
			return new Promise(resolve => {
				
				this.sqlite.create({name: 'flyinPlanner.db', location: 'default', createFromLocation: 1}).then((db: SQLiteObject) => {
					
					this.db = db;
										
					this.db.executeSql(SQLquery, <any>{}).then((data) => {
						let DatabaseResponse = [];
						if(data.rows.length > 0) {
							for(let i = 0; i < data.rows.length; i++) {
								DatabaseResponse.push({
									pushTitle: data.rows.item(i).pushTitle,
									pushMessage: data.rows.item(i).pushMessage,
									pushDateTimeReceived: data.rows.item(i).pushDateTimeReceived
								});
							}
						}
						resolve(DatabaseResponse);
					})
					.catch(e => console.log('Database: Push notification list query error: ' + JSON.stringify(e)))
				});
				console.log('Database: Push notification list query complete');

			});

		} else {
			
			// Perform query against server-based MySQL database
			var url = APIURLReference + "action=msgquery&flags=" + flags + "&AttendeeID=" + AttendeeID;

			return new Promise(resolve => {
				this.httpCall.get(url).subscribe(
					response => {
						console.log('msgquery response: ' + JSON.stringify(response.json()));
						resolve(response.json());
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

	// -----------------------------------
	// 
	// Help Database Functions
	// 
	// -----------------------------------
	public sendHelpData(flags, AttendeeID) {

		console.log("sendHelpData: flags passed: " + flags);
		var SQLquery = "";
		var DevicePlatform = this.localstorage.getLocalValue('DevicePlatform');
		
		if (DevicePlatform == "iOS" || DevicePlatform == "Android") {
			
			console.log('sendHelpData: Send data to SQLite');
			var flagValues = flags.split("|");		// Split concatenated values
			var listingType = flagValues[0];		// Listing Type
			var SenderName = flagValues[1];			// Sender's Name
			var SenderEmail = flagValues[2];    	// Sender's Email
			var SenderPhone = flagValues[3];    	// Sender's Phone
			var SenderComments = flagValues[4];		// Sender's Comments

			SQLquery = "INSERT INTO help_contact_form (SenderName, SenderEmail, SenderPhone, SenderComments) ";
			SQLquery = SQLquery + "VALUES ('" + SenderName + "', ";
			SQLquery = SQLquery + "'" + SenderEmail + "', ";
			SQLquery = SQLquery + "'" + SenderPhone + "', ";
			SQLquery = SQLquery + "'" + SenderComments + "' ";
			SQLquery = SQLquery + ") ";

			console.log("sendHelpData Members Query: " + SQLquery);

			// Perform query against local SQLite database
			return new Promise(resolve => {
				
				this.sqlite.create({name: 'flyinPlanner.db', location: 'default', createFromLocation: 1}).then((db: SQLiteObject) => {

					console.log('Database: Opened DB for sendHelpData query');
					
					this.db = db;
					let DatabaseResponse = [];
					
					console.log('Database: Set sendHelpData query db variable');
					
					this.db.executeSql(SQLquery, <any>{}).then((data) => {
						if (data.rowsAffected == "1") {
							DatabaseResponse.push({
								hcfStatus: "Success"
							});
						} else {
							DatabaseResponse.push({
								hcfStatus: "Fail"
							});
						}
						resolve(DatabaseResponse);
					})
					.catch(e => console.log('Database: sendHelpData query error: ' + JSON.stringify(e)))
				});
				console.log('Database: sendHelpData query complete');

			});

			
		} else {
			
			console.log('sendHelpData: Push data to MySQL');

			// Perform query against server-based MySQL database
			var url = APIURLReference + "action=hlpquery&flags=" + flags + "&AttendeeID=" + AttendeeID;
			console.log(url);
			
			return new Promise(resolve => {
				this.httpCall.get(url).subscribe(
					response => {
						console.log("Database: sendHelpData data: " + JSON.stringify(response.json()));
						resolve(response.json());
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

	// -----------------------------------
	// 
	// Survey Functions
	// 
	// -----------------------------------
	public sendSurveyData(flags, AttendeeID) {

		console.log("sendSurveyData: flags passed: " + flags);
			
		// Perform query against server-based MySQL database
		var url = APIURLReference + "action=srvyquery&flags=" + flags + "&AttendeeID=" + AttendeeID;
		console.log(url);
		
		return new Promise(resolve => {
			this.httpCall.get(url).subscribe(
				response => {
					console.log("Database: sendSurveyData data: " + JSON.stringify(response.json()));
					resolve(response.json());
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

	// -----------------------------------
	// 
	// Document Functions
	// 
	// -----------------------------------
	public getDocumentData(flags, AttendeeID) {

		console.log("flags passed: " + flags);
		console.log("AttendeeID passed: " + AttendeeID);

		var DevicePlatform = this.localstorage.getLocalValue('DevicePlatform');
		var SQLquery = "";
		var flagValues = flags.split("|");
		var listingType = flagValues[0];
		var FlyinID = flagValues[1];    
		var DocumentID = flagValues[2];    
		var SQLquery = "";
		
		if (DevicePlatform == "iOS" || DevicePlatform == "Android") {
			
			if (listingType == "li") {	// List of Documents
			
				// Validate query
				SQLquery = "SELECT DISTINCT fmTitle, fmFilename ";
				SQLquery = SQLquery + "FROM flyins_material ";
				SQLquery = SQLquery + "WHERE flID = " + FlyinID + " ";
				SQLquery = SQLquery + "AND fmActiveYN = 'Y'";

			}
			
			console.log("Documents Query: " + SQLquery);

			// Perform query against local SQLite database
			return new Promise(resolve => {
				
				this.sqlite.create({name: 'flyinPlanner.db', location: 'default', createFromLocation: 1}).then((db: SQLiteObject) => {
					
					this.db = db;
										
					this.db.executeSql(SQLquery, <any>{}).then((data) => {
						console.log('Database: Documents query: ' + JSON.stringify(data));
						console.log('Database: Documents query rows: ' + data.rows.length);
						let DatabaseResponse = [];
						if(data.rows.length > 0) {
							for(let i = 0; i < data.rows.length; i++) {
								DatabaseResponse.push({
									//fmID: data.rows.item(i).fmID,
									//flID: data.rows.item(i).flID,
									fmTitle: data.rows.item(i).fmTitle,
									fmFilename: data.rows.item(i).fmFilename
								});
							}
						}
						resolve(DatabaseResponse);
					})
					.catch(e => console.log('Database: Documents query error: ' + JSON.stringify(e)))
				});
				console.log('Database: Documents query complete');

			});

		} else {

			// Perform query against server-based MySQL database
			var url = APIURLReference + "action=docsquery&flags=" + flags + "&AttendeeID=" + AttendeeID;

			return new Promise(resolve => {
				this.httpCall.get(url).subscribe(
					response => {resolve(response.json());
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

	// -----------------------------------
	// 
	// Freeform QUeries
	// 
	// -----------------------------------
	public getSQLiteData(SQLquery, TableName, AttendeeID) {

		console.log("getSQLiteData, Query passed: " + SQLquery);
		console.log("getSQLiteData, TableName passed: " + TableName);
		console.log("AttendeeID passed: " + AttendeeID);

		var DevicePlatform = this.localstorage.getLocalValue('DevicePlatform');
		
		if (DevicePlatform == "iOS" || DevicePlatform == "Android") {
			
			// Perform query against local SQLite database
			return new Promise(resolve => {
				
				this.sqlite.create({name: 'flyinPlanner.db', location: 'default', createFromLocation: 1}).then((db: SQLiteObject) => {
					
					this.db = db;
										
					this.db.executeSql(SQLquery, <any>{}).then((data) => {
						console.log('Database: getSQLiteData query: ' + JSON.stringify(data));
						console.log('Database: getSQLiteData query rows: ' + data.rows.length);
						let DatabaseResponse = [];
						if(data.rows.length > 0) {
							for(let i = 0; i < data.rows.length; i++) {
								
								if (TableName == 'staff') {
									DatabaseResponse.push({
										staffID: data.rows.item(i).staffID,
										FirstName: data.rows.item(i).FirstName,
										LastName: data.rows.item(i).LastName,
										Company: data.rows.item(i).Company,
										Title: data.rows.item(i).Title,
										ProfileImage: data.rows.item(i).ProfileImage,
										emailAddress: data.rows.item(i).emailAddress,
										PhoneWork: data.rows.item(i).PhoneWork,
										ActiveYN: data.rows.item(i).ActiveYN,
										DeletedYN: data.rows.item(i).DeletedYN,
										PrimeStaffYN: data.rows.item(i).PrimeStaffYN
									});
								}
								if (TableName == 'meetings_clients') {
									DatabaseResponse.push({
										mcID: data.rows.item(i).mcID,
										meetingID: data.rows.item(i).meetingID,
										clientmemberID: data.rows.item(i).clientmemberID,
										ActiveYN: data.rows.item(i).ActiveYN,
										DeletedYN: data.rows.item(i).DeletedYN
									});
								}
								if (TableName == 'flyins_staff') {
									DatabaseResponse.push({
										staffID: data.rows.item(i).staffID,
										flID: data.rows.item(i).flID
									});
								}
							}
						}
						resolve(DatabaseResponse);
					})
					.catch(e => console.log('Database: getSQLiteData query error: ' + JSON.stringify(e)))
				});
				console.log('Database: getSQLiteData query complete');

			});

		} else {

			// Perform query against server-based MySQL database
			var url = APIURLReference + "action=sqlquery&flags=" + SQLquery + "&AttendeeID=" + AttendeeID;

			return new Promise(resolve => {
				this.httpCall.get(url).subscribe(
					response => {resolve(response.json());
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
	
}
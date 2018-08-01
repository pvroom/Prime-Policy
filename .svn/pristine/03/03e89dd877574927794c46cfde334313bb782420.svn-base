function formatTime(TimeValue) {
	// Check correct time format and split into components
	TimeValue = TimeValue.substring(0, 5);  // Strip off seconds
	TimeValue = TimeValue.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [TimeValue];

	if (TimeValue.length > 1) { // If time format correct
		TimeValue = TimeValue.slice(1);  // Remove full string match value
		TimeValue[5] = +TimeValue[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
		TimeValue[0] = +TimeValue[0] % 12 || 12; // Adjust hours
	}

	return TimeValue.join(''); // return adjusted time or original string

}


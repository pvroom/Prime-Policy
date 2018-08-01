function ConvertM2HM(min) {
    //var hours = Math.trunc(min / 60); // Usable in Android 5.x and higher
    var hours = Math.floor(min / 60);  // Usable in any version of Android
    var minutes = min % 60;
    var displaystring = "";
    if (hours == 1) {
        displaystring = hours + " hr";
    } else {
        displaystring = hours + " hrs";
    }
    if (minutes > 0) {
        displaystring = displaystring + " " + minutes + " mins";
    }
    return displaystring;
}

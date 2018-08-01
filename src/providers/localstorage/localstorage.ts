import { Injectable } from '@angular/core';

@Injectable()
export class Localstorage {

    // Store the key-value pair passed to this function
    setLocalValue(itemID, itemValue){
		localStorage.setItem(itemID, itemValue);
		console.log('Localstorage provider: Set ' + itemID + ' to ' + itemValue);
    }

    // Get the stored value for the key passed to this function
    getLocalValue(itemID){
    	var itemValue = localStorage.getItem(itemID);
		console.log('Localstorage provider: Retrieved ' + itemID + ': ' + itemValue);
		return itemValue;
    }

}
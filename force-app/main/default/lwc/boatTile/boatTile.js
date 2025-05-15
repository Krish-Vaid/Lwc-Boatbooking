import { api, LightningElement } from 'lwc';

// Constants for the tile wrapper classes
const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';

export default class BoatTile extends LightningElement {
    // Public properties to be passed into the component
    @api boat;  // Holds the boat data
    @api selectedBoatId;  // Holds the selected boat's Id

    // Getter to dynamically set the background image for the boat tile
    get backgroundStyle() {
        console.log(this.boat.Picture__c); // Log the URL to ensure it's correct

        return `background-image:url(${this.boat.Picture__c})`;
    }

    // Getter for dynamically setting the tile class based on selection
    get tileClass() {
        return this.boat.Id === this.selectedBoatId
            ? TILE_WRAPPER_SELECTED_CLASS
            : TILE_WRAPPER_UNSELECTED_CLASS;
    }

    // Method that fires an event when the boat tile is clicked
    selectBoat() {
        // Fire the boatselect event with the boatId in the detail object
        const boatselectEvent = new CustomEvent('boatselect', {
            detail: {
                boatId: this.boat.Id,  // Send the boat Id in the event
            }
        });
        this.dispatchEvent(boatselectEvent);
    }
}

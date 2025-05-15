import { LightningElement, wire, track } from 'lwc';
import getBoats from '@salesforce/apex/BoatController.getBoats';

export default class Highlight extends LightningElement {
    @track boats = [];
    error;

    @wire(getBoats)
    wiredBoats({ error, data }) {
        if (data) {
            this.boats = data.slice(0, 4).map(boat => ({
                id: boat.Id,
                name: boat.Name,
                imageUrl: boat.Picture__c
            }));
        } else if (error) {
            this.error = error;
            this.boats = [];
        }
    }

    handleBookNow() {
        window.open('/boatBook/book-your-boat', '_self');
    }
}

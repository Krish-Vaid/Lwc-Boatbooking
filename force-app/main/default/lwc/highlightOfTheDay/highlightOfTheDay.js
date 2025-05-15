import { LightningElement, wire, track } from 'lwc';
import getBoats from '@salesforce/apex/BoatController.getBoats';

export default class BoatPhotoViewer extends LightningElement {
    @track boats = [];
    @track currentIndex = 0;
    error;

    @wire(getBoats)
    wiredBoats({ error, data }) {
        if (data) {
            this.boats = data.map(boat => ({
                id: boat.Id,
                name: boat.Name,
                imageUrl: boat.Picture__c // Use Picture__c instead of Boat_Image__c
            }));

            this.startImageRotation();
        } else if (error) {
            this.error = error;
            this.boats = [];
        }
    }

    startImageRotation() {
        if (this.boats.length > 0) {
            setInterval(() => {
                this.currentIndex = (this.currentIndex + 1) % this.boats.length;
            }, 5000);
        }
    }

    get currentBoat() {
        return this.boats.length > 0 ? this.boats[this.currentIndex] : null;
    }

    get currentBoatImage() {
        return this.currentBoat ? this.currentBoat.imageUrl : '';
    }

    get currentBoatName() {
        return this.currentBoat ? this.currentBoat.name : 'Loading...';
    }

    handleBookNow() {
        window.open('/boatBook/book-your-boat', '_self');
    }
}

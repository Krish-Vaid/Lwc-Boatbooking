import { LightningElement, wire } from 'lwc';
import getBoatOptions from '@salesforce/apex/BoatDataService.getBoatOptions';
import saveBooking from '@salesforce/apex/SaveBookingController.saveBooking';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BoatBooking extends LightningElement {
    selectedBoatPrice = 0;
    selectedBoatImage = '';  // Store the selected boat image URL
    selectedBoatLocation = { latitude: null, longitude: null };  // Store the selected boat location
    Name = '';
    Email = '';
    bookingDate = '';
    boatOptions = [];
    boatType = '';
    endBookingDate = '';
    bookingTimestamp = null; // Track the booking timestamp for cancellation logic (no longer needed)
    successMessage = '';
    errorMessage = '';

    // Wire method to get boat options
    @wire(getBoatOptions)
    wiredBoats({ error, data }) {
        if (data) {
            this.boatOptions = data.map(boat => ({
                label: boat.Name,     
                value: boat.Id,       // Use boat Id as the value
                Price__c: boat.Price__c,  // Include the price
                Picture__c: boat.Picture__c, // Use the Picture__c field directly
                Geolocation__c: boat.Geolocation__c // Get the Geolocation__c field
            }));
        } else if (error) {
            console.error('Error fetching boat options', error);
        }
    }

    // Handler for name input
    handleName(event) {
        this.Name = event.target.value;
    }

    // Handler for end booking date
    handleEndBookingDate(event) {
        this.endBookingDate = event.target.value;
    }

    // Handler for email input
    handleEmail(event) {
        this.Email = event.target.value;
    }

    // Handler for booking date input
    handleBookingDate(event) {
        this.bookingDate = event.target.value;
    }

    // Handler for boat selection
    handleBoatOptions(event) {
        this.boatType = event.target.value; // Update selected boat ID
        const selectedBoat = this.boatOptions.find(boat => boat.value === this.boatType);
        this.selectedBoatPrice = selectedBoat ? selectedBoat.Price__c : 0;

        // Use the Picture__c field to get the image URL
        if (selectedBoat && selectedBoat.Picture__c) {
            this.selectedBoatImage = selectedBoat.Picture__c; // Direct URL from Picture__c
        } else {
            this.selectedBoatImage = ''; // No image available
        }

        // Extract and store the boat's location from the Geolocation__c field
        if (selectedBoat && selectedBoat.Geolocation__c) {
            const geolocation = selectedBoat.Geolocation__c;
            this.selectedBoatLocation = {
                latitude: geolocation.latitude,
                longitude: geolocation.longitude
            };
        } else {
            this.selectedBoatLocation = { latitude: null, longitude: null }; // Clear location if not available
        }
    }

    // Handler for booking submission
    handleBooking() {
        // Validate input data before making the booking
        if (!this.Name || !this.Email || !this.bookingDate || !this.boatType) {
            // Show an error toast if any required field is missing
            this.showToast('Error', 'Please fill out all fields');
            return;
        }

        // Call the Apex method to save the booking and send the email
        saveBooking({ 
            name: this.Name,
            email: this.Email,
            bookingDate: this.bookingDate,
            endBookingDate: this.endBookingDate,
            boatId: this.boatType, // Boat ID
            price: this.selectedBoatPrice
        })
        .then(() => {
            // Show a success toast message
            this.showToast('Success', 'Your booking was successful');
            this.resetForm();
            this.successMessage = `Congrats For the trip, Your Boat has been reserved`;
            this.errorMessage = '';
        })
        .catch(error => {
            // Show an error toast if something goes wrong
            console.error('Error:', error);
            this.showToast('Error There was an issue with your booking', error);
            this.errorMessage = `Error: Sorry the boat isn't available  `;
            this.successMessage = '';
        });
    }

    // Utility method to show toast messages
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }

    // Getter to create the map markers
    get mapMarkers() {
        return [
            {
                location: {
                    Latitude: this.selectedBoatLocation.latitude,
                    Longitude: this.selectedBoatLocation.longitude
                },
                title: 'Boat Location',
                description: 'This is where the boat is located',
            }
        ];
    }

    resetForm(){
        this.Name='';
        this.Email='';
        this.bookingDate='';
        this.endBookingDate='';
        this.boatId='';
        this.price='';

    }
}

import { LightningElement } from 'lwc';
import createContact from '@salesforce/apex/SaveBookingController.createContact';
export default class CreateContact extends LightningElement {   
    contactName = '';
    contactEmail = '';
    contactId;
    contactCreated = false;
    errorMessage = '';

    handleNameChange(event) {
        this.contactName = event.target.value;
    }

    handleEmailChange(event) {
        this.contactEmail = event.target.value;
    }

    handleCreateContact() {
        // Reset error message before making a new request
        this.errorMessage = '';

        // Call the Apex method to create the contact
        createContact({ contactName: this.contactName, contactEmail: this.contactEmail })
            .then(result => {
                this.contactId = result;
                this.contactCreated = true;
            })
            .catch(error => {
                // Handle the error gracefully
                if (error.body && error.body.message) {
                    this.errorMessage = error.body.message;
                } else {
                    this.errorMessage = 'An unexpected error occurred. Please try again later.';
                }
            });
    }
}
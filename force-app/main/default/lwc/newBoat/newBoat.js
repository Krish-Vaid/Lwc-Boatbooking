import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createBoat from '@salesforce/apex/BoatController.createBoat';

import getContacts from '@salesforce/apex/BoatController.getContacts'; // Apex method to get Contacts
import getBoatTypes from '@salesforce/apex/BoatController.getBoatTypes'; // Apex method to get Boat Types

export default class NewBoat extends LightningElement {
    Name = '';
    Price = '';
    Description = '';
    Latitude = '';
    Longitude = '';
    Length = '';
    YearBuilt = '';
    selectedContactId = '';
    selectedBoatTypeId = '';
    Picture__c = ''; 
    successMessage = '';
    errorMessage = '';
    
    // Arrays to hold combobox options
    contactOptions = [];
    boatTypeOptions = [];

    // Fetch contacts and boat types on component load
    @wire(getContacts)
    wiredContacts({ error, data }) {
        if (data) {
            this.contactOptions = data.map(contact => ({
                label: contact.Name,
                value: contact.Id
            }));
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    @wire(getBoatTypes)
    wiredBoatTypes({ error, data }) {
        if (data) {
            this.boatTypeOptions = data.map(boatType => ({
                label: boatType.Name,
                value: boatType.Id
            }));
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    handleName(event) {
        this.Name = event.target.value;
    }

    handlePrice(event) {
        this.Price = event.target.value;
    }

    handleDescription(event) {
        this.Description = event.target.value;
    }

    handleLatitude(event) {
        this.Latitude = event.target.value;
    }

    handleLongitude(event) {
        this.Longitude = event.target.value;
    }

    handleLength(event) {
        this.Length = event.target.value;
    }

    handleYearBuilt(event) {
        this.YearBuilt = event.target.value;
    }

    handleContactChange(event) {
        this.selectedContactId = event.target.value; // Get the selected Contact ID
    }

    handleBoatTypeChange(event) {
        this.selectedBoatTypeId = event.target.value; // Get the selected Boat Type ID
    }

    handlePictureChange(event) {
        this.Picture__c = event.target.value; // Store the image URL in Picture__c
    }

    handleCreation() {
        // Validate that required fields are filled
        if (!this.Name || !this.Price || !this.selectedContactId || !this.selectedBoatTypeId || !this.Latitude || !this.Longitude) {
            this.showToast('Error', 'Please fill in all required fields.', 'error');
            return;
        }


        // Call Apex method to create the boat record
        createBoat({
            Name: this.Name,
            Price: this.Price,
            Description: this.Description,
            Latitude: this.Latitude,
            Longitude: this.Longitude,  
            Length: this.Length,
            YearBuilt: this.YearBuilt,
            ContactId: this.selectedContactId,
            BoatTypeId: this.selectedBoatTypeId,
            PictureUrl: this.Picture__c
        })
        .then(result => {
            //console.log(latitude);
            this.showToast('Success Boat created successfully! success');
            this.resetForm();
            this.successMessage = `Your boat has been registered on the site`;
            this.errorMessage = '';
        })
        .catch(error => {
            this.showToast('Error Failed to create the boat: ' + error.body.message, );
            Alert(error.body.message);
            this.errorMessage = `Error: Sorry Check the value of geolocation or the image url `;
             this.successMessage = '';
        });
    }

    resetForm() {
        // Reset the form fields after creation
        this.Name = '';
        this.Price = '';
        this.Description = '';
        this.Latitude = '';
        this.Longitude = '';
        this.Length = '';
        this.YearBuilt = '';
        this.selectedContactId = '';  // Reset the selected Contact ID
        this.selectedBoatTypeId = ''; // Reset the selected Boat Type ID
        this.Picture__c = ''; // Reset Picture URL
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}

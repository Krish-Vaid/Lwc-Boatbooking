import { LightningElement } from 'lwc';

export default class BoatSearch extends LightningElement {
    isLoading = false;
    
    // Handles loading event
    handleLoading() {
        this.isLoading = true;
    }
    
    // Handles done loading event
    handleDoneLoading() {
        this.isLoading = false;
    }
    
    // Handles search boat event
    // This custom event comes from the form
    searchBoats(event) {
        let boatTypeId = event.detail.boatTypeId;
        this.template.querySelector('c-boat-search-results').searchBoats(boatTypeId);
        console.log('Verifying the code');
        this.handleDoneLoading();
    }
    
   
}
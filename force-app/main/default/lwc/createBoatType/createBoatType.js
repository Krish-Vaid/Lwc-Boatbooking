import { LightningElement } from 'lwc';

export default class CreateBoatType extends LightningElement { 
    successMessage = '';
    errorMessage = '';

    // Success handler
    handleSuccess(event) {
        // Event detail contains the created record id
        const recordId = event.detail.id;
        this.successMessage = `Boat Type created successfully with ID: ${recordId}`;
        this.errorMessage = '';  // Clear any previous errors
    }

    // Error handler
    handleError(event) {
        this.errorMessage = `Error: ${event.detail.message}`;
        this.successMessage = '';  // Clear any previous success message
    }
}
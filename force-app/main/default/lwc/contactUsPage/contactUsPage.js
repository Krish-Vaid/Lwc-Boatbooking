import { LightningElement } from 'lwc';
import saveContactInquiry from '@salesforce/apex/BoatController.saveContactInquiry';

export default class ContactUsForm extends LightningElement {
    // Track form fields
    name = '';
    email = '';
    phone = '';
    message = '';
    inquiryType = '';
    
    // Options for the inquiry type dropdown
    inquiryTypes = [
        { label: 'General Question', value: 'General Question' },
        { label: 'Changing Profile to Admin', value: 'Changing Profile to Admin' },
        { label: 'Feedback or Suggestions', value: 'Feedback or Suggestions' },
        { label: 'Booking Assistance', value: 'Booking Assistance' }
    ];
    
    // Success and error messages
    isSuccess = false;
    isError = false;

    // Handle input change events
    handleInputChange(event) {
        const field = event.target.dataset.id;
        if (field === 'name') {
            this.name = event.target.value;
        } else if (field === 'email') {
            this.email = event.target.value;
        } else if (field === 'message') {
            this.message = event.target.value;
        } else if (field === 'inquiryType') {
            this.inquiryType = event.target.value;
        }
    }

    // Handle form submission
    handleSubmit() {
        

        // Basic client-side validation
        if (!this.name || !this.email || !this.message || !this.inquiryType) {
            this.isError = true;
            return;
        }

        // Call the Apex method to save the inquiry
        saveContactInquiry({
            name: this.name,
            email: this.email,
            phone: this.phone,
            message: this.message,
            inquiryType: this.inquiryType
        })
            .then(() => {
                this.isSuccess = true;
                this.isError = false;

                // Reset form fields
                this.name = '';
                this.email = '';
                this.phone = '';
                this.message = '';
                this.inquiryType = '';
            })
            .catch((error) => {
                this.isError = true;
                this.isSuccess = false;
                console.error("Error saving contact inquiry:", error);
            });
    }
}

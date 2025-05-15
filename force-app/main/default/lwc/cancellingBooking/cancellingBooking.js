import { LightningElement, track } from 'lwc';
import generateAndSaveOtp from '@salesforce/apex/SaveBookingController.generateAndSaveOtp';
import verifyOtp from '@salesforce/apex/SaveBookingController.verifyOtp';
import cancelBooking from '@salesforce/apex/SaveBookingController.cancelBooking';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BoatBooking extends LightningElement {
    @track email = '';
    @track enteredOtp = '';
    @track name = '';
    @track bookingDate = '';
    @track endBookingDate = '';
    @track isOtpSent = false;
    @track isOtpVerified = false;

    // Input Handlers
    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handleOtpChange(event) {
        this.enteredOtp = event.target.value;
    }

    handleNameChange(event) {
        this.name = event.target.value;
    }

    handleBookingDateChange(event) {
        this.bookingDate = event.target.value;
    }

    handleEndBookingDateChange(event) {
        this.endBookingDate = event.target.value;
    }

    // Send OTP
    sendOtp() {
        if (!this.email) {
            this.showToast('Error', 'Please enter your email to receive OTP.', 'error');
            return;
        }

        generateAndSaveOtp({ email: this.email })
            .then(() => {
                this.isOtpSent = true;
                this.showToast('Success', 'OTP has been sent to your email!', 'success');
            })
            .catch(error => {
                console.error('Error sending OTP:', error);
                this.showToast('Error', 'Failed to send OTP. Please try again.', 'error');
            });
    }

    // Verify OTP
    verifyOtpHandler() {
        if (!this.email || !this.enteredOtp) {
            this.showToast('Error', 'Please enter both email and OTP.', 'error');
            return;
        }

        verifyOtp({ email: this.email, userEnteredOtp: this.enteredOtp })
            .then(result => {
                if (result) {
                    this.isOtpVerified = true;
                    this.showToast('Success', 'OTP verified successfully!', 'success');
                } else {
                    this.showToast('Error', 'Invalid OTP. Please try again.', 'error');
                }
            })
            .catch(error => {
                console.error('Error verifying OTP:', error);
                this.showToast('Error', 'Failed to verify OTP.', 'error');
            });
    }

    // Cancel Booking
    handleCancelBooking() {
        if (!this.email || !this.bookingDate) {
            this.showToast('Error', 'Please provide both email and booking date.', 'error');
            return;
        }

        cancelBooking({ email: this.email, bookingDate: this.bookingDate })
            .then(() => {
                this.showToast('Success', 'Your booking has been successfully canceled!', 'success');
                this.resetForm();
            })
            .catch(error => {
                console.error('Error canceling booking:', error);
                this.showToast('Error', 'Failed to cancel booking. Please try again.', 'error');
            });
    }

    // Show Toast
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant,
            })
        );
    }

    // Reset Form
    resetForm() {
        this.email = '';
        this.enteredOtp = '';
        this.name = '';
        this.bookingDate = '';
        this.endBookingDate = '';
        this.isOtpSent = false;
        this.isOtpVerified = false;
    }
}

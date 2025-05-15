public with sharing class SaveBookingController {

    @AuraEnabled
    public static void saveBooking(String name, String email, String bookingDate, String endBookingDate, String boatId) {
        try {
            // Ensure the dates are in the future
            Date parsedStartDate = Date.valueOf(bookingDate);
            Date parsedEndDate = Date.valueOf(endBookingDate);

            // Today's date for comparison
            Date today = Date.today();

            // Validate the booking dates are not in the past
            if (parsedStartDate < today || parsedEndDate < today) {
                throw new AuraHandledException('Booking date cannot be in the past.');
            }

            // Ensure end date is after start date
            if (parsedEndDate < parsedStartDate) {
                throw new AuraHandledException('End booking date cannot be before the start booking date.');
            }

            // Query for the selected boat's price and associated contact's email from the Boat__c object
            Boat__c selectedBoat = [SELECT Price__c, Contact__r.Email FROM Boat__c WHERE Id = :boatId LIMIT 1];

            if (selectedBoat == null) {
                throw new AuraHandledException('Boat not found');
            }

            // Check for existing bookings for the same boat that overlap with the selected dates
            List<Boat_Booking__c> existingBookings = [
                SELECT Id, Boat__c, Booking_Date__c, End_Booking_Date__c
                FROM Boat_Booking__c
                WHERE Boat__c = :boatId
                AND (
                    (Booking_Date__c <= :parsedEndDate AND End_Booking_Date__c >= :parsedStartDate) 
                )
            ];

            // If any existing bookings overlap, throw an exception
            if (existingBookings.size() > 0) {
                throw new AuraHandledException('The selected boat is already booked during the chosen dates.');
            }
            System.debug('Emails Sent: ' + Limits.getEmailInvocations());

            // Create a new Boat Booking record if all checks pass
            Boat_Booking__c booking = new Boat_Booking__c(
                Name = name,
                Email__c = email,
                Booking_Date__c = parsedStartDate,
                End_Booking_Date__c = parsedEndDate,
                Boat__c = boatId,
                Total_Cost__c = selectedBoat.Price__c  // Use the price from the selected boat
            );

            insert booking;

            // Send confirmation email to the user
         //  sendBookingEmail(email, name, parsedStartDate, parsedEndDate, selectedBoat.Price__c);

            // If the boat has a contact, send them a reservation email
            //if (selectedBoat.Contact__r != null && selectedBoat.Contact__r.Email != null) {
              //  reserveEmail(selectedBoat.Contact__r.Email, name, parsedStartDate, parsedEndDate);
            //}

        } catch (Exception e) {
            // Log and handle exceptions
            System.debug('Error occurred while saving booking: ' + e.getMessage());
            throw new AuraHandledException('Error saving booking: ' + e.getMessage());
        }
    }

    private static void sendBookingEmail(String email, String name, Date startDate, Date endDate, Decimal price) {
        try {
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setToAddresses(new String[] { email });
            mail.setSubject('Booking Confirmation');

            String emailBody = 'Hello ' + name + ',\n\n' +
                               'Your booking has been confirmed from ' + startDate.format() + ' to ' + endDate.format() + '.\n' +
                               'Total Price: $' + price + '\n\n' +
                               'Thank you for choosing our service!\n\n' +
                               'Best regards,\n' +
                               'The Boat Booking Team\n' +
                               'You can cancel your booking within 48 hours only.';
                              //<img src="/resource/BoatImage"/><br>';
                               mail.setPlainTextBody(emailBody); 
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
        } catch (Exception e) {
            throw new AuraHandledException('Error sending email: ' + e.getMessage());
        }
    } 

    private static void reserveEmail(String email, String name, Date startDate, Date endDate) {
        try {
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setToAddresses(new String[] { email });
            mail.setSubject('Boat Reserved');

            String emailBody = 'Hello,\n\n' +
                               'Your boat has been reserved by ' + name + '.\n\n' +
                               'Reservation from ' + startDate.format() + ' to ' + endDate.format() + '.\n\n' +
                               'Best regards,\n' +
                               'The Boat Reservation Company';

            mail.setPlainTextBody(emailBody); 
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });

        } catch (Exception e) {
            throw new AuraHandledException('Error sending reservation email: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static String cancelBooking(String email, String bookingDate) {
        try {
            Date parsedBookingDate = Date.valueOf(bookingDate);  

            Boat_Booking__c booking = [
                SELECT Id, Name, Email__c, Booking_Date__c
                FROM Boat_Booking__c
                WHERE Email__c = :email 
                AND Booking_Date__c = :parsedBookingDate
                LIMIT 1
            ];

            if (booking != null) {
                delete booking;  

                //sendCancellationEmail(email, booking.Name, parsedBookingDate);

                return 'Booking successfully cancelled.';
            } else {
                return 'Booking not found with the provided details.';
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error while cancelling booking: ' + e.getMessage());
        }
    }

    private static void sendCancellationEmail(String email, String name, Date bookingDate) {
        try {
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setToAddresses(new String[] { email });
            mail.setSubject('Booking Cancellation Confirmation');

            String emailBody = 'Hello ' + name + ',\n\n' +
                               'We regret to inform you that your booking for ' + bookingDate.format() + ' has been successfully cancelled.\n\n' +
                               'If you have any questions, feel free to contact us.\n\n' +
                               'Best regards,\n' +
                               'The Boat Booking Team';

            mail.setPlainTextBody(emailBody); // Plain text email
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
        } catch (Exception e) {
            throw new AuraHandledException('Error sending cancellation email: ' + e.getMessage());
        }
    }
    @AuraEnabled
    public static String createContact(String contactName, String contactEmail) {
        try {
            // Query if the email already exists
            List<Contact> existingContacts = [SELECT Id FROM Contact WHERE Email = :contactEmail LIMIT 1];
            
            if (!existingContacts.isEmpty()) {
                // If a contact with the same email already exists, throw an error
                throw new AuraHandledException('A contact with this email already exists.');
            }
            
            // Query for the "Boat Company" account
            Account boatCompanyAccount = [SELECT Id FROM Account WHERE Name = 'Boat Company' LIMIT 1];
            
            if (boatCompanyAccount == null) {
                // If "Boat Company" account does not exist, throw an error
                throw new AuraHandledException('Boat Company account not found.');
            }

            // Create a new Contact
            Contact newContact = new Contact(
                LastName = contactName,
                Email = contactEmail,
                AccountId = boatCompanyAccount.Id
            );
            
            // Insert the new Contact record
            insert newContact;
            
            // Return the ID of the newly created Contact
            return newContact.Id;

        } catch (Exception e) {
            // Handle any exceptions and return the error message
            throw new AuraHandledException('Error creating contact: ' + e.getMessage());
        }
    }

    
    @AuraEnabled
    public static void generateAndSaveOtp(String email) {
        if (String.isEmpty(email)) {
            throw new AuraHandledException('Email cannot be empty.');
        }

        // Generate a 6-digit OTP
        String otp = String.valueOf(Math.mod(Crypto.getRandomInteger(), 1000000)).leftPad(6, '0');

        OTP__c otpRecord = new OTP__c(
            Email__c = email,
            Otpval__c = otp 
        );
        insert otpRecord;

        // Here you would call email sending logic if needed
    }

    @AuraEnabled
    public static Boolean verifyOtp(String email, String userEnteredOtp) {
        if (String.isEmpty(email) || String.isEmpty(userEnteredOtp)) {
            throw new AuraHandledException('Email and OTP must be provided.');
        }

        List<OTP__c> otpRecords = [
            SELECT Otpval__c
            FROM OTP__c 
            WHERE Email__c = :email
            ORDER BY CreatedDate DESC 
            LIMIT 1
        ];

        if (otpRecords.isEmpty()) {
            throw new AuraHandledException('No OTP record found for this email.');
        }

        OTP__c latestOtp = otpRecords[0];

        

        return latestOtp.Otpval__c == userEnteredOtp;
    }

}

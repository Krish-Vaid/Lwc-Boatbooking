public with sharing class BookingReminderBatch implements Database.Batchable<SObject> {
    public Iterable<SObject> start(Database.BatchableContext bc) {
        DateTime twoDaysAgo = System.now().addHours(48);  
        return [SELECT Email__c, Name, Id, Booking_Date__c FROM Boat_Booking__c WHERE Booking_Date__c >= :twoDaysAgo];
    }
    public Void execute (Database.BatchableContext bc,  List<SObject> records){
        List<Boat_Booking__c> bookingsToProcess = (List<Boat_Booking__c>) records;
        
        List<String> emailAddresses = new List<String>();
        
        for (Boat_Booking__c booking : bookingsToProcess) {
            if (booking.Email__c != null) {
                emailAddresses.add(booking.Email__c);
            }
        }

        if (!emailAddresses.isEmpty()) {
            sendReminderEmail(emailAddresses, bookingsToProcess);
        }
    }

    public void finish(Database.BatchableContext bc) {
        // Optional: Send a final email or log completion
        System.debug('Batch job finished');
    }

    // Helper method to send a reminder email to all recipients
    private void sendReminderEmail(List<String> emailAddresses, List<Boat_Booking__c> bookings) {
        try {
            // Create the email message
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setToAddresses(emailAddresses);  // Add all email addresses to the list
            email.setSubject('Booking Reminder');

            // Create the email body
            String emailBody = 'Hello,\n\n' +
                               'This is a reminder for the following bookings: \n\n';
            for (Boat_Booking__c booking : bookings) {
                emailBody += 'Booking Name: ' + booking.Name + ', Booking Date: ' + booking.Booking_Date__c.format() + '\n';
            }
            emailBody += '\nThank you for using our service!';

            email.setPlainTextBody(emailBody); // Set the plain text email body
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { email }); // Send the email
        } catch (Exception e) {
            System.debug('Error sending reminder email: ' + e.getMessage());
        }
    }
    }
   



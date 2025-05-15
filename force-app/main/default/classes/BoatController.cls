public with sharing class BoatController {

    // Method to retrieve Contacts for the combobox
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {
        try {
            // Query to get the Contacts with their Id and Name
            return [SELECT Id, Name FROM Contact LIMIT 100]; // You can adjust the LIMIT or filters as needed
        } catch (Exception e) {
            // Log any error and return an empty list if an error occurs
            System.debug('Error fetching contacts: ' + e.getMessage());
            return new List<Contact>();
        }
    }

    // Method to retrieve Boat Types for the combobox
    @AuraEnabled(cacheable=true)
    public static List<BoatType__c> getBoatTypes() {
        try {
            // Query to get Boat Types with Id and Name
            return [SELECT Id, Name FROM BoatType__c LIMIT 100]; // You can adjust the LIMIT or filters as needed
        } catch (Exception e) {
            // Log any error and return an empty list if an error occurs
            System.debug('Error fetching boat types: ' + e.getMessage());
            return new List<BoatType__c>();
        }
    }
    @AuraEnabled
    public static Boat__c createBoat(String Name, Decimal Price, String Description, 
                                     Decimal Latitude, Decimal Longitude, 
                                     Decimal Length, Integer YearBuilt, 
                                     Id ContactId, Id BoatTypeId, 
                                     String PictureUrl) {
        // Validate the input parameters
       
        // Create a new Boat record
        Boat__c newBoat = new Boat__c();
        newBoat.Name = Name;
        newBoat.Price__c = Price;
        newBoat.Description__c = Description;
        newBoat.Length__c = Length;
        newBoat.Year_Built__c = YearBuilt;
        newBoat.Contact__c = ContactId;
        newBoat.BoatType__c = BoatTypeId;
        newBoat.Picture__c = PictureUrl;

        system.debug(Latitude );
        system.debug(Longitude );

        // Assign Latitude and Longitude to respective fields
        newBoat.Geolocation__Latitude__s = Latitude;
        newBoat.Geolocation__Longitude__s = Longitude;

        try {
            insert newBoat;
            //sendEmailToContact(ContactId, newBoat.Id, Name, Price, Description, Length, YearBuilt);

            return newBoat;
            
        } catch (DmlException e) {
            throw new AuraHandledException('Failed to create boat: ' + e.getMessage());
        }
    }
    private static void sendEmailToContact(Id contactId, Id boatId, String Name, Decimal Price, String Description, 
    Decimal Length, Integer YearBuilt) {
// Retrieve the contact email from the database
Contact contact = [SELECT Id, Email, FirstName FROM Contact WHERE Id = :contactId LIMIT 1];

// Check if the contact has an email
if (contact != null && contact.Email != null) {
// Prepare the email message
Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
mail.setToAddresses(new String[] { contact.Email });
mail.setSubject('New Boat Registration');
mail.setPlainTextBody('Dear ' + contact.FirstName + ',\n\n' +
'A new boat has been registered with the following details:\n\n' +
'Boat ID: ' + boatId + '\n' +
'Name: ' + Name + '\n' +
'Price: ' + Price + '\n' +
'Description: ' + Description + '\n' +
'Length: ' + Length + ' meters\n' +
'Year Built: ' + YearBuilt + '\n\n' +
'Thank you for your interest!');

// Send the email
Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
} else {
// If the contact doesn't have an email, log a message or handle accordingly
System.debug('Contact does not have an email address.');
}
}

@AuraEnabled
    public static void saveContactInquiry(String name, String email, String phone, String message, String inquiryType) {
        // Create a new ContactUs__c record
        ContactUs__c newInquiry = new ContactUs__c();
        newInquiry.Name = name; // Assuming Name field exists on your ContactUs__c object
        newInquiry.Email__c = email; // Assuming Email__c is a custom field on your object
        newInquiry.Description__c = message; // Assuming Message__c is a custom field
        newInquiry.InquiryType__c = inquiryType; // Assuming Inquiry_Type__c is a custom field

        try {
            insert newInquiry;
        } catch (Exception e) {
            System.debug('Error in saveContactInquiry: ' + e.getMessage());
            throw new AuraHandledException('Error saving inquiry: ' + e.getMessage());
        }
        
        
    }
    @AuraEnabled(cacheable=true)
    public static List<Boat__c> getBoats() {
        try {
            List<Boat__c> allBoats = [
                SELECT Id, Name, Description__c, Picture__c  
                FROM Boat__c 
                WHERE Picture__c  != NULL
            ];

            if (allBoats.isEmpty()) {
                return allBoats; // Return empty list if no data
            }

            // Clone and shuffle the list
            List<Boat__c> boatList = new List<Boat__c>();
            boatList.addAll(allBoats);
            shuffleBoatList(boatList);

            // Get a random count between 4 and 6
            Integer seed = (Integer)Math.mod(DateTime.now().getTime(), 3); // 0, 1, or 2
            Integer count = 4 + seed; // 4 to 6

            // Manually extract the first 'count' items
            List<Boat__c> resultBoats = new List<Boat__c>();
            for (Integer i = 0; i < count && i < boatList.size(); i++) {
                resultBoats.add(boatList[i]);
            }

            return resultBoats;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching boats: ' + e.getMessage());
        }
    }

    private static void shuffleBoatList(List<Boat__c> boatList) {
        Integer n = boatList.size();
        for (Integer i = n - 1; i > 0; i--) {
            Integer j = (Integer)Math.mod(DateTime.now().getTime() + i * 31, i + 1);
            Boat__c temp = boatList[i];
            boatList[i] = boatList[j];
            boatList[j] = temp;
        }
    }

}

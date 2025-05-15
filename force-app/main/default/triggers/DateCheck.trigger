trigger DateCheck on Boat_Booking__c (before insert, before update) {
    Set<Id> boatIds = new Set<Id>();
    Map<Id, DateTime> startDateMap = new Map<Id, DateTIme>();  // Use Date instead of DateTime
    Map<Id, DateTime> endDateMap = new Map<Id, DateTime>();    // Use Date instead of DateTime
    
    // Get today's date
    Date today = Date.today();

    // Loop through the records to gather boat IDs and their corresponding date ranges
    for (Boat_Booking__c booking : Trigger.new) {
        if (booking.Boat__c != null && booking.Booking_Date__c != null && booking.End_Booking_Date__c != null) {
            boatIds.add(booking.Boat__c);  // Add boat IDs to the set
            startDateMap.put(booking.Boat__c, booking.Booking_Date__c);  // Use date() for comparison
            endDateMap.put(booking.Boat__c, booking.End_Booking_Date__c);  // Use date() for comparison

            // Check if the booking dates are in the past
            if (booking.Booking_Date__c < today || booking.End_Booking_Date__c < today) {
                booking.addError('Booking date cannot be in the past.');
            }
        }
    }

    // Query existing bookings for the same boat that overlap with the selected date range
    List<Boat_Booking__c> existingBookings = [
        SELECT Id, Boat__c, Booking_Date__c, End_Booking_Date__c, Boat__r.Name
        FROM Boat_Booking__c
        WHERE Boat__c IN :boatIds
    ];

    // Create a map to track any boat that is already booked within the requested date range
    Map<Id, String> errorMessages = new Map<Id, String>();

    // Loop through existing bookings and check for overlapping dates
    for (Boat_Booking__c existingBooking : existingBookings) {
        for (Boat_Booking__c newBooking : Trigger.new) {
            // Only check for overlap if they are for the same boat and the booking is not the same one being updated
            if (newBooking.Boat__c == existingBooking.Boat__c && 
                newBooking.Id != existingBooking.Id &&  // Prevent error if it's the same booking being updated
                newBooking.Booking_Date__c <= existingBooking.End_Booking_Date__c && 
                newBooking.End_Booking_Date__c >= existingBooking.Booking_Date__c) {
                
                // Add the error message to the map for that booking
                errorMessages.put(newBooking.Id, 'The selected boat "' + existingBooking.Boat__r.Name + '" is already booked during the chosen dates.');
            }
        }
    }

    // Set the status to "Booked already" and add an error message to the field if the booking overlaps
    for (Boat_Booking__c booking : Trigger.new) {
        if (errorMessages.containsKey(booking.Id)) {
            booking.Status__c = 'Booked already';  // Set the status to "Booked already"
            booking.addError(errorMessages.get(booking.Id));  // Show the custom error message
        }
    }
}

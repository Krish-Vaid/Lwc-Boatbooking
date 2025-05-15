trigger ReminderTrigger on Boat_Booking__c (After insert, After update) {

    List<Boat_Booking__c> recentBookings = [SELECT Email__c, Name, Id, Booking_Date__c FROM Boat_Booking__c WHERE Booking_Date__c >= :System.now().addHours(-48)];
    
    if (!recentBookings.isEmpty()) {
        BookingReminderBatch batchJob = new BookingReminderBatch();
        Database.executeBatch(batchJob, 200); 
    }
}
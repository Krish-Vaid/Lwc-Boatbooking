public class BookingReminderBatchScheduler implements Schedulable {
    public void execute(SchedulableContext SC) {
        // Instantiate your batch class
        BookingReminderBatch batch = new BookingReminderBatch();
        
        // Schedule the batch to run with a batch size of 200
        Database.executeBatch(batch, 200);
    }
}

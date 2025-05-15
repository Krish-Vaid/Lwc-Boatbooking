trigger UpdateProfileOnComplaint on ContactUs__c (after insert) {
    Set<Id> userIds = new Set<Id>();
    for (ContactUs__c comp : Trigger.new) {
        if (comp.InquiryType__c == 'Changing Profile to Admin') {
            userIds.add(comp.CreatedById);
        }
    }
    if (!userIds.isEmpty()) {
        System.enqueueJob(new UpdateProfileAsync(userIds));
    }
}

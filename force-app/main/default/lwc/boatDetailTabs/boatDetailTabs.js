import { wire, LightningElement } from 'lwc';

import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { subscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';

export default class BoatDetailTabs extends LightningElement {

    @wire(MessageContext)
    messageContext;
    boatId;

    @wire(getRecord, {recordId: '$boatId', fields: BOAT_FIELDS})
    wiredRecord;
    label = {
        labelDetails,
        labelReviews,
        labelAddReview,
        labelFullDetails,
        labelPleaseSelectABoat,
    };
  
   
    get detailsTabIconName() {
        return this.wiredRecord.data ? 'utility:anchor' : null;
    }
    
    get boatName() {
        return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
    }
    
    // Private
    subscription = null;
    
    // Subscribe to the message channel
    subscribeMC() {
        // local boatId must receive the recordId from the message
        if (this.subscription) {
            return;
        }
        // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
        this.subscription = subscribe(
            this.messageContext,
            BOATMC,
            (message) => { this.boatId = message.recordId },
            { scope: APPLICATION_SCOPE }
        );
    }
    
    // Calls subscribeMC()
    connectedCallback() {
        this.subscribeMC();
    }
    
  
    // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated() {
        this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
        this.template.querySelector('c-boat-reviews').refresh();
    }
}
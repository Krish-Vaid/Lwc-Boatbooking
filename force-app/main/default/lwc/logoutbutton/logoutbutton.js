import { LightningElement, api } from "lwc";
import isGuest from "@salesforce/user/isGuest";
import basePath from "@salesforce/community/basePath";

export default class LogoutButton extends LightningElement {

    get isGuest() {
        return isGuest;
    }

    get logoutLink() {
        const sitePrefix = basePath.replace(/\/s$/i, ""); // Remove trailing "/s" if present
        const loginUrl = `${sitePrefix}/login`; // Community login page URL
        // Append retUrl parameter to redirect to the login page after logout
        return `${sitePrefix}/secur/logout.jsp?retUrl=${encodeURIComponent(loginUrl)}`;
    }


}

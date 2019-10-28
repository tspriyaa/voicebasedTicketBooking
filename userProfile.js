// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

class UserProfile {
    constructor(mobileNo,name, fromLoc, toLoc, bookingDate) {
        this.mobileNo = mobileNo;
        this.toLoc = toLoc;
        this.fromLoc = fromLoc;
        this.bookingDate = bookingDate;
        this.name= name;


        // The list of companies the user wants to review.
        
    }
}

module.exports.UserProfile = UserProfile;

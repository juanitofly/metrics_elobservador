'use strict';
let helper = require("../helper")

class EO_Node {

    constructor (doc) {
        //nid, pagePath, pageViews, users, newUsers, avgTimeOnPage, avgSessionDuration
        //csvRow[7], csvRow[0], csvRow[1], csvRow[2], csvRow[3], csvRow[4], csvRow[5]
        //TODO: validations

        if (Object.keys(doc).indexOf("_id") < 0) {
            this.nid = doc[7];
            this.pagePath = doc[0];
            this.pageViews = doc[1];
            this.users = doc[2];
            this.newUsers = doc[3];
            this.avgTimeOnPage =  doc[4];
            this.avgSessionDuration = doc[5];
            return this;
        } else {   
            this.nid = doc.nid;
            this.pagePath = doc.pagePath;
            this.pageViews = doc.pageViews;
            this.users = doc.users;
            this.newUsers = doc.newUsers;
            this.avgTimeOnPage = doc.avgTimeOnPage;
            this.avgSessionDuration = doc.avgSessionDuration;
            return this;
        }
    }

    getNid () {
        return this.nid;
    }    

    addDOCinfo (article_object) {
        this.title = article_object.title;
        this.tags = article_object.tags;

        this.creationDate = helper.getDateFromDDMMYYYY(article_object.creationDate);
        this.publicationDate = helper.getDateFromDDMMYYYYhhmmss(article_object.publicationDate);
        this.lastModificationDate = helper.getDateFromDDMMYYYY(article_object.lastModificationDate);
        
        this.authors = article_object.authors;
        this.mediaObjects = article_object.mediaObjects
     
        this.categories = article_object.categories;
        this.sections = article_object.sections;
     
        return this;
    }
}

module.exports = EO_Node;
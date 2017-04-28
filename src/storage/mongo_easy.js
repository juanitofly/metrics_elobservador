'use strict';

var assert = require('assert');

class mongo_easy {

    constructor () {
        console.log("mongo_conection constructor");
        this.MongoClient = require('mongodb').MongoClient;
        this.url = global.config.MONGODB_URL;

        // Use connect method to connect to the server
        this.MongoClient.connect(this.url, (err, db) => {
            assert.equal(null, err);
            console.log("Connected successfully to MongoDB server");
            db.close();
        });
    }

    insertDocument (collectionName, document, callback) {
        this.MongoClient.connect(this.url, (err, db) => {
            if (err) {
                console.log("__ERROR__", collectionName);
                console.log(err);
                exit
            }  
            // Get the documents collection
            var collection = db.collection(String(collectionName));
            // Insert some documents
            collection.insertOne(document, (err, result) => {
                if (err) {
                    console.log("__ERROR__");
                    console.log(typeof document);
                    console.log(document);
                    console.log(err);
                    exit
                }  
             //   console.log("insertDocument");
                callback(result);
            });
        })
    }

    insertDocuments (collectionName, documents, callback) {
        this.MongoClient.connect(this.url, (err, db) => {
            if (err) {
                console.log("__ERROR__", collectionName);
                console.log(err);
                exit
            }  
            // Get the documents collection
            var collection = db.collection(String(collectionName));
            // Insert some documents
            collection.insertMany(documents, (err, result) => {
                if (err) {
                    console.log("__ERROR__");
                    console.log(typeof documents);
                    console.log(documents);
                    console.log(err);
                    exit
                }  
                console.log("insertDocuments on " + collectionName + " " + documents.length);
                callback(documents);
            });
        })
    }

    documentExists (document, collectionName, callback, onExists) { 
        this.MongoClient.connect(this.url, (err, db) => {
            // Get the documents collection
            var collection = db.collection(String(collectionName));
            //check if exists
            collection.find(document).toArray( (err, docs) => {
                if (docs.length === 0) {
                    console.log("NO Existe", document);
                    callback();
                } else {
                    console.log("SI Existe", document);
                    onExists(docs);
                }
            });
        })
    }

    removeCol (collectionName, callback) {
        this.MongoClient.connect(this.url, (err, db) => {
            // Get the documents collection
            var collection = db.collection(collectionName);
            // Find some documents
            collection.remove({}, () => {
                callback();
            });
        });
    }
   
    findDocuments (filter, collectionName, callback) {

        let sorting = {
            id: 1
        }
        this.MongoClient.connect(this.url, (err, db) => {
            // Get the documents collection
            var collection = db.collection(String(collectionName));
            // Find some documents
            collection.find(filter).sort(sorting).toArray( (err, docs) => {
                //console.log(docs);
                callback(docs);
            });
        });
    }

    getCollectionNames (callback) {

        this.MongoClient.connect(this.url, (err, db) => {
            let toResult = [];
            db.listCollections().toArray(function(err, collections){
                for (let i = 0; i < collections.length; i++) {
                    toResult.push(collections[i].name);
                }
                callback(toResult);
            });
        });
    }

    addIndex (collectionName, field) {
        this.MongoClient.connect(this.url, (err, db) => {
            // Get the documents collection
            var collection = db.collection(String(collectionName));
            
            collection.createIndex({ field: 1 });
            return;
        })
    }

    showIndexes (callback) {
        this.MongoClient.connect(this.url, (err, db) => {
            let result = [];
            
            var collection = db.collection("to_inform");
            //result.push(collection.getIndexes());
            collection.createIndex('id', () => {
                console.log("creo el index");
                this.MongoClient.connect(this.url, (err, db) => {
                        console.log("ensureIndex el index");
                        let result = [];
                        
                        var collection = db.collection("to_inform");
                        collection.ensureIndex("id", callback)
                })
            })
            
            //result.push(collection.getIndexes());
            
            //callback(result);
        })
    }

    lookup (collectionName, callback) {
      
        this.MongoClient.connect(this.url, (err, db) => {
            // Get the documents collection
            var collection = db.collection(String(collectionName));
            
            collection.aggregate([ 
                {
                    "$lookup":
                        {
                            "from": "UNI_from_analytics_all_sites_total",
                            "localField": "id",
                            "foreignField": "_id.id",
                            "as": "analytics"
                        }
                }, 
                { "$match" :
                    {"analytics.pageViews" : {"$exists": true }},
                },
                { "$project" : { _id : 0 } },
                { "$unwind": "$analytics" },
                { "$out": "listo" }
            ],
                (err,docs) => {
                    if (err) console.log("ERROR", err);

                    callback(docs);
               }
            );
        })
    }

    aggregate (collectionName, aggregate, callback) {
      
        this.MongoClient.connect(this.url, (err, db) => {
            // Get the documents collection
            var collection = db.collection(String(collectionName));
            
            collection.aggregate(
                aggregate,
                (err,docs) => {
                    if (err) console.log("ERROR", err);

                    callback(docs);
               }
            );
        })
    }

    unifiing_analytics_by_id (collectionName, callback) {
        this.MongoClient.connect(this.url, (err, db) => {
            // Get the documents collection
            var collection = db.collection(String(collectionName));

            // Find some documents
            collection.aggregate(
                [
                    {   "$match": { "id": { "$not": { "$eq": 'PORTADA'}}}},
                    { 
                        "$group": { 
                            "_id": {"id": "$id", "site": "$site_name"}, 
                            "pageViews": {"$sum": "$ga:pageviews"},
                            "uniquePageviews": {"$sum": "$ga:uniquePageviews"},
                            "users": {"$sum": "$ga:users"},
                            "avgTimeOnPage": {"$avg": "$ga:avgTimeOnPage"},
                            "pagePath": {"$addToSet": "$ga:pagePath"},
                            "site_name": {"$addToSet": "$site_name"},
                            "count": { "$sum": 1} 
                        }
                    },
                   // { "$project" : { "_id" : 0, "site_name": "$site_name", "id": "$_id", "pageViews": "$pageViews", "users": "$users", "avgTimeOnPage": "$avgTimeOnPage", "path":"$path", "count": "$count"} },
                    { "$sort": { "count": -1 } },
                    { "$out": "UNI_" + collectionName }
                ],
                (err,docs) => {
                    if (err) console.log("ERROR", err);

                    callback(docs); 
               }
            );
        })
    }

    group_by_category (collectionName, callback) {
        this.MongoClient.connect(this.url, (err, db) => {
            // Get the documents collection
            var collection = db.collection(String(collectionName));

            // Find some documents
            collection.aggregate(
                [
                    {   "$match": { "id": { "$not": { "$eq": 'PORTADA'}}}},
                    { 
                        "$group": { 
                            "_id": "$category_name", 
                            "count": { "$sum": 1} 
                        }
                    },
                    //{ "$project" : { "_id" : 0, "id": "$_id", "pageViews": "$pageViews", "users": "$users", "avgTimeOnPage": "$avgTimeOnPage", "path":"$path", "count": "$count"} },
                    { "$sort": { "count": -1 } },
                    //{ "$out": "analytics_ok" }
                ],
                (err,docs) => {
                    if (err) console.log("ERROR", err);

                    callback(docs);
               }
            );
        })
    }

    final (collectionName, callback) {
        this.MongoClient.connect(this.url, (err, db) => {
            // Get the documents collection
            var collection = db.collection(String(collectionName));

            // Find some documents
            collection.aggregate(
                [
                    {
                        "$match": { 
                            "analytics.users" : { 
                                "$exists": true 
                            },
                            "analytics.pageViews" : { 
                                "$exists": true 
                            },
                            "analytics.avgTimeOnPage" : { 
                                "$exists": true 
                            },
                        /*    "fechaPublicacion": {
                                "regex": "^2017.*$",
                            }*/
                        }
                    },           
                    {
                        "$unwind": '$analytics'
                    },
                    {   "$out": "listo2017" }
                ],
                (err,docs) => {
                    if (err) console.log("ERROR", err);

                    callback(docs);
               }
            );
        })
    }
}

module.exports = mongo_easy;
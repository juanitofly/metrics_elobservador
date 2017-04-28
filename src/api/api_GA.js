let ga_config = require('./config/config_GA');
let google = require('googleapis');

module.exports = {
    
    getDataFromAnalytics: (informName, site_name, callback_finish, collectionName, dateRange, pageToken) => {

        if (!ga_config[informName]) {
            throw new Error("informName: " + informName + " that not match with any inform", 401);
        }

        let key = require(ga_config.google_key_path);
        let view_id = ga_config.google_ga_view_id;

        let jwtClient = new google.auth.JWT(
            key.client_email, 
            null, 
            key.private_key,
            ['https://www.googleapis.com/auth/analytics.readonly'], 
            null
        );
            
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                //console.log(err);
                return;
            }

            queryDataV4(ga_config[informName]);
        });

        function queryDataV4(gaObject) {

            let view_id = ga_config.sites_ga_id[site_name];

            for (let i = 0; i < gaObject.reportRequests.length; i++) {
                gaObject.reportRequests[i].dateRanges = [];
                gaObject.reportRequests[i].dateRanges.push(dateRange);
                gaObject.reportRequests[i].viewId = view_id;
                gaObject.reportRequests[i].pageToken = pageToken;
            }

            let analyticsreporting = google.analyticsreporting('v4');     
            analyticsreporting.reports.batchGet({
                    resource: gaObject,
                    auth: jwtClient
                }, 
                (err, response) => {
                    if (err) {
                        console.log(response);
                        console.log(err);
                        return;
                    }
                    
                    if (response.reports[0].nextPageToken) {
                        console.log("estoy llamando de nuevo con " + response.reports[0].nextPageToken);
                        module.exports.getDataFromAnalytics(informName, site_name, callback_finish, collectionName, dateRange, response.reports[0].nextPageToken)
                    }

                    module.exports.analytics_to_mongo(response, callback_finish, collectionName, site_name);
                }
            );
        }
    },

    analytics_to_mongo: (result, callback_finish, collectionName_toInsert, site_name) => {
        try {
            
            let toIter = result.reports[0].data.rows;
            let headersMetrics = result.reports[0].columnHeader.metricHeader.metricHeaderEntries;
            let headersDimensions = result.reports[0].columnHeader.dimensions;

            let documents_to_insert = [];
            let docToInsert = {};
             
            if (!toIter) {
                console.log("### BORRAR ###    ", site_name, result.reports[0].data.totals[0].values);
                return;
            }  

            for (let i = 0; i < toIter.length; i++) {
                docToInsert = {};
              
                for (let j = 0; j< headersMetrics.length ; j++) {   
                    //console.log("headersMetrics[j].name", headersMetrics[j].name, "headersMetrics[j].type", headersMetrics[j].type);
                    
                    if (headersMetrics[j].type == "TIME") {
                      /*  re = /(\d*\.\d{2})/g;
                        r  = re.exec(toIter[i].metrics[0].values[j]);
                        let time = "0";
                        if (r) {
                            time = String(r[1]);
                        }*/
                        docToInsert[headersMetrics[j].name] = parseFloat(toIter[i].metrics[0].values[j]); //time.replace(".", ",");
                    } else if (headersMetrics[j].type == "INTEGER") {
                        docToInsert[headersMetrics[j].name] = parseInt(toIter[i].metrics[0].values[j]);
                    } else {
                        docToInsert[headersMetrics[j].name] = toIter[i].metrics[0].values[j];
                    }
                }
                for (let k = 0; k < headersDimensions.length; k++) {
                   //console.log(headersDimensions[k]);
                    if (headersDimensions[k] === "ga:pagePath") {
                        path = toIter[i].dimensions[k];

                        re = /.*?-n(\d+)/g;
                        r  = re.exec(path);
                        if (r) {
                            docToInsert.id = parseInt(r[1]);
                        } else {
                            docToInsert.id = "PORTADA";
                        }
                    }
                    docToInsert[headersDimensions[k]] = toIter[i].dimensions[k];
                }

                docToInsert.site_name = site_name;
                documents_to_insert.push(docToInsert);
            }
            
            global.my_mongo_easy.insertDocuments(
                collectionName_toInsert, 
                documents_to_insert,
                (inserted) => {
                    //return;
                    callback_finish({
                        ok: "okey on: " + collectionName_toInsert,
                        documents_to_insert_length: documents_to_insert.length,
                        inserted_length: inserted.length
                    });
                }
            );

        } catch (err) {
            console.log(err);   
        }
    },  
    
}
let express = require('express');
let app = express();
let http = require('http').Server(app);
 
global.my_api_DOC = require("./src/api/api_DOC");
global.my_api_GA = require("./src/api/api_GA");
global.GA_config = require("./src/api/config/config_GA");
global.my_api_mysql_csv = require("./src/api/api_mysql_csv");

let json2csv = require('json2csv');

let my_ui_lib = require("./ui/ui_lib");
//let my_GA_helper = require("./src/analytics_helper");

let mongo_easy = require("./src/storage/mongo_easy");
let EO_node = require("./src/domain/EO_Node");

global.config = require("./config");
global.my_mongo_easy = new mongo_easy();  

app.use(express.static('public'));
app.use(express.static('node_modules'));
app.set('view engine', 'jade');

let winston = require("winston");
global.logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: './log/logFile.log' })
    ]
  });

global.logger.info("Starting..");  

http.listen(global.config.PORT, function(){
    console.log('Server online listening on PORT:' + global.config.PORT);
});

app.get('/', function (req, res) {

    global.my_mongo_easy.getCollectionNames(
        (docs) => {
            res.render('index', { 
                title: 'Dashboard El Observador',
                templateConfig: global.config.templateConfig,
                collections: docs
            });
        }
    );
});

app.get('/getFromDOC_category/:category_name', (req, res) => {
    try{        

        global.logger.info("/getFromDOC_category/:category_name ############################ ");

        global.my_api_DOC.recursive_f_to_get_articles(
            0, // 0 to start iter from 0
            (result) => {
                global.logger.info("res.json........................ " + result);
            },
            (err) => {
                console.log(err);
                res.json({
                    error: err,
                })
            },
            1, // 1 to start paging from 1
            req.params.category_name
        );

        res.json({
            ejecutando: "proceso",
            por: "favor",
            esperar: "y",
            mirar: "consola"
        })
    } catch (err) {
        res.json({error: err});
    }
});

app.get('/analyticsToMongo/:informId', (req, res) => {
    
    try {   
        let ui = my_ui_lib.getDataFromUI(req);
        let sites_names = Object.keys(global.GA_config.sites_ga_id);
        let informId = req.params.informId;
        let collectionName = "from_analytics_all_sites_total";
        let pageToken = "0";

        for (let i = 0; i < sites_names.length; i++) {
            global.my_api_GA.getDataFromAnalytics(
                informId, 
                sites_names[i],
                (result) => {
                    if (i === sites_names.length - 1) {
                        console.log("getDataFromAnalytics: " + i);
                        console.log(result); 
                    }    
                },
                collectionName,
                ui.dateRange,
                pageToken
            )
        }
    } catch (err) {
        res.send(err.message);
    }
});

app.get('/getDocuments/:collectionName', (req, res) => {
    let ui = my_ui_lib.getDataFromUI(req);
    global.my_mongo_easy.findDocuments(
        {}, 
        req.params.collectionName, 
        (docs) => {
            if (docs.length == 0) {
                res.json([]);
                return
            }

            if (ui.csv == "true") {
                let toJson = {};
                toJson.data = docs;
                toJson.fields = [];
                for (let i = 0; i < Object.keys(docs[0]).length; i++) {
                    toJson.fields.push(Object.keys(docs[0])[i]);
                }
                let csv = json2csv(toJson);
                //res.set('Content-Type', 'application/octet-stream');
                res.attachment('filename.csv');
                res.status(200).send(csv);
            } else {
                res.json(docs);
            }
    })
});

app.get('/getDocuments/:collectionName/:category_name', (req, res) => {
    console.log("getDocuments category_name");
    global.my_mongo_easy.findDocuments(
        {category_name: req.params.category_name}, 
        req.params.collectionName, 
        (docs) => {
            res.json(docs);
        })
});

app.get('/group_by_category/:collectionName', (req, res) => {
    global.my_mongo_easy.group_by_category(
        req.params.collectionName,
        (docs) => {
            res.json(docs);
        }
    )
});

 app.get('/find/:id', (req, res) => {
    global.my_mongo_easy.findDocuments(
        {
            "analytics.users" : { 
                "$exists": true 
            } 
        }, 
        "listo",
        (listo_doc) => {
            res.json({
               listo: listo_doc,
            });
        }
    )    
 })

app.get('/final', (req, res) => {
    global.my_mongo_easy.final(
        "listo",
        (docs) => {
            res.json(docs);
        }
    )}
)

app.get('/unifiing_analytics_by_id/:collectionName', (req, res) => {
    global.my_mongo_easy.unifiing_analytics_by_id(
        req.params.collectionName,
        (docs) => {
            res.json(docs);
        }
    )}
)

app.get('/createIndex', (req, res) => {
  /*  global.my_mongo_easy.addIndex(
        "to_inform",
        "id"
    );
    global.my_mongo_easy.addIndex(
        "analytics_ok",
        "id"
    );
*/
    global.my_mongo_easy.showIndexes(
        (indexes) => {
            console.log("fuera");
            res.json(indexes);
        }
    );

    
})

app.get('/lookup', (req, res) => {
    global.my_mongo_easy.lookup(
        "byBlog",
        (docs) => { 
            res.json(docs);
        }
    )}
)

app.get('/remove/:collectionName', (req, res) => {

    console.log("removing");

    global.my_mongo_easy.removeCol(req.params.collectionName, () => {
        res.json(
            {
                ok: "okey remove: " + req.params.collectionName
            }
        )
    });
});

app.get('/toChartArrayC/:collectionName', (req, res) => {

    let aggregate = [
        { 
            "$group": { 
                "_id": {
                    "date": "$ga:date",
                    "channel": "$ga:channelGrouping"
                    //    "site_name": "$site_name",
                },
                "sessions": {"$sum": "$ga:sessions"}
            }
        },
        {
            "$project": {
                "date": { "$concat": [ "$_id.date", "$_id.channel" ]},
                "sessions": "$sessions",
                "_id": 0 
            }
        },
  /*      {
            "$sort": { "date": 1 }
        },
        {
            "$project": {
                
                "sessions": "$sessions",
                "_id": 0
            }
        },*/
        ];
        
    global.my_mongo_easy.aggregate(
        req.params.collectionName,
        aggregate,
        (docs) => {
            let result = {};
            
            let arrayData = [];
            let element = [];

            arrayData.push(Object.keys(docs[0]));
            
console.log(docs);

            for (let i = 0; i < docs.length; i++) {
                element = [];
                for (let j = 0; j < Object.keys(docs[i]).length; j++) {
                    element.push(docs[i][Object.keys(docs[i])[j]]);
                }
                arrayData.push(element);
            }
 
            result.dataArray = arrayData;
            result.title = req.params.collectionName;
            result.chart = true;
            
            res.json(result);
        }
    )  
});

app.get('/toChartArray', (req, res) => {

    let aggregate = [
        {
            "$unwind": '$analytics'
        },
        { 
            "$group": { 
                "_id": {
                    "personaNombre": "$personaNombre",
                    "month": {"$substr": [ "$fechaPublicacion", 5, 2 ]},
                    "year": {"$substr": [ "$fechaPublicacion", 0, 4 ]}
                },
                "pageViews": {"$sum": "$analytics.pageViews"},
                "uniquePageviews": {"$sum": "$analytics.uniquePageviews"},
                "users": {"$sum": "$analytics.users"},
                "avgTimeOnPage": {"$avg": "$analytics.avgTimeOnPage"},
                "count": { "$sum": 1} 
            }
        },
        {
            "$project": {
                "MET_personaNombre": "$_id.personaNombre", 
              //  "MET_month": "$_id.month", 
              //  "MET_year": "$_id.year", 
                "pageViews": "$pageViews",
                "uniquePageviews": "$uniquePageviews",
                "users": "$users",
                "avgTimeOnPage": "$avgTimeOnPage",
                "count": "$count",
                "_id": 0
            }
        }
        ];

    global.my_mongo_easy.aggregate(
        "listo",
        aggregate,
        (docs) => {
            let result = {};
            
            let arrayData = [];
            let element = [];

            arrayData.push([
                "nombrePersona", "pageViews", "uniquePageviews", "users", "avgTimeOnPage", "count"
            ])

            for (let i = 0; i < docs.length; i++) {
                element = [];
                for (let j = 0; j < Object.keys(docs[i]).length; j++) {
                 //   if (Object.keys(docs[i])[j].indexOf("TIT_") >= 0) {
                //     element.push(Object.keys(docs[i])[j]);                        
                  //  } else {
                        element.push(docs[i][Object.keys(docs[i])[j]]);
                    //}
                }
                arrayData.push(element);
            }
            
            result.dataArray = arrayData;
            result.title = "Blogs !";
            result.chart = true;
            
            res.json(result);
        }
    )  
});

app.get('/analytics/:informId/:raw', (req, res) => {

    let ui = my_ui_lib.getDataFromUI();

    global.my.getDataFromAnalytics(
        req.params.informId, 
        "El Observador",
        (result) => {
            try {
                if (!raw) {
                    result.raw = 1;
                    res.json(result);
                }

                let toResult = {};
                toResult.label = result.reports[0].columnHeader.dimensions;

                toResult.arrayLabels = [];
                for (let i = 0; i < ui.max_items_to_chart; i++) {
                    toResult.arrayLabels.push(result.reports[0].data.rows[i].dimensions[0]);
                } 

                toResult.dataSets = [];
                let metricsReport = result.reports[0].columnHeader.metricHeader.metricHeaderEntries;

                for (let i = 0; i < metricsReport.length; i++) {
                    let arrayData = [];
                    for (let j = 0; j < ui.max_items_to_chart; j++) {
                        arrayData.push(result.reports[0].data.rows[j].metrics[0].values[i]);
                    }
                    toResult.dataSets.push(
                        {
                            type: 'bar',
                            label: metricsReport[i].name,
                            data: arrayData
                        }
                    )
                }

                res.json(toResult);
            } catch (err) {
                console.log(err);
                res.end();
            }
        },
        ui.dateRange)
});

app.get('/queryToMySQL/:queryId', (req, res) => {
    global.my_api_mysql_csv.getQueryFromMySql_DOC(
        req.params.queryId,
        (docs) => {
             global.my_mongo_easy.insertDocuments(
                req.params.queryId, 
                docs,
                (inserted) => {
                    res.json(inserted);
                }
            );            
        }
    );
});




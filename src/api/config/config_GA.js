module.exports = {
    "google_key_path": 'El Observador-50a8df97bd0d.json',
    "google_ga_view_id": 'ga:3030920',
    "sites_ga_id": {
   //     "Cromo": "60454405",
      //  "El Observador": "3030920",
        "Ministerio de Diseño": "146554362",
    /*    "El Observador+": "3061782",
        "El Observador+ Mobile": "72687740",
        "El Observador 365": "53912873",
        "El Observador Mujer": "70468307",
        "El Observador TV": "88063410",
        "Streaming Video": "125650396",
        "Padres Hoy": "118265302",
        "Referi": "101012079",
        "Suscripciones": "8908029",
        //"Cocina Saludable": "77144992",
        "OApps": "75107811",
        "App Android": "50543550",
        "App Iphone": "50543553",
        "App Windows8": "73095351",
        //"Beta Cromo": "103103180",
        //"Beta El Observador": "103105324",
        //"Cinemag": "18460511",
        "Cromo IA": "121522981",
        "OAutos": "3061826",
        "OCasas": "5825613",*/
    },
    "organic_search": {
        "reportRequests": [
            {
                    "metrics":[ 
                        {
                            "expression": "ga:sessions"
                        },
                    ],
                    "dimensions": [
                        {
                            "name": "ga:channelGrouping"
                        },
                        {
                            "name": "ga:date"
                        }
                    ],
                    "pageSize": 10000,  
                    "samplingLevel": "LARGE"
            }
        ]
    },
    "to_get_totals": {
        "reportRequests": [
            {
                "metrics":[
                    {
                        "expression":"ga:pageviews"
                    },
                    {
                        "expression": "ga:uniquePageviews"
                    },
                    {
                        "expression":"ga:users"
                    },
                    {
                        "expression":"ga:avgTimeOnPage"
                    }, 
                    
                ],
                "dimensions": [
      /*              {
                        "name": "ga:hostname"
                    },
                    {
                        "name": "ga:year"
                    },
                    {
                        "name": "ga:month"
                    },*/
                    {
                        "name": "ga:day"
                    },
                    {
                        "name": "ga:hour"
                    },
                    {
                        "name": "ga:minute"
                    },
                ],
                "orderBys": [
                    {
                        "fieldName": "ga:pageviews",
                        "sortOrder": "DESCENDING",
                    }
                ],
                "pageSize": 10000,
                "samplingLevel": "LARGE"
            },
        ]
    },
    "get_page_view_from_path": {
        "reportRequests": [
            {
                "metrics":[
                    {
                        "expression":"ga:pageviews"
                    },
                    {
                        "expression": "ga:uniquePageviews"
                    },
                    {
                        "expression":"ga:users"
                    },
                    {
                        "expression":"ga:avgTimeOnPage"
                    }, 
                    
                ],
                "dimensions": [
                    {
                        "name": "ga:pagePath"
                    },
                ],
                "orderBys": [
                    {
                        "fieldName": "ga:pageviews",
                        "sortOrder": "DESCENDING",
                    }
                ],
                "pageSize": 10000,
                "samplingLevel": "LARGE"
            },
        ]
    },
    "only_articles": {
        "reportRequests": [
            {
                "metrics":[
                    {
                        "expression":"ga:pageviews"
                    },
                    {
                        "expression":"ga:users"
                    },
                ],
                "dimensions": [
                    {
                        "name": "ga:pagePath"
                    },
                ],
                "dimensionFilterClauses": [{
                     "filters": [{
                            "dimensionName": "ga:pagePath",
                            "operator": "REGEXP",
                            //"not": true,
                            "expressions": ["/d+"],
                        }]
                }],
                "orderBys": [
                    {
                        "fieldName": "ga:pageviews",
                        "sortOrder": "DESCENDING",
                    }
                ],
            },
            {
                "metrics":[
                    {
                        "expression":"ga:avgTimeOnPage"
                    },
                    {
                        "expression":"ga:avgSessionDuration"
                    },
                    {
                        "expression":"ga:sessionsPerUser"
                    }
                ],
                "dimensions": [
                    {
                        "name": "ga:pagePath"
                    },
                ],
                "dimensionFilterClauses": [{
                        "filters": [{
                            "dimensionName": "ga:pagePath",
                            "operator": "REGEXP",
                            //"not": true,
                            "expressions": ["/d+"],
                        }]
                }],
                "orderBys": [
                    {
                        "fieldName": "ga:avgTimeOnPage",
                        "sortOrder": "DESCENDING",
                    }
                ],
            }
        ]
    },
}
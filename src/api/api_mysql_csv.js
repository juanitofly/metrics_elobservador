const request = require('request');


let my_config_api_mysql_csv = require('./config/config_mysql_csv');

module.exports = {

    csvGSheetsToJson: (resolve) => {
        const csv = require('csvtojson');
        let toReturn = [];
        
        csv()
            .fromStream(request.get(my_config_api_mysql_csv.google_doc_url))
            .on('csv', (csvRow)=>{
                toReturn.push(csvRow);
            })
            .on('done',(error)=>{
                resolve(toReturn);
            })
    },
    
    getQueryFromMySql_DOC: (query, callback) => {
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : my_config_api_mysql_csv.host_DOC,
            user     : my_config_api_mysql_csv.user_DOC,
            password : my_config_api_mysql_csv.pass_DOC,
            database : my_config_api_mysql_csv.database_DOC,
        });
        connection.connect();

        connection.query(
            my_config_api_mysql_csv.getNotasData[query], 
            (err, rows, fields) => {
                if (!err)
                    callback(rows);
                else
                    callback('Error while performing Query.');
            }
        );

        connection.end();
    }
} 

module.exports = {
    
    /*
        Procesa analytics para insertar en mongo.
        - unifica por ID
        - Excluye segun er_filter --->>> /.*?-n(\d+)/g;
    */
    analytics_to_mongo_process: (result) => {
        try {
            
            let toIter = result.reports[0].data.rows;
            let path, pageViews, users, avgTimeOnPage, id, re, r;
            let documents_to_insert = [];

            for (let i = 0; i < toIter.length; i++) { 

                path = toIter[i].dimensions[0];

                re = /.*?-n(\d+)/g;
                r  = re.exec(path);
                if (r) {
                    id = String(r[1]);
                } else {
                    id = "PORTADA";
                }

                documents_to_insert.push({
                    path: path,
                    id: id,
                    pageViews: parseInt(toIter[i].metrics[0].values[0]),
                    users: parseInt(toIter[i].metrics[0].values[1]),
                    avgTimeOnPage: parseFloat(toIter[i].metrics[0].values[2])                           
                });
            }

            global.my_mongo_easy.insertDocuments(
                "from_analytics", 
                documents_to_insert,
                (result2) => {
                    res.json({
                        ok: "okey",
                        count: toIter.length,
                        data: result 
                    });
                }
            );
        } catch (err) {
            console.log(result);
            res.end();
        }
    }
}
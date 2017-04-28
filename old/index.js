app.get('/importCSVfromSheets', (req, res) => {

    global.api_helper.csvGSheetsToJson ((myJson) => {

        for (let i = 0; i < myJson.length; i++) {  
            global.my_mongo_easy.insertDocument(
                "from_csv", 
                new EO_node(myJson[i]), 
                () => {
                    //console.log("Inserté FROM_CSV");
                }
            );
        }
    });

    res.render('index', { 
            title: 'Dashboard El Observador', 
            message: 'Hola dash!', 
            mainContent: 'finished !'
        });
});

app.get('/execute/:count', (req, res) => {

    // get all documents on from_csv collection
    let collectionNameFrom = "from_csv";
    global.my_mongo_easy.findDocuments({}, collectionNameFrom, (docs) => {
        
        for (let i = 0; i < req.params.count; i++) {
            let documentToFind = {
                "nid": docs[i].nid
            };
            global.my_mongo_easy.documentExists(
                documentToFind, 
                'from_DOC',
                () => {
                    console.log("No existe en from_DOC el documento " + docs[i].nid);
                    global.my_api_DOC.getArticleFromDOC (
                        docs[i].nid, 
                        (result) => {
                            // get more info from DOC
                            let myNode = new EO_node(docs[i]);
                            myNode.addDOCinfo(result);   

                            // insert full element on mongo
                            global.my_mongo_easy.insertDocument(
                                "from_DOC", 
                                myNode, 
                                () => {
                                    //console.log("Inserté en from_DOC: " + docs[i].nid);
                                }
                            );
                        },
                        (error) => {
                            global.my_mongo_easy.insertDocument(
                                "from_DOC_error", 
                                error, 
                                () => {
                                    //console.log("Inserté en from_DOC_error " + docs[i].nid);
                                }
                            );
                        }
                    );   
                },
                (docsFinded) => {}
            )
        }
    });

    global.my_mongo_easy.findDocuments({}, 'documents', (docs) => {
        res.render('index', { 
            title: 'Dashboard El Observador', 
            message: 'Hola dash!', 
            mainContent: docs
        });
    })
});

app.get('/runForNid/:nid', (req, res) => {

    // get all documents on from_csv collection
    let collectionNameFrom = "from_csv";
    global.my_mongo_easy.findDocuments({'nid':req.params.nid}, collectionNameFrom, (docs) => {
        
        for (let i = 0; i < docs.length; i++) {
            let documentToFind = {
                "nid": docs[i].nid
            };
            global.my_mongo_easy.documentExists(
                documentToFind, 
                'from_DOC',
                () => {
                    console.log("No existe en from_DOC el documento " + docs[i].nid);
                    global.my_api_DOC.getArticleFromDOC (
                        docs[i].nid, 
                        (result) => {
                            // get more info from DOC
                            let myNode = new EO_node(docs[i]);
                            myNode.addDOCinfo(result);   

                            // insert full element on mongo
                            global.my_mongo_easy.insertDocument(
                                "from_DOC", 
                                myNode, 
                                () => {
                                    //console.log("Inserté en from_DOC: " + docs[i].nid);
                                }
                            );
                        },
                        (error) => {
                            global.my_mongo_easy.insertDocument(
                                "from_DOC_error", 
                                error, 
                                () => {
                                    //console.log("Inserté en from_DOC_error " + docs[i].nid);
                                }
                            );
                        }
                    );   
                },
                (docsFinded) => {}
            )
        }
    });

    global.my_mongo_easy.findDocuments({}, 'documents', (docs) => {
        res.render('index', { 
            title: 'Dashboard El Observador', 
            message: 'Hola dash!', 
            mainContent: docs
        });
    })
});
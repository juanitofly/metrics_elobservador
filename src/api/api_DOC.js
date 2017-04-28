const request = require('request');
global.my_config_DOC = require('./config/config_DOC');

module.exports = {

    test: () => {
        console.log("testing");
    },

    getArticleFromDOC: (nid, resolve, onError) => {
        request(global.my_config_DOC.url_api_articles + nid, 
            (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body))
                } else {
                    console.log("error !!");
                    onError(
                        {
                            "nid": nid, 
                            "error":error, 
                            "statusCode": response ? response.statusCode : response
                        });
                }
            }
        );
    },

    getArticleFromDOC_category: (idCategory, resolve, intentos, page) => {

global.logger.info("getArticleFromDOC_category idCategory: " + idCategory + " intentos: " + intentos + " page: " + page);

        let urlToPunch = global.my_config_DOC.url_api_articles_from_category + idCategory + 
            "?selectors=" + global.my_config_DOC.selectors + 
            "&size=" + global.my_config_DOC.pageSize + 
            "&page=" + page;
        request.get(
            {
                url: urlToPunch,
                json: true,
                headers: {'User-Agent': 'request'},
                timeout: 30000  // 30 seconds
            }, 
            (err, res, data) => {
                if (!err && res.statusCode == 200) {
                    resolve(data);
                } else {
                    if (intentos >= 2 || !idCategory) {
                        resolve({});
                    } else {
                        global.my_api_DOC.getArticleFromDOC_category(idCategory, resolve, ++intentos, page);
                        return;
                    }                        
                }
            }
        );
    },

    recursive_f_to_get_articles: (j, callback, onError, page, collectionName) => {

        try {

            // ya recorrí todas la categorías
            if (j > global.my_config_DOC.categories_id.length - 1) {
                callback("j: " + j + " _ page: " + page);
                return;
            }

            let category_id = global.my_config_DOC.categories_id[j];
            let category_name = global.my_config_DOC.categories_name[j];

            global.my_api_DOC.getArticleFromDOC_category(
                category_id, 
                (result) => {

                    if (!result.newsArticles || result.newsArticles.length == 0) {

                        global.logger.info ("BORRAR", j, category_id, category_name, page);
                        module.exports.recursive_f_to_get_articles(++j, callback, onError, 1, collectionName);

                    } else {
                        let docs_to_insert = [];

                        global.logger.info("j", j, "category_id", category_id, "page", page, "result.newsArticles.length", result.newsArticles.length);

                        for (let i = 0; i < result.newsArticles.length; i++) {
                            // ignoro si no es de este año
                            if (result.newsArticles[i].publicationDate.includes("2017")) {
                                result.newsArticles[i].category_name = global.my_config_DOC.categories_name[j];
                                result.newsArticles[i].id = String(result.newsArticles[i].id);
                                docs_to_insert.push(result.newsArticles[i]);
                            }
                        }
                        if (docs_to_insert.length > 0) {
                            //console.log(category_id, category_name, docs_to_insert.length);
                            global.my_mongo_easy.insertDocuments(
                                collectionName,
                                docs_to_insert,
                                (aux) => {
                                    return;
                                }
                            )
                        } 
                        
                        if (result.newsArticles.length === global.my_config_DOC.pageSize && docs_to_insert.length === global.my_config_DOC.pageSize) {
                            // necesito traer mas para la misma categoria
                            module.exports.recursive_f_to_get_articles(j, callback, onError, ++page, collectionName);
                        } else {
                            // si no, avanzo con la categoria y pagino de 1.
                            module.exports.recursive_f_to_get_articles(++j, callback, onError, 1, collectionName);
                        }
                    }
                },
                0,
                page
            )
        } catch (err) {
            onError(err);
        }
    }
}
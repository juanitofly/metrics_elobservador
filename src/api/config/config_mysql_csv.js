module.exports = {
    "host_DOC": "elobservador-slave.ceufc3p9rpdj.us-west-2.rds.amazonaws.com",
    "user_DOC": "rouser",
    "pass_DOC": "r1d$0Nly#1u53R",
    "database_DOC": "cms_elobservador",
    "getNotasData": {
        "query": "select n.idCMSEstado, es.descripcion, count(n.idNota)" +
                    "from nota as n JOIN CMSEstado es on es.idCMSEstado = n.idCMSEstado GROUP BY n.idCMSEstado",
   
        "byBlog": "select n.idNota as id, n.fechaPublicacion as fechaPublicacion, b.idBlog as idBlog, n.idPersona as idPersona, " + 
                    "b_idioma.title as blogTitle, p.nombre as personaNombre, p.apodo as personaApodo " +
                    "from nota as n " +
                    "inner join blog b on b.idPersona = n.idPersona " +
                    "inner join persona p on p.idPersona = b.idPersona " +
                    "inner join blog_CMSIdioma b_idioma on b_idioma.idBlog = b.idBlog " +
                    "where n.idCMSTipoContenido = 6 and n.idCMSEstado = 1 and n.idPersona != 0",
    },
    "google_doc_url": 'https://docs.google.com/spreadsheets/d/1jSfuLDverloLho_rTaOTbB-CZNbSca54lllBaIoJfas/pub?gid=1165326792&single=true&output=csv',
}



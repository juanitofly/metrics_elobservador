module.exports = {

    getDateFromDDMMYYYY(dateString) {
        //06032017
        var st = dateString;
        var pattern = /(\d{2})(\d{2})(\d{4})/;
        var dt = new Date(st.replace(pattern,'$3-$2-$1'));
        return dt;
    },

    getDateFromDDMMYYYYhhmmss(dateString) {
        //07032017050000
        var st = dateString;
        var pattern = /(\d{2})(\d{2})(\d{4})(\d{2})(\d{2})(\d{2})/;
        var dt = new Date(st.replace(pattern,'$3-$2-$10 $4:$5:%6'));
        return dt;  
    },

    toManageJSONresponseOK: (elements) => {
        myData.res.json({
            ok: "okey",
            elements: elements
        })
    },

    toManageJSONresponseERROR: (err) => {
        myData.res.json({
            error: "error",
            err: err
        })
    }
    
}
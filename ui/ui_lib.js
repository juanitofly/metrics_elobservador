module.exports = {

    getDataFromUI: (req) => {

        let dateRange = {};
        let max_items_to_chart;
        let csv;
        
        let raw = req.params.raw == 1 ? true : false;

        if (req.query.start_date && req.query.end_date) {
            dateRange.startDate = req.query.start_date;
            dateRange.endDate = req.query.end_date;
            max_items_to_chart = req.query.count_to_compare;
            csv = req.query.csv;
        } else if (req.params.start_date && req.params.end_date) {
            dateRange.startDate = req.params.start_date;
            dateRange.endDate = req.params.end_date;
            max_items_to_chart = req.params.count_to_compare;
            csv = req.params.csv;
        }

        return {
            dateRange: dateRange,
            max_items_to_chart: max_items_to_chart,
            csv: csv,
        }
    }
}
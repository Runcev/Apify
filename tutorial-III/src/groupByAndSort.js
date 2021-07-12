exports.groupByAndFilter = function (array, groupByField, sortField, sortFieldType) {
    return array.reduce((rv, x) => {
        const rvByKey = rv[x[groupByField]];
        let rvField = rvByKey ? rvByKey[sortField] : undefined;
        let xField = x[sortField];

        if (rvField) {
            switch (sortFieldType) {
                case 'number': {
                    rvField = Number(rvField);
                    xField = Number(xField);
                    break;
                }
                case 'string': {
                    rvField = String(rvField);
                    xField = String(xField);
                    break;
                }
                default:
                    throw new Error("Sort column price wasn't specified");
            }
        }

        if (!rv[x[groupByField]] || (rvField && rvField > xField)) {
            rv[x[groupByField]] = x;
        }
        return rv;
    }, {});
};

const Apify = require('apify');
const { post, get } = require('axios');

const { RUN_TASK_URL, GET_RUN_URL, GET_DATASET_ITEMS_URL } = require('../constants.json');

const env = Apify.getEnv();
const { token } = env;

exports.runTaskViaApi = async function ({ taskId, memory }) {
    /// better use template string with expressions substitution inside instead of .replace() mathod
    return formatResult(await post(RUN_TASK_URL.replace('#taskId', taskId), {}, { params: { token, memory } }));
};

exports.getRunViaApi = async function ({ runId }) {
    /// better use template string with expressions substitution inside instead of .replace() mathod
    return formatResult(await get(GET_RUN_URL.replace('#runId', runId), { params: { token } }));
};

exports.getItemsViaApi = async function ({ datasetId, format, limit, fields }) {
    return formatResult(
        /// better use template string with expressions substitution inside instead of .replace() mathod
        await get(GET_DATASET_ITEMS_URL.replace('#datasetId', datasetId), {
            params: { datasetId, format, limit, fields: fields.toLocaleString(), token },
        }),
    );
};

const formatResult = function (value) {
    return value.data.data ? value.data.data : { items: value.data };
};

const Apify = require('apify');
const ApifyClient = require('apify-client');
const { runTaskViaApi, getRunViaApi, getItemsViaApi } = require('./callApiMethods');
const { poll } = require('./polling.function');

const {
    utils: { log },
} = Apify;

const env = Apify.getEnv();
const { token } = env;
const { TASK_ID: taskId, OUTPUT_FORMAT: format } = require('../constants.json');

const client = new ApifyClient({
    token,
});

const POLL_INTERVAL = 10000;

exports.handler = async function ({ memory, useClient, fields, maxItems }) {
    const runTaskOptions = { taskId, memory };
    const resultOfRun = await runTask(useClient, runTaskOptions);

    const { id: runId, actId } = resultOfRun;

    let run = resultOfRun;
    let i = 0;
    while (run.status === 'RUNNING' || run.status === 'READY') {
        run = await poll(getRun(useClient, { runId, actId }), POLL_INTERVAL);
        log.info(`run: ${++i}. Status: ${run.status}`);
    }

    const getItemsOptions = { datasetId: run.defaultDatasetId, format, limit: maxItems, fields };
    const items = await getItems(useClient, getItemsOptions);
    return items;
};

const runTask = async function (useClient, runTaskOptions) {
    return useClient
        ? client.task(runTaskOptions.taskId).call({}, { memory: runTaskOptions.memory })
        : runTaskViaApi(runTaskOptions);
};

const getRun = async function (useClient, { runId }) {
    return useClient ? client.run(runId).get() : getRunViaApi({ runId });
};

const getItems = async function (useClient, getItemsOptions) {
    return useClient
        ? client.dataset(getItemsOptions.datasetId).downloadItems(format)
        : getItemsViaApi(getItemsOptions);
};

const Apify = require("apify");
const ApifyClient = require("apify-client");
const axios = require("axios");

Apify.main(async () => {
    const {
        memory,
        useClient,
        fields,
        maxItems: limit,
    } = await Apify.getInput();
    const token = process.env.APIFY_TOKEN;
    const TASK_ID = "8YZSqj4pbiDlASe5J";

    let outputData;
    if (useClient) {
        const apifyClient = new ApifyClient({ token });
        const taskClient = apifyClient.task(TASK_ID);
        const { defaultDatasetId } = await taskClient.call({}, { memory });

        const datasetClient = apifyClient.dataset(defaultDatasetId);
        outputData = await datasetClient.downloadItems("csv", {
            limit,
            fields,
        });
    } else {
        const { data: response } = await axios.post(
            `https://api.apify.com/v2/actor-tasks/${TASK_ID}/runs?token=${token}&memory=${memory}&waitForFinish=300`
        );

        const {
            data: { defaultDatasetId },
        } = response;

        const fieldsString = fields.join();
        const { data: responseData } = await axios.get(
            `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${token}&format=csv&limit=${limit}&fields=${fieldsString}`
        );

        outputData = responseData;
    }

    await Apify.setValue("OUTPUT", outputData, {
        contentType: "text/csv",
    });
});
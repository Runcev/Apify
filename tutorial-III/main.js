const Apify = require('apify');
const ApifyClient = require('apify-client');

const { groupByAndFilter } = require('./src/groupByAndSort');

const env = Apify.getEnv();
const client = new ApifyClient({
    token: env.token,
});

Apify.main(async () => {
    const input = await Apify.getInput();
    const { resource } = input;
    const { defaultDatasetId } = resource;
    const { items } = await client.dataset(defaultDatasetId).listItems();
    const groupedAndSortedItems = groupByAndFilter(items, 'ASIN', 'fullPrice', 'number');

    await Apify.pushData(Object.values(groupedAndSortedItems));
});

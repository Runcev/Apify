const Apify = require('apify');

const { utils: { log } } = Apify;
Apify.main(async () => {
    log.info('Actor starts');
    /// never hardcode any datasatId, token, usedId etc.
    /// you should have taken the defaultDatasetId from the input
    const dataset = await Apify.openDataset('K4JmhB7d9CdUHLgE4');
    const offersData = await dataset.getData();
    const datasetItems = offersData.items;
    /// bad idea to print all te dataset items
    log.info(datasetItems);
    const cheapestOption = [];
    datasetItems.forEach((item) => {
        /// check if item.price
        if (item.price) {
            item.price = Number(item.price.substring(1));
        }
    });
    const offersUrls = [];
    /// you can do one 'if' statement instead of two
    /// if (item.price && !offersUrls.includes(item.url)) {}
    datasetItems.forEach((item) => {
        if (item.price) {
            if (!offersUrls.includes(item.url)) {
                offersUrls.push(item.url);
            }
        }
    });
    offersUrls.forEach((item) => {
        const filteredOffers = datasetItems.filter((obj) => {
            return obj.url === item;
        });
        const minValue = filteredOffers.reduce((prev, curr) => {
            return prev.price < curr.price ? prev : curr;
        });
        minValue.price = `$${minValue.price}`;
        cheapestOption.push(minValue);
    });

    log.info(`Cheapest option  ${cheapestOption}`);
    await Apify.pushData(cheapestOption);
});

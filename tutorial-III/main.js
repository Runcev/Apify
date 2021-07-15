const Apify = require('apify');

const { utils: { log } } = Apify;

Apify.main(async () => {
    const {
        resource: { defaultDatasetId }
    } = await Apify.getInput();

    log.info(`The actor is starting with input dataset id == '${defaultDatasetId}'`);

    const dataset = await Apify.openDataset(defaultDatasetId);

    const bestOffersObj = await dataset.reduce((bestOffers, offer) => {
        if (!bestOffers[offer.url] || bestOffers[offer.url].price > offer.price) {
            bestOffers[offer.url] = offer;
        }
        return bestOffers;
    }, {});

    for (const key of Object.keys(bestOffersObj)) {
        await Apify.pushData(bestOffersObj[key]);
    }
});


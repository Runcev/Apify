const Apify = require('apify');
const { handleStart, handleProduct, handleOffers } = require('./src/routes');

const { utils: { log } } = Apify;

Apify.main(async () => {
    const dataset = await Apify.openDataset('Amazon-scrape-lesson-2');
    const requestQueue = await Apify.openRequestQueue();
    const input = await Apify.getInput();
    const proxyConfiguration = await Apify.createProxyConfiguration({
        countryCode: 'US',
    });
    await requestQueue.addRequest({ url: `https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=${input.keyword.keyword}`,
        userData: { label: 'START' } });

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        proxyConfiguration,
        maxConcurrency: 1,
        useSessionPool: true,
        sessionPoolOptions: {
            maxPoolSize: 30,
            sessionOptions: {
                maxUsageCount: 5,
            },
        },
        launchContext: {
            // Chrome with stealth should work for most websites.
            // If it doesn't, feel free to remove this.
            stealth: true,
        },
        handlePageFunction: async (context) => {
            const { url, userData: { label } } = context.request;
            log.info('Page opened.', { label, url });
            switch (label) {
                case 'START':
                    return handleStart(context, requestQueue);
                case 'PRODUCT':
                    return handleProduct(context, requestQueue);
                case 'OFFERS':
                    return handleOffers(context, requestQueue, dataset);
            }
        },

    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
});

const Apify = require('apify');
const { handleStart } = require('./src/handleStart');
const { handleProduct } = require('./src/handleProduct');
const { handleOffers } = require('./src/handleOffers');
const { handlePageOffers } = require('./src/handleOffers_Page');


const { STORAGE_KEYS, DEFAULT_PROXY_GROUP, SEARCH_URL, LABELS } = require('./src/const')

const { utils: { log } } = Apify;

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    const { keyword } = await Apify.getInput();

    const proxyConfiguration = await Apify.createProxyConfiguration({
        countryCode: 'US',
        groups: [DEFAULT_PROXY_GROUP],

    });


    log.info("Starting crawler with keyword: " + keyword);

    //Getting start
    await requestQueue.addRequest({
        url: `${SEARCH_URL.searchUrl}${keyword}`,
        userData: {
            label: LABELS.START
        }
    });

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        proxyConfiguration,
        maxConcurrency: 1,
        useSessionPool: true,
        persistCookiesPerSession: true,
        sessionPoolOptions: {
            maxPoolSize: 100,
            sessionOptions: {
                maxUsageCount: 5,
            },
        },
        launchContext: {
            // Chrome with stealth should work for most websites.
            // If it doesn't, feel free to remove this.
            useChrome: false,
            stealth: true,
            launchOptions: {
                headless: false,
            },

        },
        handlePageFunction: async (context) => {
            const { url, userData: { label } } = context.request;
            log.info('Page opened.', { label, url });
            switch (label) {
                case LABELS.START:
                    return handleStart(context);
                case LABELS.PRODUCT:
                    return handleProduct(context);
                case LABELS.OFFERS_PAGE:
                    return handlePageOffers(context);
                case LABELS.OFFERS:
                    return handleOffers(context, statistics);
            }
        },
        handleFailedRequestFunction: async ({ request }) => {
            log.error(`Request ${request.url} failed too many times`);
            await Apify.pushData({
                '#debug': Apify.utils.createRequestDebugInfo(request),
            });
        },
    });


    const statistics = (await Apify.getValue(STORAGE_KEYS.STATE)) || {};

    Apify.events.on('migrating', () => {
        Apify.setValue(STORAGE_KEYS.STATE, statistics)
    });

    const showStats = setInterval(async () => {
        const stats = await Apify.getValue(STORAGE_KEYS.STATE)
        console.log(stats);
        if (await requestQueue.isFinished()) {
            clearInterval(showStats);
        }
    }, STORAGE_KEYS.STATS_INTERVAL);

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');

    const dataUrl = `https://api.apify.com/v2/datasets/${process.env.APIFY_DEFAULT_DATASET_ID}/items`;
    console.log(dataUrl);

    // send email
   /* await Apify.call('apify/send-mail', {
        to: 'lukas@apify.com',
        subject: 'Kenyiz Vitalii. This is for the Apify Tutorials',
        text: `The link to the dataset:
    https://api.apify.com/v2/datasets/${process.env.APIFY_DEFAULT_DATASET_ID}/items`,
    });*/

});

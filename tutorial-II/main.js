const Apify = require('apify');
const { handleStart, handleProduct, handleOffers } = require('./src/routes');

const { utils: { log } } = Apify;

Apify.main(async () => {
    /// use default dataset if there were no other specs obout that
    const dataset = await Apify.openDataset('Amazon-scrape-lesson-2');
    const requestQueue = await Apify.openRequestQueue();
    const input = await Apify.getInput();
    const proxyConfiguration = await Apify.createProxyConfiguration({
        /// you had to use proxy group like:
        /// groups: ['BUYPROXIES94952'],
        countryCode: 'US',
    });

    /// better move the base of the start url to a separate consts file (.json or .js)
    await requestQueue.addRequest({ url: `https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=${input.keyword}`,
        userData: { label: 'START' } });

    const crawler = new Apify.PuppeteerCrawler({
        /// delete this — there could be a lot of products
        maxRequestsPerCrawl: 50,
        requestQueue,
        proxyConfiguration,
        maxConcurrency: 1,
        /// Implement a better session management. If you get captcha, you can check selector of the captcha.
        /// If you get 400+ status code, you can check it on the context.response.status()(puppeteer docs).
        /// Amazon either gives you 200 status nad captcha or 503 status and complete block
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
                /// all labels and other CAPS stuff should be moved to a separate consts file (.json or .js)
                case 'START':
                    /// handle**** functions should take a single argument — either context (I prefer this)
                    /// or destructured context (for example {page, request}). Everything you need can be found
                    /// in context
                    return handleStart(context, requestQueue);
                /// all labels and other CAPS stuff should be moved to a separate consts file (.json or .js)
                case 'PRODUCT':
                    /// handle**** functions should take a single argument — either context (I prefer this)
                    /// or destructured context (for example {page, request}). Everything you need can be found
                    /// in context
                    return handleProduct(context, requestQueue);
                /// all labels and other CAPS stuff should be moved to a separate consts file (.json or .js)
                case 'OFFERS':
                    return handleOffers(context, requestQueue, dataset);
            }
        },

    });

    /// Where's the code for sending email?
    /// (Better comment it while testing and while in dev. process, so that you don't spam Lukas
    /// with these emails)

    /// Where's the code for printing statistics?
    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
});

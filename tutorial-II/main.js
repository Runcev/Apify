const Apify = require('apify');

const {
    SEARCH_URL,
    LABEL_SEARCH,
    LABEL_PRODUCT,
    LABEL_OFFER,
    PROXY_GROUP,
    DATASET_NAME: datasetName,
    MAX_USAGE_COUNT,
    ERROR_SCORE,
    MAX_CONCURRENCY,
    INTERVAL_OBJECT_LOG,
} = require('./constants.json');

const { handleSearch, handleProductPage, handleOffersPage } = require('./src/routes');
const { getDatasetWithData } = require('./src/getDataset');
const { checkTitle } = require('./src/CheckTitle');

const {
    utils: { log },
} = Apify;

Apify.main(async () => {
    const { keyword } = await Apify.getInput();

    if (!keyword || typeof keyword !== 'string') {
        throw new Error('Wrong INPUT: keyword has to be an string!');
    }

    const sources = [{ url: `${SEARCH_URL}${keyword}`, userData: { label: 'search' } }];

    const arrayFromGetDatasetWithData = await getDatasetWithData({
        datasetName,
    });
    const offersPerProductDataset = arrayFromGetDatasetWithData[0];
    let offersPerProduct = arrayFromGetDatasetWithData[1] || {};

    setInterval(() => {
        log.info(`Product offer: ${JSON.stringify(offersPerProduct)}`);
    }, INTERVAL_OBJECT_LOG);

    const requestList = await Apify.openRequestList('amazon-urls', sources);
    const requestQueue = await Apify.openRequestQueue();
    const proxyConfiguration = await Apify.createProxyConfiguration({
        groups: [PROXY_GROUP],
    });

    async function handleFailedRequestFunction({ request }) {
        log.error(`Request ${request.url} failed too many times`);
        await Apify.pushData({
            '#debug': Apify.utils.createRequestDebugInfo(request),
        });
    }

    async function handlePageFunction({ request, page, session }) {
        const {
            userData: { label },
            url,
        } = request;
        log.info(`Processing ${url}...`);

        checkTitle({ title: (await page.title()) || '', session });

        switch (label) {
            case LABEL_SEARCH:
                await handleSearch({ page, url, requestQueue });
                break;
            case LABEL_PRODUCT:
                await handleProductPage({ request, page, requestQueue });
                break;
            case LABEL_OFFER: {
                const items = await handleOffersPage({
                    request,
                    page,
                    keyword,
                    requestQueue,
                });
                await Apify.pushData(items);
                if (offersPerProduct) {
                    offersPerProduct = items.reduce((acc, el, index, arr) => {
                        acc[el.ASIN] = arr.filter((el2) => el2.ASIN === el.ASIN).length;
                        return acc;
                    }, offersPerProduct);
                }
                break;
            }
            default:
                break;
        }
    }

    const crawler = new Apify.PuppeteerCrawler({
        requestList,
        requestQueue,
        proxyConfiguration,
        useSessionPool: true,
        persistCookiesPerSession: true,
        sessionPoolOptions: {
            sessionOptions: {
                maxUsageCount: MAX_USAGE_COUNT,
                maxErrorScore: ERROR_SCORE,
            },
        },
        launchPuppeteerOptions: {
            useChrome: true,
        },
        maxConcurrency: MAX_CONCURRENCY,
        handlePageFunction: handlePageFunction.bind(this),
        handleFailedRequestFunction: handleFailedRequestFunction.bind(this),
    });

    await crawler.run();

    if (await requestQueue.isFinished()) {
        if (offersPerProduct) {
            await offersPerProductDataset.pushData(offersPerProduct);
        }
    }
});

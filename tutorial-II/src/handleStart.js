const Apify = require('apify');
const { LABELS } = require('./const')

const { utils: { log } } = Apify;

exports.handleStart = async ({page, crawler: { requestQueue },  request }) => {
    const { userData: { keyword } } = request;

    try {
        await page.waitForSelector('.s-asin');
    } catch (error) {
        log.info(`No search results for the keyword '${keyword}'`);
    }

    const ASINs = await page.$$eval('div.s-asin', (Asin) => {
        return Asin.map((asin) => asin.getAttribute('data-asin'));
    });
    log.info('Found such ASINs:' + ASINs)


    for await (const asin of ASINs) {
        await requestQueue.addRequest({
            url: `https://www.amazon.com/dp/${asin}`,
            userData: {
                label: LABELS.PRODUCT,
                ASIN: asin,
            }
        });
    }
};

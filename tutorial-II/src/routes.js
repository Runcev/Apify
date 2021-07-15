const Apify = require('apify');
const { STORAGE_KEYS, LABELS } = require('./const')

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

exports.handleProduct = async ({page, request, crawler: { requestQueue } }) => {

    log.info('Collecting data enqueueing links to  offers page');

    if (await page.$('#productTitle')) {
        const asin = request.url.split('/').pop();
        console.log(asin);

        let title = await page.evaluate(() => {
            return document.querySelector('#productTitle').innerText;
        });

        title = title.replace(/\n/g, '');
        console.log(title);

        const description = [];
        const descriptionArray = await page.$$eval('ul.a-unordered-list.a-vertical.a-spacing-mini > li > span.a-list-item', (span) => {
            return span.map((element) => element.textContent);
        });

        descriptionArray.forEach((el) => {
            description.push(el.replace(/\n/g, ''));
        });

        const offersUrl = `https://www.amazon.com/gp/offer-listing/${asin}`;

        await requestQueue.addRequest({ url: offersUrl,
            userData: {
                label: LABELS.OFFERS_PAGE,
                ASIN: asin,
                data: {
                    url: request.url,
                    title,
                    description: description.join('\n'),
                },
            }
            }, { forefront: true });
    }
};


/*exports.handlePageOffers = async ({ page, request, crawler: { requestQueue } }) => {

    const productInfos = {title, description, url} = request.userData.data;

    const isLoaded = await page.waitForSelector('#titleSection #productTitle');
    if (!isLoaded) throw new Error('Page is blocked or not loaded!');

    // Get the pinned offer
    const getPinnedOffer = async () => {
        await page.waitForSelector('#all-offers-display');

        const pinnedSellerName = await page.$eval('#aod-pinned-offer-additional-content .a-size-small.a-color-base',
            ((el) => el.textContent ?.trim()));

        const pinnedPrice = await page.$eval('.a-box-inner #price_inside_buybox',
            ((el) => el.textContent ?.trim()));

        const pinnedShippingPrice = await page.$eval('#deliveryBlockMessage a',
            ((el) => el.textContent ?.trim()));

        await Apify.pushData({
            ...productInfos,
            pinnedSellerName,
            pinnedPrice,
            pinnedShippingPrice,
        });
    }

    const offersCount = await page.$eval(
        '#aod-filter-offer-count-string',
        (amountText) => amountText.innerText.trim()
    );

    await getPinnedOffer();

    // Get count of page with all offers
    const pageCount = Math.ceil(
        Number.parseInt(offersCount) / 10
    );
    if (Number.isInteger(pageCount) && pageCount > 0) {
        for (let i = 1; i <= pageCount; i++) {
            await requestQueue.addRequest(
                {
                    url: `https://www.amazon.com/gp/aod/ajax/ref=aod_page_${i}?asin=${request.userData.ASIN}&pc=dp&isonlyrenderofferlist=true&pageno=${i}`,
                    label: LABELS.OFFERS,
                    ASIN: request.userData.ASIN,
                    userData: {
                        data: {
                            url: request.url,
                            title,
                            description,
                            offersCount: offersCount.split(' ')[0] - 0,
                        }
                    },
                }, { forefront: true });
        }
    }
}*/


exports.handleOffers = async (context) => {
    const { request, page, session } = context;

    log.info('Getting data from offers page');
    let formattedData;
    console.log(request.url);

    if (await page.$('#aod-offer')) {

        const data = await page.$$eval('#aod-offer', (element) => {
            const scrapedData = [];
            element.forEach((el) => {
                const price = el.querySelector('div#aod-offer span.a-price > .a-offscreen').innerText;
                const sellerName = el.querySelector('.a-col-right > a.a-link-normal').innerText;
                let shippingPrice = '';
                if (!(el.querySelector('#delivery-message .a-color-error')) && !(el.querySelector('#delivery-message'))) {
                    shippingPrice = el.querySelector('.a-size-base > .a-color-secondary.a-size-base').innerText;
                }

                scrapedData.push({
                    price,
                    sellerName,
                    shippingPrice,
                });
            });
            return scrapedData;
        });
        if (data.length > 0) {
            formattedData = data.map((el) => {
                return { ...request.userData.data, ...el };
            });

            log.info('Formatted data : ' + JSON.stringify(formattedData));

            await Apify.pushData(formattedData);
        }

        console.log(data);

    } else {
        await Apify.pushData({ ...request.userData.data, orderInfo: 'not exist' });
        log.info('Bad session, adding collected data to dataset and marking retiring session ');
        session.retire();
    }

    const store = await Apify.openKeyValueStore();

    const previousState = await store.getValue(STORAGE_KEYS.STATE) || {};
    const newState = { ...previousState, [request.userData.ASIN]: request.userData.data.offersCount + 1 || 1 }
    await store.setValue(STORAGE_KEYS.STATE, newState);
};

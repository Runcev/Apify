const Apify = require('apify');

const {
    utils: { log },
} = Apify;

const {
    PRODUCT_URL,
    OFFER_URL,
    LABEL_PRODUCT,
    LABEL_OFFER,
    LABEL_SEARCH,
    TIMEOUT_WAIT_FOR_SELECTOR,
    AMAZON_URL_ORIGIN,
} = require('../constants.json');

let counter = 0;

exports.handleSearch = async ({ page, requestQueue }) => {
    const data = await getData(page);

    if (data && data.length) {
        const [products, search] = await getRequests(data, page);
        await addRequest(products, requestQueue);
        await addRequest(search, requestQueue);
    } else {
        log.info("Can't find any products on this page");
    }
};

exports.handleProductPage = async ({ request, page, requestQueue }) => {
    const title = await getProductTitle(page);
    const description = await getProductDescription(page);

    const ASIN = getASINFromRequest(request);

    await requestQueue.addRequest({
        url: `${OFFER_URL}/${ASIN}`,
        userData: {
            label: LABEL_OFFER,
            ASIN,
            title,
            description,
            url: request.url,
        },
    });
};

exports.handleOffersPage = async ({ request, page, keyword, requestQueue }) => {
    const {
        userData: { ASIN, title, url, description },
    } = request;
    const pageAmount = 1;
    const result = [];

    const data = await getProductData(page);

    if (data && data.length) {
        for (const el of data) {
            el.ASIN = ASIN;
            el.title = title;
            el.url = url;
            el.description = description;
            el.keyword = keyword;
            result.push(el);
        }

        const nextPageLink = await linkToNextPageIfExist(page);
        if (nextPageLink) {
            log.info(`current OFFER page ${url} has next page ${AMAZON_URL_ORIGIN + nextPageLink}`);
            await requestQueue.addRequest({
                url: AMAZON_URL_ORIGIN + nextPageLink,
                userData: { label: LABEL_OFFER },
            });
        }
    } else {
        log.info(`Can't find any offers on this page (page ${pageAmount})`);
    }

    return result;
};

const linkToNextPageIfExist = async (page) => {
    try {
        await page.waitForSelector('.a-last', {
            timeout: TIMEOUT_WAIT_FOR_SELECTOR,
        });
    } catch (e) {
        return undefined;
    }

    return page.$$eval('.a-last', async ($items) => {
        const nextPage = $items[0];
        if (nextPage) {
            if (!(nextPage.classList.contains('a-last') && nextPage.classList.contains('a-disabled'))) {
                return nextPage.querySelector('a').getAttribute('href');
            }
            return undefined;
        }
        return undefined;
    });
};

const getASINFromRequest = (request) => {
    return request.userData.ASIN;
};

async function getProductData(page) {
    return page.$$eval('div.olpOffer', async ($items) => {
        const scrappedData = [];
        if ($items) {
            for (const $item of $items) {
                const nameElem = $item.querySelector('h3.olpSellerName span a');
                const nameElemFromPicture = $item.querySelector('h3.olpSellerName img');
                const priceElem = $item.querySelector('.olpOfferPrice');
                const defaultName = nameElemFromPicture ? nameElemFromPicture.getAttribute('alt') : 'Name undefined';
                scrappedData.push({
                    sellerName: nameElem ? nameElem.innerText : defaultName,
                    fullPrice: priceElem ? priceElem.innerText : 'Undefined price',
                });
            }
            return scrappedData;
        }
        return [];
    });
}

async function getProductDescription(page) {
    return page.$$eval('#feature-bullets ul li span', async ($items) => {
        let itemDescription = '';
        for (const $item of $items) {
            itemDescription += `${$item.innerText}\n`;
        }
        return itemDescription;
    });
}

async function getProductTitle(page) {
    let title = '';
    try {
        title = await page.$$eval('#productTitle', async ($items) => {
            return $items[0].innerText;
        });
    } catch (error) {
        title = await page.$$eval('.a-size-large .qa-title-text', async ($items) => {
            return $items[0].innerText;
        });
    }
    return title;
}

async function addRequest(requests, requestQueue) {
    if (requests && requests.length) {
        for (const request of requests) {
            await requestQueue.addRequest(request);
        }
    }
}

async function getRequests(data, page) {
    const { maxItems } = await Apify.getInput();

    const products = [];
    const search = [];
    for (let i = 0; i < (data.length > maxItems || data.length); i++ && counter++) {
        const ASIN = data[i];
        products.push({
            url: `${PRODUCT_URL}/${ASIN}`,
            userData: { label: LABEL_PRODUCT, ASIN },
        });

        counter++;
    }
    if (counter < maxItems) {
        const nextPageLink = await linkToNextPageIfExist(page);
        if (nextPageLink) {
            search.push({
                url: AMAZON_URL_ORIGIN + nextPageLink,
                userData: { label: LABEL_SEARCH },
            });
        }
    }

    return [products, search];
}

async function getData(page) {
    return page.$$eval('[data-component-type="s-search-result"]', async ($items) => {
        const scrapedData = [];
        for (const $post of $items) {
            scrapedData.push($post.getAttribute('data-asin'));
        }

        return scrapedData;
    });
}

const Apify = require('apify');

const { LABELS: { OFFERS } } = require('./const');

exports.handlePageOffers = async ({ page, request, crawler: { requestQueue } }) => {

    const { title, url, description, keyword } = request.userData.data;

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
            title,
            url,
            description,
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
    const pageCount = (Math.ceil(
        Number.parseInt(offersCount) / 10)
    );
    if (Number.isInteger(pageCount) && pageCount > 0) {
        for (let i = 1; i <= pageCount; i++) {
            await requestQueue.addRequest(
                {
                    url: `https://www.amazon.com/gp/aod/ajax/ref=aod_page_${i}?asin=${request.userData.ASIN}&pc=dp&isonlyrenderofferlist=true&pageno=${i}`,
                    userData: {
                        label: OFFERS,
                        ASIN: request.userData.ASIN,
                        title,
                        url,
                        description,
                        keyword,
                        data: {
                            offersCount: offersCount.split(' ')[0] - 0,
                        }
                    },
                },
                { forefront: true }
            );
        }
    }
}

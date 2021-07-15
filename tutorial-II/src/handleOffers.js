const Apify = require('apify');

const { STORAGE_KEYS } = require('./const');

exports.handleOffers =  async ({ request, page}) => {
    const { ASIN, title, url, description, keyword, offersCount } = request.userData;

    const offers = await page.$$eval("#aod-offer", ($offers) => {
        const data = [];
        $offers.forEach(($offer) => {

            const sellerName = $offer.querySelector("#aod-offer-soldBy a").innerText;

            const price = $offer.querySelector("#aod-offer-price .a-price .a-offscreen").innerText;

            const shippingPrice =
                ($offer.querySelector("#aod-offer-price .a-color-base .a-size-base") === null)
                    ? "free"
                    : ($offer.querySelector("#aod-offer-price .a-color-base .a-size-base").innerText)

            data.push({
                sellerName,
                price,
                shippingPrice,
            });
        });
        return data;
    });

    await Promise.all(
        offers.map(({ sellerName, price, shippingPrice }) => {
            return Apify.pushData({
                title,
                url,
                description,
                keyword,
                sellerName,
                price,
                shippingPrice,
            });
        })
    );

    const store = await Apify.openKeyValueStore();

    const previousState = await store.getValue(STORAGE_KEYS.STATE) || {};
    const newState = { ...previousState, [ASIN]: offersCount + 1 || 1 }
    await store.setValue(STORAGE_KEYS.STATE, newState);
}

const Apify = require('apify');

const { STORAGE_KEYS } = require('./const');

exports.handleOffers = async ({request, page}, statistics) => {

    const { title, url, description, keyword } = request.userData;

    // Get the all additional offers
    const offersInfos = await page.$$eval('#aod-offer',
        (offers) => {
            return offers.map((offer) => {
                const sellerName = offer.querySelector('#aod-offer-soldBy a')
                    .textContent ?.trim();

                const price = offer.querySelector('#aod-offer-price .a-price .a-offscreen').textContent.trim();

                let shippingPrice = offer.querySelector('#aod-offer-price .a-color-base .a-size-base',
                    ((el) => el.textContent ?.trim()));
                if (!shippingPrice) {
                    shippingPrice = 'Free';
                }

                return {
                    sellerName,
                    price,
                    shippingPrice,
                }
            });
        });

    await Promise.all(
        offersInfos.map(({ sellerName, price, shippingPrice }) => {
            return Apify.pushData({
                title,
                url,
                description,
                keyword,
                sellerName,
                price,
                shippingPrice
            });
        })
    );



   const store = await Apify.openKeyValueStore();

    const previousState = await store.getValue(STORAGE_KEYS.STATE) || {};
    const newState = { ...previousState, [request.userData.ASIN]: request.userData.data.offersCount+1 || 1 }
    await store.setValue(STORAGE_KEYS.STATE, newState);
}

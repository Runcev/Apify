const Apify = require('apify');

const { sleep } = Apify.utils;
const { utils: { log } } = Apify;

exports.handleStart = async (context, requestQueue) => {
    const { page } = context;
    //await sleep(3000);
    const ASINs = await page.$$eval('div.s-asin', (Asin) => {
        return Asin.map((asin) => asin.getAttribute('data-asin'));
    });
    for await (const asin of ASINs) {
        await requestQueue.addRequest({ url: `https://www.amazon.com/dp/${asin}`, userData: { label: 'PRODUCT' } });
    }
};

exports.handleProduct = async (context, requestQueue) => {
    const { request, page } = context;

    log.info('Collecting data enqueueing links to  offers page');
    //await sleep(3000);
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
                label: 'OFFERS',
                data: {
                    url: request.url,
                    title,
                    description: description.join('\n'),
                },
            } }, { forefront: false });
    }
};

exports.handleOffers = async (context, requestQueue, dataset) => {
    const { request, page, session } = context;

    log.info('Getting data from offers page');
    let formattedData;
    //await sleep(10000);
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
            await dataset.pushData(formattedData);
        } else {
            await dataset.pushData({ ...request.userData.data, orderInfo: 'not exist' });
        }

        console.log(data);
    } else {
        await dataset.pushData({ ...request.userData.data, orderInfo: 'not exist' });
        log.info('Bad session, adding collected data to dataset and marking retiring session ');
        session.retire();
    }
};

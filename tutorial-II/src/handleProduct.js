const Apify = require('apify');
const { LABELS } = require('./const')

const { utils: { log } } = Apify;

exports.handleProduct = async ({url, page, request, keyword, crawler: { requestQueue } }) => {

    log.info('Collecting data enqueueing links to offers page');

    if (await page.$('#productTitle')) {
        const asin = request.userData.ASIN;
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




        await requestQueue.addRequest({
            url: offersUrl,
            userData: {
                label: LABELS.OFFERS_PAGE,
                ASIN: asin,
                data: {
                    url: request.url,
                    title: title,
                    description: description.join('\n'),
                    keyword,
                },
            }
        }, { forefront: true });
    }
};

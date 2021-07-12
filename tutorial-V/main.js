const Apify = require('apify');
const { handler } = require('./src/handler');

const { OUTPUT_CONTENT_TYPE: contentType } = require('./constants.json');

Apify.main(async () => {
    const { memory, useClient, fields, maxItems } = await Apify.getInput();

    const result = await handler({ memory, useClient, fields, maxItems });
    await Apify.setValue('OUTPUT', result.items, { contentType });
});

const Apify = require('apify');

exports.getDatasetWithData = async function ({ datasetName }) {
    const deletedDataset = await Apify.openDataset(datasetName);
    const offersPerProduct = await deletedDataset.getData();
    await deletedDataset.drop();
    const offersPerProductDataset = await Apify.openDataset(datasetName);
    return [offersPerProductDataset, offersPerProduct.items[0]];
};

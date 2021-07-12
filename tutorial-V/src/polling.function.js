const delay = (time) => new Promise((resolve) => {
    setTimeout(resolve, time);
});

exports.poll = async (promise, time) => {
    const value = await promise;
    await delay(time);
    return value;
};

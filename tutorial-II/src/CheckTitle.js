const blockedTitles = ['Robot Check', 'CAPTCHA', 'Service Unavailable Error'];

exports.checkTitle = function ({ title, session }) {
    for (let index = 0; index < blockedTitles.length; index++) {
        const element = blockedTitles[index];
        if (title.includes(element)) {
            session.retire();
            throw new Error('Session blocked');
        }
    }
};

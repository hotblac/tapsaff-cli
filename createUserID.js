const { promisify } = require('util');
const { randomBytes } = require('crypto');

const randomBytesAsync = promisify(randomBytes);

module.exports = {
    createUserID: async () => {
        const buffer = await randomBytesAsync(16);

        return `dl_${ buffer.toString('hex') }`;
    }
};


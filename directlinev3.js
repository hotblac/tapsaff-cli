const { randomBytes } = require('crypto');
const fetch = require('node-fetch');

const DIRECT_LINE_URL = 'https://directline.botframework.com';

module.exports = {

    startConversation: async () => {
        const { DIRECT_LINE_SECRET } = process.env;
        const userId = createUserId();

        const response = await fetch(`${ DIRECT_LINE_URL }/v3/directline/conversations`, {
            body: JSON.stringify({ User: { Id: userId } }),
            headers: {
                authorization: `Bearer ${ DIRECT_LINE_SECRET }`,
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });

        if (response.status === 201) {
            const conversation = await response.json();
            if ('error' in conversation) {
                throw new Error(`Direct Line service responded ${ JSON.stringify(conversation.error) } while starting a new conversation`);
            } else {
                return conversation;
            }
        } else {
            throw new Error(`Direct Line service returned ${ response.status } while starting a new conversation`);
        }
    }

}

function createUserId() {
    const buffer = randomBytes(16);
    return `dl_${ buffer.toString('hex') }`;
}

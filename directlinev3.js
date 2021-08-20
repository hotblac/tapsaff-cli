const { randomBytes } = require('crypto');
const fetch = require('node-fetch');
const { WebSocket } = require('ws');

const DIRECT_LINE_URL = 'https://directline.botframework.com';
const { DIRECT_LINE_SECRET } = process.env;

module.exports = {

    /**
     * Start a conversation with MS Bot Framework.
     * @returns {Promise<{streamUrl, conversationId, token}>}
     * @link https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-api-reference?view=azure-bot-service-4.0#conversation-object Conversation object
     */
    startConversation: async () => {
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
            const responseBody = await response.json();
            if ('error' in responseBody) {
                throw new Error(`Direct Line service responded ${ JSON.stringify(responseBody.error) } while starting a new conversation`);
            } else {
                // Expect Conversation object response
                const {conversationId, streamUrl, token, ...otherJSON} = responseBody;
                return {conversationId, streamUrl, token, userId, ...otherJSON};
            }
        } else {
            throw new Error(`Direct Line service returned ${ response.status } while starting a new conversation`);
        }
    },

    /**
     * Send the message to the conversation
     */
    sendMessage: async (conversation, message) => {

        const response = await fetch(`${ DIRECT_LINE_URL }/v3/directline/conversations/${ conversation.conversationId }/activities
`, {
            body: JSON.stringify({ type: 'message', from: {id: conversation.userId}, text: message}),
            headers: {
                authorization: `Bearer ${ DIRECT_LINE_SECRET }`,
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });

        if (response.status !== 200) {
            throw new Error(`Direct Line service returned ${ response.status } while sending an activity`);
        }

    },

    /**
     * Receive messages the conversation
     * @param conversation to listen to
     * @param handler for the next Activity in the conversation
     * @returns {Promise<void>}
     * @see https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-connector-api-reference?view=azure-bot-service-4.0#activity-object Activity object
     */
    receiveMessages: async(conversation, handler) => {
        const ws = new WebSocket(conversation.streamUrl);
        ws.onmessage = message => {
            if (message.data) {
                const activitySet = JSON.parse(message.data);
                // Ignore activities from userId. They're outgoing messages.
                activitySet.activities.forEach(activity => activity.from.id !== conversation.userId && handler(activity));
            }
        };
        ws.on('error', error => console.log(error));
    }

}

function createUserId() {
    const buffer = randomBytes(16);
    return `dl_${ buffer.toString('hex') }`;
}

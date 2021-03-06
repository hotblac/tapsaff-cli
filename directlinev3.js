const { randomBytes } = require('crypto');
const fetch = require('node-fetch');

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
                authorization: `Bearer ${ conversation.token }`,
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });

        if (response.status === 200) {
            const responseBody = await response.json();
            return responseBody.id;
        } else {
            throw new Error(`Direct Line service returned ${ response.status } while sending an activity`);
        }

    },

    getWelcome: async(conversation) => {
        const activities = await getActivities(conversation);
        const welcome = activities.find(activity => activity.from !== conversation.userId);
        if (welcome) {
            return welcome.text;
        } else {
            // TODO: wait until the welcome is received
            throw new Error(`Could not find welcome`);
        }
    },

    getReply: async(conversation, replyToId) => {
        const activities = await getActivities(conversation);
        const reply = activities.find(activity => activity.replyToId === replyToId);
        if (reply) {
            return reply.text;
        } else {
            // TODO: wait until the reply is received
            throw new Error(`Could not find reply to activity ${ replyToId }`);
        }
    }

}

function createUserId() {
    const buffer = randomBytes(16);
    return `dl_${ buffer.toString('hex') }`;
}

async function getActivities(conversation) {
    const response = await fetch(`${ DIRECT_LINE_URL }/v3/directline/conversations/${ conversation.conversationId }/activities
`, {
        headers: {
            authorization: `Bearer ${ conversation.token }`
        },
        method: 'GET'
    });

    if (response.status === 200) {
        const responseBody = await response.json();
        return responseBody.activities;
    } else {
        throw new Error(`Direct Line service returned ${ response.status } while receiving responses`);
    }
}

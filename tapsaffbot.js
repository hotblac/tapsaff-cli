const { startConversation } = require('./directlinev3')

module.exports = {

    welcome: () => {
        return "What city are you in?";
    },

    tapsAff: (city, action) => {
        startConversation()
            .then(conversation => action(conversation.conversationId)); // TODO: Use the conversationId to find messages
    }
}

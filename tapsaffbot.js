const { startConversation, sendMessage, getReply, getWelcome} = require('./directlinev3')

module.exports = {

    welcome: () => {
        return startConversation()
            .then(conversation => getWelcome(conversation));
    },

    tapsAff: (city, action) => {
        startConversation()
            .then(conversation => sendMessage(conversation, city)
                .then(activityId => getReply(conversation, activityId))
                .then(reply => action(reply)));
    }
}

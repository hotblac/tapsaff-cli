const { startConversation, sendMessage, getReply} = require('./directlinev3')

module.exports = {

    welcome: () => {
        return "What city are you in?";
    },

    tapsAff: (city, action) => {
        startConversation()
            .then(conversation => sendMessage(conversation, city)
                .then(activityId => getReply(conversation, activityId))
                .then(reply => action(reply)));
    }
}

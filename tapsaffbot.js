const { startConversation, receiveMessages, sendMessage} = require('./directlinev3')

module.exports = {

    welcome: () => {
        return "What city are you in?";
    },

    tapsAff: (city, action) => {
        startConversation()
            .then(conversation => {
                receiveMessages(conversation, action)
                sendMessage(conversation, city);
            });
    }
}

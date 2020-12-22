/*
    - check if remaking the dm channel will save same message id's
    - log successes?

*/
const { logger } = require('./utility/logger.js');

class DiscordManager {

    constructor(client) {
        this.clien = client;
    }

    // decides what channels to listen to and passes to the right function maybe?
    listen(message) {
        return;
    }

    guildListen(message) {
        return;
    }

    dmListen(message) {
        return;
    }

    autoReply() {
        return;
    }

    command() {
        return;
    }

    fetchGuild(guildID) {
        return this.client.guilds
            .fetch(guildID, true)
            .catch(error => logger.error(`fetchGuild Error: ${error}\nGuild ID: ${guildID}`));
    }

    fetchRoll(guildID, rollID) {
        return this
            .fetchGuild(guildID)
            .then(guild => guild.roles
                .fetch(rollID, true)
                .catch(error => logger.error(`fetchRoll Error: ${error}\nGuild ID: ${guildID}\nRoll ID: ${rollID}`)));
    }

    fetchChannel(channelID) {
        return this.client.channels
            .fetch(channelID, true)
            .catch(error => logger.error(`fetchChannel Error: ${error}\nChannel ID: ${channelID}`));
    }

    sendMessage(channelID, message) {
        return this.fetchChannel(channelID)
            .then(channel => {
                channel
                    .sendMessage(message)
                    .catch(error => logger.error(`sendMessage Error: ${error}\nChannel ID: ${channelID}\nMessage: ${message}`));
                logger.info(`Message Send Success\nChannel ID: ${channelID}\nMessage: ${message}`);
            });
    }

    fetchMessage(channelID, messageID) {
        return this.fetchChannel(channelID)
            .then(channel => channel.messages
                .fetch(messageID)
                .catch(error => logger.error(`fetchMessage Error: ${error}\nChannel ID: ${channelID}\nMessage ID: ${messageID}`)));
    }

    fetchUser(userID) {
        return this.client.users
            .fetch(userID, true)
            .catch(error => logger.error(`fetchUser Error: ${error}\nUser ID: ${userID}`));
    }

    fetchDM(userID) {
        return this.fetchUser
            .then(user => user.createDM())
            .catch(error => logger.error(`fetchDM error: ${error}\nUser ID: ${userID}`));
    }

    sendDM(userID, message) {
        return this.fetchDM()
            .then(dmChannel => {
                dmChannel
                    .send(message)
                    .catch(error => logger.error(`sendDM error: ${error}\nUser ID: ${userID}\nMessage: ${message}`));
                logger.info(`Direct Message Send Success\nUser ID: ${userID}\nMessage: ${message}`);
            });
    }

    addCollector() {
        return;
    }

    joinVoice(channel) {
        return;
    }

    leaveVoice() {
        return;
    }


};

/*
    - check if remaking the dm channel will save same message id's
    - log successes?

*/
const { logger } = require('./utility/logger.js'),
    settings = require('./utility/settings.js');

let settingsObject = settings.updateSettings();

class Response {
    constructor(pattern, messageResponse, action, transport) {
        // regex
        this.pattern = pattern;
        // string
        this.messageResponse = messageResponse;
        // function
        this.action = action;
        // string
        this.transport = transport;
    }

    getPattern() {
        return this.pattern;
    }

    getTransport() {
        return this.transport;
    }

    respond(discordManager, chanUseID) {
        this.transport == 'guild' ? discordManager.sendMessage(chanUseID, this.messageResponse) : discordManager.sendDM(chanUseID, this.messageResponse);
        return;
    }

    runAction() {
        this.respond(arguments[0], arguments[1]);
        this.action(arguments);
        return;
    }
}

class DiscordManager {

    constructor(client) {
        this.client = client;
        this.autoResponses = [];
        this.commands = [];
        this.dmCommands = [];
    }

    static createDiscordManager(client) {
        return new DiscordManager(client);
    }

    logon() {
        logger.info('Connected to Discord');
        logger.info('Logged in as: ');
        logger.info(`${this.client.user.username} - (${this.client.user.id})`);
        logger.info(`Watching:${this.client.guilds.cache.array().map(guild => `\n${guild.name} - (${guild.id})`).join(', ')}`);
    }

    // decides what channels to listen to and passes to the right function maybe?
    listen(message) {
        switch(message.channel.type) {
            case 'dm':
                break;
            case 'text':
                /*
                    check if an auto response is in the message
                        if it is, respond
                    
                    check if the message is a command
                        needs the prefix and specific command word

                        carry out the command if it is

                    when do I split the command?
                        I need the first split to determine if it is actually a command'

                */


                // handle auto response
                this.autoResponse(message.content, message.channel.id);
                // handle commands
                if (message.content.startsWith(settingsObject.prefix) && ) {

                }
                break;
            default:
                logger.warn(`Message recieved from unknown channel: \nChannel ID: ${message.channel.id}\nChannel Type: ${message.channel.type}`);
        }
        return;
    }

    autoResponse(message, channelID) {
        for (ar in this.autoResponses) {
            if(message.toLowerCase().match(ar.pattern)) {
                // this feels like a runaround
                // but may be useful if I need to run an action as well
                ar.respond(this, channelID);
            }
        }
    }

    // need a variable name for command
    command(commandPos, arguments, channelID) {
        for (com in this.commands) {
            if(commandPos.toLowerCase().match(com.pattern)) {
                com.action();
            }
        }
    }

    newAutoResponse(pattern = /default/g, message = '', action = () => { return; }) {
        this.autoResponses.push(new Response(pattern, message, action));
        return logger.info(`Watching for pattern: ${pattern.toString()}\nwith response: ${message}`);
    }

    newCommand(pattern = /default/g, message = '', action = () => { return; }, dmCommand) {
        dmCommand ? this.dmCommands.push(new Response(pattern, message, action)) : this.commands.push(new Response(pattern, message, action));
        return logger.info(`Command added: ${pattern.toString()}`);
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


}


module.exports = {
    createDiscordManager: DiscordManager.createDiscordManager
};
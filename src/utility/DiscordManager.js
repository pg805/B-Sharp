/*
    - check if remaking the dm channel will save same message id's
    - log successes?

*/

const Discord = require('discord.js'),
    { DISCORDTOKEN } = require('../data/keys.json'),
    { logger } = require('./utility/logger.js');

const client = new Discord.Client({ ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'] } }),
    forgoTurtID = '593804670313562112',
    botTestID = '594244452437065729';

// login bot
client.login(DISCORDTOKEN);

let forgoTurts;
let botTest;

// login message
client.on('ready', () => {
    // poll.checkTime();
    // poll.onLoad(client.channels);
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(`${client.user.username} - (${client.user.id})`);
    logger.info('Watching:');
    logger.info(`${client.guilds.cache.array().map(guild => `${guild.name} - (${guild.id})`).join(', ')}`);
    forgoTurts = client.guilds.cache.get(forgoTurtID);
    botTest = client.guilds.cache.get(botTestID);

    // for Josh Panel.
    console.log('Bot Started');
});

// logs client errors and warnings
client.on('debug', debug => logger.debug(`Discord Debug: ${debug}`));
client.on('warn', warning => logger.warn(`Discord Warning: ${warning}`));
client.on('error', error => logger.error(`Discord Error: ${error}`));

class DiscordManager {

    // constructor() {
    //     this.vc = null;
    // }

    fetchGuild(guildID) {
        return client.guilds
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
        return client.channels
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
        return client.users
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

    joinVoice(channel) {
        return;
    }

    leaveVoice() {
        return;
    }


};

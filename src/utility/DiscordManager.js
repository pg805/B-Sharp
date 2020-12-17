/*
Handles all interaction with discord
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
// client.on('debug', m => logger.debug('debug', m));
client.on('warn', warning => logger.warn('warn', `Discord Warning: ${warning}`));
client.on('error', error => logger.error('error', `Discord Error: ${error}`));

class DiscordManager {

    fetchGuild(guildID) {
        return client.guilds
            .fetch(guildID, true)
            .catch(error => logger.error(`fetchGuild Error: ${error}\nGuild ID: ${guildID}`));
    }

    fetchChannel(channelID) {
        return client.channels
            .fetch(channelID, true)
            .catch(error => logger.error(`fetchChannel Error: ${error}\nChannel ID: ${channelID}`));
    }

    sendMessage(channelID, message) {
        return this.fetchChannel(channelID)
            .then(channel => channel.sendMessage(message))
            .catch(error => logger.error(`sendMessage Error: ${error}\nChannel ID: ${channelID}\nMessage: ${message}`));
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
            .then(dmChannel => dmChannel.send(message))
            .catch(error => logger.error(`sendDM error: ${error}\nUser ID: ${userID}\nMessage: ${message}`));
    }

    
};
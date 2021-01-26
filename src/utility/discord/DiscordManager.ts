/*
    - check if remaking the dm channel will save same message id's
    - log successes?
*/
import { logger } from '../logger.js';
import settings from '../../settings.js';

const Discord = require('discord.js'),
	{ DISCORDTOKEN } = require('../data/keys.json');

let settingsObject = settings.updateSettings();



class DiscordManager {
    client:any;

    constructor(client:any) {
        this.client = client;
        // this.autoResponses = [];
        // this.commands = [];
        // this.dmCommands = [];
    }

    static createDiscordManager() {

        const client = new Discord.Client({ ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'] } });

        // login bot
        client.login(DISCORDTOKEN);

        client.on('ready', () => {
            logger.info('Connected to Discord');
            logger.info('Logged in as: ');
            logger.info(`${client.user.username} - (${client.user.id})`);
            logger.info(`Watching:${client.guilds.cache.array().map(guild => `\n${guild.name} - (${guild.id})`).join(', ')}`);

            // for Josh Panel.
            console.log('Bot Started');
        });

        client.on('debug', debug => logger.debug(`Discord Debug: ${debug}`));
        client.on('warn', warning => logger.warn(`Discord Warning: ${warning}`));
        client.on('error', error => logger.error(`Discord Error: ${error}`));

        // responses
        // client.on('message', message => {DiscordManager.listen(message)} );

        return new DiscordManager(client);
    }

    // guildListen(message) {
    //     return;
    // }

    // dmListen(message) {
    //     return;
    // }

    // autoResponse(pattern = /default/g, message = '', action = () => { return; }) {
    //     this.autoResponses.push(new Response(pattern, message, action));
    //     return logger.info(`Watching for pattern: ${pattern.toString()}\nwith response: ${message}`);
    // }

    // command(pattern = /default/g, message = '', action = () => { return; }, dmCommand) {
    //     dmCommand ? this.dmCommands.push(new Response(pattern, message, action)) : this.commands.push(new Response(pattern, message, action));
    //     return logger.info(`Command added: ${pattern.toString()}`);
    // }

    fetchGuild(guildID) {
        return this.client.guilds
            .fetch(guildID, true)
            .catch(error => logger.error(`fetchGuild Error: ${error}\nGuild ID: ${guildID}`));
    }

    fetchRoll(guildID:number, rollID:number) {
        return this
            .fetchGuild(guildID)
            .then(guild => guild.roles
                .fetch(rollID, true)
                .catch(error => logger.error(`fetchRoll Error: ${error}\nGuild ID: ${guildID}\nRoll ID: ${rollID}`)));
    }

    fetchChannel(channelID:number) {
        return this.client.channels
            .fetch(channelID, true)
            .catch(error => logger.error(`fetchChannel Error: ${error}\nChannel ID: ${channelID}`));
    }

    sendMessage(channelID:number, message:number) {
        return this.fetchChannel(channelID)
            .then(channel => {
                channel
                    .sendMessage(message)
                    .catch(error => logger.error(`sendMessage Error: ${error}\nChannel ID: ${channelID}\nMessage: ${message}`));
                logger.info(`Message Send Success\nChannel ID: ${channelID}\nMessage: ${message}`);
            });
    }

    fetchMessage(channelID:number, messageID:number) {
        return this.fetchChannel(channelID)
            .then(channel => channel.messages
                .fetch(messageID)
                .catch(error => logger.error(`fetchMessage Error: ${error}\nChannel ID: ${channelID}\nMessage ID: ${messageID}`)));
    }

    fetchUser(userID:number) {
        return this.client.users
            .fetch(userID, true)
            .catch(error => logger.error(`fetchUser Error: ${error}\nUser ID: ${userID}`));
    }

    fetchDM(userID:number) {
        return this.fetchUser(userID)
            .then(user => user.createDM())
            .catch(error => logger.error(`fetchDM error: ${error}\nUser ID: ${userID}`));
    }

    sendDM(userID:number, message:string) {
        return this.fetchDM(userID)
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

export default Object.freeze(DiscordManager.createDiscordManager());
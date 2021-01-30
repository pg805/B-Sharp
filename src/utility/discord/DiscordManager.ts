/*
    - check if remaking the dm channel will save same message id's
    - log successes?
*/
//
import {
    Client,
    Guild,
    Role,
    Snowflake,
    Channel,
    Message,
    MessageEmbed,
    TextChannel,
    User,
    DMChannel
} from 'discord.js';
import { logger } from '../logger.js';
import settings from '../../settings.js';

const Discord = require('discord.js'),
	{ DISCORDTOKEN } = require('../data/keys.json');

// let settingsObject = settings.updateSettings();


/**
 * Manages all communication with Discord.
 * @param {Client} client the discord client used to communicate with Discord.
 */
class DiscordManager {
    client: Client;

    /**
     * Constructs a new discord manager class.
     * @param {Client} client the discord client used to communicate with Discord.
     */
    constructor(client: Client) {
        this.client = client;
    }


    /**
     * Instantiates a new DiscordManager class object by logging in the client.
     * @return {DiscordManager} a DiscordManager instance.
     */
    static createDiscordManager() {
        const client = new Discord.Client(
            { ws:
                { intents:
                    [
                        'GUILDS',
                        'GUILD_MEMBERS',
                        'GUILD_MESSAGES',
                        'GUILD_MESSAGE_REACTIONS',
                        'DIRECT_MESSAGES',
                        'DIRECT_MESSAGE_REACTIONS',
                        'GUILD_VOICE_STATES']
                }
            });

        // login bot
        client.login(DISCORDTOKEN);

        client.on('ready', () => {
            logger.info('Connected to Discord');
            logger.info('Logged in as: ');
            logger.info(`${client.user.username} - (${client.user.id})`);
            logger.info(`Watching:${client.guilds.cache.array().map((guild) => `\n${guild.name} - (${guild.id})`).join(', ')}`);

            // for Josh Panel.
            // eslint-disable-next-line no-console
            console.log('Bot Started');
        });

        client.on('debug', (debug) => logger.debug(`Discord Debug: ${debug}`));
        client.on('warn', (warning) => logger.warn(`Discord Warning: ${warning}`));
        client.on('error', (error) => logger.error(`Discord Error: ${error}`));

        // responses
        // client.on('message', message => {DiscordManager.listen(message)} );

        return new DiscordManager(client);
    }

    /**
     * Fetches the guild from the discord client.
     * @param {Snowflake} guildID The unique identifier of the guild.
     * @return {Promise<Guild>} A discord guild.
     */
    fetchGuild(guildID:Snowflake): Promise<Guild> {
        return this.client.guilds
            .fetch(guildID, true)
            .catch((error) => logger.error(`fetchGuild Error: ${error}\nGuild ID: ${guildID}`));
    }

    /**
     * Fetches the roll from a guild.
     * @param {Snowflake} guildID The unique identifier of the guild.
     * @param {Snowflake} rollID The unique identifier of the roll in the guild.
     * @return {Promise<Role>}
     */
    fetchRoll(guildID:Snowflake, rollID:Snowflake): Promise<Role> {
        return this
            .fetchGuild(guildID)
            .then((guild:Guild) => guild.roles
                .fetch(rollID, true)
                .catch((error) => logger.error(`fetchRoll Error: ${error}\nGuild ID: ${guildID}\nRoll ID: ${rollID}`)));
    }

    /**
     * Fetches a channel from the discord client.
     * @param {Snowflake} channelID The unique identifier of the channel.
     * @return {Promise<TextChannel>}
     */
    fetchTextChannel(channelID:Snowflake): Promise<TextChannel> {
        return this.client.channels
            .fetch(channelID, true)
            .catch((error) => logger.error(`fetchChannel Error: ${error}\nChannel ID: ${channelID}`));
    }

    /**
     * Sends a message to the given channel.
     * @param {Snowflake} channelID The unique identifier of the channel.
     * @param {string | MessageEmbed} message The message to send to the channel.
     * @return {Promise<Message>} A discord message.
     */
    sendMessage(
        channelID:Snowflake,
        message:string | MessageEmbed
    ): Promise<Message> {
        return this
            .fetchTextChannel(channelID)
            .then((channel) => {
                // how to make a success message, maybe do it on resolve or something?  I don't know how that works
                logger.info(`Sending Message\nChannel ID: ${channelID}\nMessage: ${message}`);
                return channel
                    .send(message)
                    .then((sentMessage) => logger.info(`Message Send Success\nChannel ID: ${channelID}\nMessage: ${sentMessage}`))
                    .catch((error) => logger.error(`sendMessage Error: ${error}\nChannel ID: ${channelID}\nMessage: ${message}`));
            });
    }

    /**
     * Fetches a discord message from a discord channel
     * @param {Snowflake} channelID The unique identifier of the channel.
     * @param {Snowflake} messageID The unique identifier of the message.
     * @return {Promise<Message>} A discord message.
     */
    fetchMessage(channelID:Snowflake, messageID:Snowflake): Promise<Message> {
        return this.fetchTextChannel(channelID)
            .then((channel) => channel.messages
                .fetch(messageID)
                .catch((error) => logger.error(`fetchMessage Error: ${error}\nChannel ID: ${channelID}\nMessage ID: ${messageID}`)));
    }

    /**
     * Fetches a discord user from the discord client.
     * @param {Snowflake} userID The unique identifier of a discord user.
     * @return {Promise<User>} A discord user.
     */
    fetchUser(userID:Snowflake) {
        return this.client.users
            .fetch(userID, true)
            .catch((error) => logger.error(`fetchUser Error: ${error}\nUser ID: ${userID}`));
    }

    /**
     * Fetches a discord dm channel for a specific user.
     * @param {Snowflake} userID The unique identifier of a discord user.
     * @return {Promise<DMChannel>} The DM channel with a specific user.
     */
    fetchDM(userID:Snowflake): Promise<DMChannel> {
        return this.fetchUser(userID)
            .then((user) => user.createDM())
            .catch((error) => logger.error(`fetchDM error: ${error}\nUser ID: ${userID}`));
    }

    /**
     * Sends a message to a discord user's dm channel.
     * @param {Snowflake} userID The unique identifier of a discord user.
     * @param {string | MessageEmbed} message The message to send to the dm channel.
     * @return {Promise<Message>} The message sent to the channel.
     */
    sendDM(userID:Snowflake, message:string | MessageEmbed): Promise<Message> {
        return this.fetchDM(userID)
            .then((dmChannel) => dmChannel
                .send(message)
                .then((sentMessage) => logger.info(`Direct Message Send Success\nUser ID: ${userID}\nMessage: ${sentMessage}`))
                .catch((error) => logger.error(`sendDM error: ${error}\nUser ID: ${userID}\nMessage: ${message}`))
            );
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
export type { DiscordManager };

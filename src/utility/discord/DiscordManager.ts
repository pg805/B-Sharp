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
    Message,
    MessageEmbed,
    TextChannel,
    User,
    DMChannel
} from 'discord.js';
import logger from '../logger.js';
import settings from '../../settings.js';

const Discord = require('discord.js');
const { DISCORDTOKEN } = require('../data/keys.json');

// let settingsObject = settings.updateSettings();


/**
 * Manages all communication with Discord.
 * @param {Client} client the Discord Client used to communicate with Discord.
 */
class DiscordManager {
    client: Client;

    /**
     * Constructs a new Discord Manager class.
     * @param {Client} client the Discord Client used to communicate with Discord.
     */
    constructor(client: Client) {
        this.client = client;
    }


    /**
     * Instantiates a new DiscordManager class object by logging in the Client.
     * @return {DiscordManager} a DiscordManager instance.
     */
    static createDiscordManager(): DiscordManager {
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
        // if message.author != bot
        // client.on('message', message => {DiscordManager.listen(message)} );

        return new DiscordManager(client);
    }

    /**
     * Fetches the guild from the Discord Client.
     * @param {Snowflake} guildID The unique identifier of a Discord Guild.
     * @return {Promise<Guild>} A Discord Guild.
     */
    fetchGuild(guildID:Snowflake): Promise<Guild> {
        return this.client.guilds
            .fetch(guildID, true)
            .catch((error) => logger.error(`fetchGuild Error: ${error}\nGuild ID: ${guildID}`));
    }

    /**
     * Fetches the roll from a guild.
     * @param {Snowflake} guildID The unique identifier of a Discord Guild.
     * @param {Snowflake} rollID The unique identifier of a roll in a Discord Guild.
     * @return {Promise<Role>}
     */
    fetchRoll(guildID:Snowflake, rollID:Snowflake): Promise<Role> {
        return this
            .fetchGuild(guildID)
            .then((guild:Guild) => guild.roles
                .fetch(rollID, true)
                .catch((error) => {
                    logger.error(`fetchRoll Error: ${error}\nGuild ID: ${guildID}\nRoll ID: ${rollID}`);
                    return null;
                }));
    }

    /**
     * Fetches a channel from the Discord Client.
     * @param {Snowflake} channelID The unique identifier of a Discord Channel.
     * @return {Promise<TextChannel>}
     */
    fetchTextChannel(channelID:Snowflake): Promise<TextChannel> {
        return this.client.channels
            .fetch(channelID, true)
            .catch((error) => {
                logger.error(`fetchChannel Error: ${error}\nChannel ID: ${channelID}`);
                return null;
            });
    }

    /**
     * Sends a message to the given channel.
     * @param {Snowflake} channelID The unique identifier of a Discord Channel.
     * @param {string | MessageEmbed} message A valid message that Discord Manager can send.
     * @return {Promise<Message>} A Discord Message.
     */
    sendMessage(
        channelID:Snowflake,
        message:string | MessageEmbed
    ): Promise<Message> {
        return this
            .fetchTextChannel(channelID)
            .then((channel) => {
                logger.info(`Sending Message\nChannel ID: ${channelID}\nMessage: ${message}`);
                return channel
                    .send(message)
                    .then((sentMessage) => logger.info(`Message Send Success\nChannel ID: ${channelID}\nMessage: ${sentMessage}`))
                    .catch((error) => {
                        logger.error(`sendMessage Error: ${error}\nChannel ID: ${channelID}\nMessage: ${message}`);
                        return null;
                    });
            });
    }

    /**
     * Fetches a Discord Message from a Discord Channel
     * @param {Snowflake} channelID The unique identifier of a Discord Channel.
     * @param {Snowflake} messageID The unique identifier of a Discord Message.
     * @return {Promise<Message>} A Discord Message.
     */
    fetchMessage(channelID:Snowflake, messageID:Snowflake): Promise<Message> {
        return this.fetchTextChannel(channelID)
            .then((channel) => channel.messages
                .fetch(messageID)
                .catch((error) => {
                    logger.error(`fetchMessage Error: ${error}\nChannel ID: ${channelID}\nMessage ID: ${messageID}`);
                    return null;
                }));
    }

    /**
     * Fetches a Discord User from the Discord Client.
     * @param {Snowflake} userID The unique identifier of a Discord User.
     * @return {Promise<User>} A Discord User.
     */
    fetchUser(userID:Snowflake): Promise<User> {
        return this.client.users
            .fetch(userID, true)
            .catch((error) => {
                logger.error(`fetchUser Error: ${error}\nUser ID: ${userID}`);
                return null;
            });
    }

    /**
     * Fetches a Discord DM Channel for a specific Discord User.
     * @param {Snowflake} userID The unique identifier of a Discord User.
     * @return {Promise<DMChannel>} The DM channel with a specific User.
     */
    fetchDM(userID:Snowflake): Promise<DMChannel> {
        return this.fetchUser(userID)
            .then((user) => user.createDM())
            .catch((error) => {
                logger.error(`fetchDM error: ${error}\nUser ID: ${userID}`);
                return null;
            });
    }

    /**
     * Sends a message to a Discord Iser's dm channel.
     * @param {Snowflake} userID The unique identifier of a Discord User.
     * @param {string | MessageEmbed} message A valid message that Discord Manager can send.
     * @return {Promise<Message>} The Discord Message sent to the Channel.
     */
    sendDM(userID:Snowflake, message:string | MessageEmbed): Promise<Message> {
        return this.fetchDM(userID)
            .then((dmChannel) => dmChannel
                .send(message)
                .then((sentMessage) => logger.info(`Direct Message Send Success\nUser ID: ${userID}\nMessage: ${sentMessage}`))
                .catch((error) => {
                    logger.error(`sendDM error: ${error}\nUser ID: ${userID}\nMessage: ${message}`);
                    return null;
                })
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

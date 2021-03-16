/*
    - check if remaking the dm channel will save same message id's
    - log successes?
*/
//
import Discord, { Channel, GuildChannel, NewsChannel } from 'discord.js';
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
import { getBotSettings } from '../../editSettings';
import logger from '../logger';

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

        // responses
        // if message.author != bot
        // client.on('message', message => {DiscordManager.listen(message)} );

        return new DiscordManager(client);
    }

    /**
     * initializes bot
     * @return {void}
     */
    initialize(): void {
        // login bot
        this.client.login(getBotSettings().DISCORDTOKEN);

        this.client.on('ready', () => {
            logger.info('Connected to Discord');
            logger.info('Logged in as: ');
            logger.info(`${this.client.user ? this.client.user.username : ''} - (${this.client.user ? this.client.user.id : ''})`);
            logger.info(`Watching:${this.client.guilds.cache.array().map((guild: Guild) => `\n${guild.name} - (${guild.id})`).join(', ')}`);

            // for Josh Panel.
            // eslint-disable-next-line no-console
            console.log('Bot Started');
        });

        this.client.on('debug', (debug: string) => logger.debug(`Discord Debug: ${debug}`));
        this.client.on('warn', (warning: string) => logger.warn(`Discord Warning: ${warning}`));
        this.client.on('error', (error: Error) => logger.error(`Discord Error: ${error}`));
    }

    /**
     * Fetches the guild from the Discord Client.
     * @param {Snowflake} guildID The unique identifier of a Discord Guild.
     * @return {Promise<Guild>} A Discord Guild.
     */
    fetchGuild(guildID:Snowflake): Promise<Guild> {
        return this.client.guilds
            .fetch(guildID, true)
            .catch((error: Error) => {
                logger.error(`fetchGuild Error: ${error}\nGuild ID: ${guildID}`);
                throw error;
            });
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
                .then((roll) => {
                    if (roll) {
                        return roll;
                    } else {
                        throw new Error('Recieved null from fetch');
                    }
                })
                .catch((error: Error) => {
                    logger.error(`fetchRoll Error: ${error}\nGuild ID: ${guildID}\nRoll ID: ${rollID}`);
                    throw error;
                }));
    }

    /**
     * Fetches a channel from the Discord Client.
     * @param {Snowflake} channelID The unique identifier of a Discord Channel.
     * @return {Promise<TextChannel | DMChannel | NewsChannel>}
     */
    fetchTextChannel(channelID:Snowflake): Promise<TextChannel | DMChannel | NewsChannel> {
        return this.client.channels
            .fetch(channelID, true)
            .then((channel) => {
                if (channel.isText()) {
                    return channel;
                } else {
                    throw new Error('fetchTextChannel channel is not a channel');
                }
            })
            .catch((error: Error) => {
                logger.error(`fetchChannel Error: ${error}\nChannel ID: ${channelID}`);
                throw error;
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
                logger.debug(`Sending Message\nChannel ID: ${channelID}\nMessage: ${message}`);
                return channel
                    .send(message)
                    .then((sentMessage:Message) => { 
                        logger.info(`Message Send Success\nChannel ID: ${channelID}\nMessage: ${sentMessage}`);
                        return sentMessage;
                    })
                    .catch((error: Error) => {
                        logger.error(`sendMessage Error: ${error}\nChannel ID: ${channelID}\nMessage: ${message}`);
                        throw error;
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
                .catch((error: Error) => {
                    logger.error(`fetchMessage Error: ${error}\nChannel ID: ${channelID}\nMessage ID: ${messageID}`);
                    throw error;
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
            .catch((error: Error) => {
                logger.error(`fetchUser Error: ${error}\nUser ID: ${userID}`);
                throw error;
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
            .catch((error: Error) => {
                logger.error(`fetchDM error: ${error}\nUser ID: ${userID}`);
                throw error;
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
                .then((sentMessage: Message) => { 
                    logger.info(`Direct Message Send Success\nUser ID: ${userID}\nMessage: ${sentMessage}`);
                    return sentMessage;
                })
                .catch((error: Error) => {
                    logger.error(`sendDM error: ${error}\nUser ID: ${userID}\nMessage: ${message}`);
                    throw error;
                })
            );
    }

    // addCollector() {
    //     return;
    // }

    // joinVoice(channel) {
    //     return;
    // }

    // leaveVoice() {
    //     return;
    // }
}

export default Object.freeze(DiscordManager.createDiscordManager());
export type { DiscordManager };

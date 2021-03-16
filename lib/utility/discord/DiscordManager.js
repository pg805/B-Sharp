"use strict";
exports.__esModule = true;
/*
    - check if remaking the dm channel will save same message id's
    - log successes?
*/
//
var discord_js_1 = require("discord.js");
var editSettings_1 = require("../../editSettings");
var logger_1 = require("../logger");
/**
 * Manages all communication with Discord.
 * @param {Client} client the Discord Client used to communicate with Discord.
 */
var DiscordManager = /** @class */ (function () {
    /**
     * Constructs a new Discord Manager class.
     * @param {Client} client the Discord Client used to communicate with Discord.
     */
    function DiscordManager(client) {
        this.client = client;
    }
    /**
     * Instantiates a new DiscordManager class object by logging in the Client.
     * @return {DiscordManager} a DiscordManager instance.
     */
    DiscordManager.createDiscordManager = function () {
        var client = new discord_js_1["default"].Client({ ws: { intents: [
                    'GUILDS',
                    'GUILD_MEMBERS',
                    'GUILD_MESSAGES',
                    'GUILD_MESSAGE_REACTIONS',
                    'DIRECT_MESSAGES',
                    'DIRECT_MESSAGE_REACTIONS',
                    'GUILD_VOICE_STATES'
                ]
            }
        });
        // login bot
        // responses
        // if message.author != bot
        // client.on('message', message => {DiscordManager.listen(message)} );
        return new DiscordManager(client);
    };
    /**
     * initializes bot
     * @return {void}
     */
    DiscordManager.prototype.initialize = function () {
        var _this = this;
        // login bot
        this.client.login(editSettings_1.getBotSettings().DISCORDTOKEN);
        this.client.on('ready', function () {
            logger_1["default"].info('Connected to Discord');
            logger_1["default"].info('Logged in as: ');
            logger_1["default"].info(_this.client.user.username + " - (" + _this.client.user.id + ")");
            logger_1["default"].info("Watching:" + _this.client.guilds.cache.array().map(function (guild) { return "\n" + guild.name + " - (" + guild.id + ")"; }).join(', '));
            // for Josh Panel.
            // eslint-disable-next-line no-console
            console.log('Bot Started');
        });
        this.client.on('debug', function (debug) { return logger_1["default"].debug("Discord Debug: " + debug); });
        this.client.on('warn', function (warning) { return logger_1["default"].warn("Discord Warning: " + warning); });
        this.client.on('error', function (error) { return logger_1["default"].error("Discord Error: " + error); });
    };
    /**
     * Fetches the guild from the Discord Client.
     * @param {Snowflake} guildID The unique identifier of a Discord Guild.
     * @return {Promise<Guild>} A Discord Guild.
     */
    DiscordManager.prototype.fetchGuild = function (guildID) {
        return this.client.guilds
            .fetch(guildID, true)["catch"](function (error) {
            logger_1["default"].error("fetchGuild Error: " + error + "\nGuild ID: " + guildID);
            return null;
        });
    };
    /**
     * Fetches the roll from a guild.
     * @param {Snowflake} guildID The unique identifier of a Discord Guild.
     * @param {Snowflake} rollID The unique identifier of a roll in a Discord Guild.
     * @return {Promise<Role>}
     */
    DiscordManager.prototype.fetchRoll = function (guildID, rollID) {
        return this
            .fetchGuild(guildID)
            .then(function (guild) { return guild.roles
            .fetch(rollID, true)["catch"](function (error) {
            logger_1["default"].error("fetchRoll Error: " + error + "\nGuild ID: " + guildID + "\nRoll ID: " + rollID);
            return null;
        }); });
    };
    /**
     * Fetches a channel from the Discord Client.
     * @param {Snowflake} channelID The unique identifier of a Discord Channel.
     * @return {Promise<TextChannel>}
     */
    DiscordManager.prototype.fetchTextChannel = function (channelID) {
        return this.client.channels
            .fetch(channelID, true)["catch"](function (error) {
            logger_1["default"].error("fetchChannel Error: " + error + "\nChannel ID: " + channelID);
            return null;
        });
    };
    /**
     * Sends a message to the given channel.
     * @param {Snowflake} channelID The unique identifier of a Discord Channel.
     * @param {string | MessageEmbed} message A valid message that Discord Manager can send.
     * @return {Promise<Message>} A Discord Message.
     */
    DiscordManager.prototype.sendMessage = function (channelID, message) {
        return this
            .fetchTextChannel(channelID)
            .then(function (channel) {
            logger_1["default"].info("Sending Message\nChannel ID: " + channelID + "\nMessage: " + message);
            return channel
                .send(message)
                .then(function (sentMessage) { return logger_1["default"].info("Message Send Success\nChannel ID: " + channelID + "\nMessage: " + sentMessage); })["catch"](function (error) {
                logger_1["default"].error("sendMessage Error: " + error + "\nChannel ID: " + channelID + "\nMessage: " + message);
                return null;
            });
        });
    };
    /**
     * Fetches a Discord Message from a Discord Channel
     * @param {Snowflake} channelID The unique identifier of a Discord Channel.
     * @param {Snowflake} messageID The unique identifier of a Discord Message.
     * @return {Promise<Message>} A Discord Message.
     */
    DiscordManager.prototype.fetchMessage = function (channelID, messageID) {
        return this.fetchTextChannel(channelID)
            .then(function (channel) { return channel.messages
            .fetch(messageID)["catch"](function (error) {
            logger_1["default"].error("fetchMessage Error: " + error + "\nChannel ID: " + channelID + "\nMessage ID: " + messageID);
            return null;
        }); });
    };
    /**
     * Fetches a Discord User from the Discord Client.
     * @param {Snowflake} userID The unique identifier of a Discord User.
     * @return {Promise<User>} A Discord User.
     */
    DiscordManager.prototype.fetchUser = function (userID) {
        return this.client.users
            .fetch(userID, true)["catch"](function (error) {
            logger_1["default"].error("fetchUser Error: " + error + "\nUser ID: " + userID);
            return null;
        });
    };
    /**
     * Fetches a Discord DM Channel for a specific Discord User.
     * @param {Snowflake} userID The unique identifier of a Discord User.
     * @return {Promise<DMChannel>} The DM channel with a specific User.
     */
    DiscordManager.prototype.fetchDM = function (userID) {
        return this.fetchUser(userID)
            .then(function (user) { return user.createDM(); })["catch"](function (error) {
            logger_1["default"].error("fetchDM error: " + error + "\nUser ID: " + userID);
            return null;
        });
    };
    /**
     * Sends a message to a Discord Iser's dm channel.
     * @param {Snowflake} userID The unique identifier of a Discord User.
     * @param {string | MessageEmbed} message A valid message that Discord Manager can send.
     * @return {Promise<Message>} The Discord Message sent to the Channel.
     */
    DiscordManager.prototype.sendDM = function (userID, message) {
        return this.fetchDM(userID)
            .then(function (dmChannel) { return dmChannel
            .send(message)
            .then(function (sentMessage) { return logger_1["default"].info("Direct Message Send Success\nUser ID: " + userID + "\nMessage: " + sentMessage); })["catch"](function (error) {
            logger_1["default"].error("sendDM error: " + error + "\nUser ID: " + userID + "\nMessage: " + message);
            return null;
        }); });
    };
    return DiscordManager;
}());
exports["default"] = Object.freeze(DiscordManager.createDiscordManager());

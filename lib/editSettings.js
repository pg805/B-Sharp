"use strict";
exports.__esModule = true;
exports.handle = exports.restartBot = exports.getBotSettings = exports.incrementPoll = exports.checkFileDate = void 0;
var fs = require("fs");
var autoReply_1 = require("./models/autoReply");
var logger_js_1 = require("./utility/logger.js");
var guildsTime = 0;
var guilds;
var commands = ['settings', 'music', 'poll', 'emote', 'refresh'];
/**
 * Reloads the guilds.jsonc file.
 */
function reloadFiles() {
    guilds = JSON.parse(fs.readFileSync('./data/guilds.jsonc', 'utf-8'));
    logger_js_1["default"].info('Reloaded guilds.jsonc');
}
/**
 * Returns the current guilds object.
 * @return {Guild[]} The most recent guilds object
 */
function getFiles() {
    return guilds;
}
/**
 * Checks the last date the guilds.jsonc file was updated.  Returns the most up to date guilds object.
 * @return {(Guild[])} The most recent guilds object.
 */
function checkFileDate() {
    // TODO LOGGING (fix this line too)
    logger_js_1["default"].debug("guildsTime: " + guildsTime + "\nLast File Change Date: " + fs.statSync('./data/guilds.jsonc').mtime.getTime());
    if (fs.statSync('./data/guilds.jsonc').mtime.getTime() != guildsTime) {
        guildsTime = fs.statSync('./data/guilds.jsonc').mtime.getTime();
        reloadFiles();
    }
    return getFiles();
}
exports.checkFileDate = checkFileDate;
/**
 * Writes guilds object to guilds.jsonc file.
 */
function writeFiles() {
    fs.writeFileSync('./data/guilds.jsonc', JSON.stringify(guilds, null, 4));
}
/**
 * Updates prefix for a Discord Guild.
 * @param {DiscordManager} discordManager Discord Manager for the bot.
 * @param {Snowflake} guildID The unique identifier of a Discord Guild.
 * @param {Snowflake} channelID The unique identifier of a Discord Channel.
 * @param {string} newPrefix A string for a valid new prefix.
 * @return {void}
 */
function prefix(discordManager, guildID, channelID, newPrefix) {
    // TODO: invalid prefixes - '$&/', ''
    guilds.forEach(function (guild) {
        if (guild.id == guildID) {
            guild.settings.prefix = newPrefix;
            discordManager.sendMessage(channelID, "Prefix for server " + guildID + " set to " + newPrefix);
        }
    });
    writeFiles();
    return;
}
/**
 * Adds a new Auto Reply for a Discord Guild.
 * @param {DiscordManager} discordManager Discord Manager for the Bot.
 * @param {Snowflake} guildID The unique identifier of a Discord Guild.
 * @param {Snowflake} channelID The unique identifier of a Discord Channel.
 * @param {string} pattern A string that can be parsed into a Regular Expression.
 * @param {string} autoResponse The response string for an auto reply.
 * @return {void}
 */
function autoReply(discordManager, guildID, channelID, pattern, autoResponse) {
    guilds.forEach(function (guild) {
        if (guild.id == guildID) {
            var newPattern = new RegExp(pattern, 'g');
            var newAutoreply = new autoReply_1["default"](newPattern, autoResponse);
            guild.autoReplies.push(newAutoreply);
            // TODO: confirm message
        }
    });
}
/**
 * Updates which commands can be used in a Discord Channel.
 * @param {DiscordManager} discordManager Discord Manager for the Bot.
 * @param {Snowflake} guildID The unique identifier of a Discord Guild.
 * @param {Snowflake} channelID The unique identifier of a Discord Channel
 * @param {Array<string>} args An array of strings with a specific structure.
 * The first argument must be a valid command operation.  The second argument
 * must be a valid command.
 * @return {void}
 * ***
 * Valid Arguments:
 *
 * -Add - add, a
 *
 * -Remove - remove, rev, r
 *
 * -All - all
 *
 * -None - none, n
 */
function permission(discordManager, guildID, channelID, args) {
    if (!(args[1] in commands)) {
        discordManager.sendMessage(channelID, "Invalid Command: " + args[1] + "\nValid Commands: " + commands);
        return;
    }
    // if (args[2]) {
    //     if (args[3]) {
    //         guildID = args[2];
    //         channelID = args[3];
    //     } else {
    //         channelID = args[2];
    //     }
    // }
    switch (args[0]) {
        case 'a':
        case 'add':
            guilds.forEach(function (guild) {
                if (guild.id == guildID) {
                    guild.textChannels.forEach(function (channel) {
                        if (channel.id == channelID) {
                            channel.commands.push(args[1]);
                            // confirm message
                        }
                    });
                }
            });
            break;
        case 'r':
        case 'rem':
        case 'remove':
            guilds.forEach(function (guild) {
                if (guild.id == guildID) {
                    guild.textChannels.forEach(function (channel) {
                        if (channel.id == channelID) {
                            var index = channel.commands.indexOf(args[1]);
                            channel.commands.splice(index, 1);
                            // confirm message
                        }
                    });
                }
            });
            break;
        default:
            break;
    }
}
/**
 * Sets the volume setting for a Guild.
 * @param {DiscordManager} discordManager Discord Manager for the Bot.
 * @param {Snowflake} guildID The unique identifier of a Discord Guild.
 * @param {Snowflake} channelID The unique identifier of a Discord Guild.
 * @param {string} newVolume A string that can be parsed into a number
 */
function setVolume(discordManager, guildID, channelID, newVolume) {
    var volume = parseInt(newVolume);
    guilds.forEach(function (guild) {
        if (guild.id == guildID) {
            guild.settings.volume = volume;
        }
    });
}
/**
 * Increments poll id by 1.
 * @return {void}
 */
function incrementPoll() {
    var botSettings = JSON.parse(fs.readFileSync('./data/settings.jsonc', 'utf-8'));
    botSettings.pollID++;
    fs.writeFileSync('./data/settings.jsonc', JSON.stringify(botSettings, null, 4));
}
exports.incrementPoll = incrementPoll;
/**
 * asdfa
 * @return {BotSettings} asdfasd
 */
function getBotSettings() {
    var botSettings = JSON.parse(fs.readFileSync('./data/settings.jsonc', 'utf-8'));
    return botSettings;
}
exports.getBotSettings = getBotSettings;
/**
 * asdf
 * @param {Snowflake} channelID asdf
 * @param {DiscordManager} discordManager asdf
 */
function restartBot(channelID, discordManager) {
    // todo add my id here
    // channel instead of user id
    discordManager.sendMessage(channelID, 'restarting bot.')
        .then(function () { return process.exit(0); });
}
exports.restartBot = restartBot;
/**
 * Directs a command and arguments to the correct setting function.
 * @param {DiscordManager} discordManager Discord Manager for the Bot.
 * @param {Snowflake} guildID The unique identifier of a Discord Guild.
 * @param {Snowflake} channelID The unique identifier of a Discord Guild.
 * @param {Array<string>} args The first argument must be a valid command function.  The remaining arguments must conform to the command function.
 */
function handle(discordManager, guildID, channelID, args) {
    switch (args[0].toLocaleLowerCase()) {
        case 'prefix':
        case 'p':
            prefix(discordManager, guildID, channelID, args[1]);
            break;
        case 'autoreply':
        case 'ar':
            autoReply(discordManager, guildID, channelID, args[1], args[2]);
            break;
        case 'permissions':
        case 'commands':
        case 'edit':
        case 'change':
        case 'c':
            permission(discordManager, guildID, channelID, args);
            break;
        case 'volume':
        case 'vol':
            setVolume(discordManager, guildID, channelID, args[1]);
            break;
        default:
            break;
    }
}
exports.handle = handle;

import { Snowflake } from 'discord.js';
import { DiscordManager } from './utility/discord/DiscordManager';
import fs from 'fs';
import Guild from './models/guild';
import AutoReply from './models/autoReply';

let guildsTime = 0;
let guilds: Guild[];
const commands = ['settings', 'music', 'poll', 'emote', 'refresh'];

/**
 * Reloads the guilds.jsonc file.
 */
function reloadFiles(): void {
    guilds = JSON.parse(fs.readFileSync('./data/guilds.jsonc', 'utf-8'));
}

/**
 * Returns the current guilds object.
 * @return {Guild[]} The most recent guilds object
 */
function getFiles(): Guild[] {
    return guilds;
}

/**
 * Checks the last date the guilds.jsonc file was updated.  Returns the most up to date guilds object.
 * @return {(Guild[])} The most recent guilds object.
 */
export function checkFileDate(): Guild[] {
    if (fs.statSync('./data/guilds.jsonc').mtime.getTime() != guildsTime) {
        guildsTime = fs.statSync('./data/guilds.jsonc').mtime.getTime();
        reloadFiles();
    }
    return getFiles();
}

/**
 * Writes guilds object to guilds.jsonc file.
 */
function writeFiles(): void {
    fs.writeFileSync('./data/guilds.jsonc', JSON.stringify(guilds, null, 4));
}

/**
 * Updates prefix for a Discord Guild.
 * @param {discordManager} discordManager Discord Manager for the bot.
 * @param {Snowflake} guildID The unique identifier of a Discord Guild.
 * @param {Snowflake} channelID The unique identifier of a Discord Channel.
 * @param {string} newPrefix A string for a valid new prefix.
 * @return {void}
 */
function prefix(
    discordManager: DiscordManager,
    guildID: Snowflake,
    channelID: Snowflake,
    newPrefix: string): void {
    // TODO: invalid prefixes - '$&/', ''
    guilds.forEach((guild) => {
        if (guild.id == guildID) {
            guild.settings.prefix = newPrefix;
            discordManager.sendMessage(channelID, `Prefix for server ${guildID} set to ${newPrefix}`);
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
function autoReply(
    discordManager: DiscordManager,
    guildID: Snowflake, channelID:
    Snowflake, pattern: string,
    autoResponse: string)
    : void {
    guilds.forEach((guild) => {
        if (guild.id == guildID) {
            const newPattern = new RegExp(pattern, 'g');
            const newAutoreply = new AutoReply(
                newPattern,
                autoResponse
            );
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
function permission(
    discordManager: DiscordManager,
    guildID: Snowflake,
    channelID: Snowflake,
    args: string[])
    : void {
    if (!(args[1] in commands)) {
        discordManager.sendMessage(channelID, `Invalid Command: ${args[1]}\nValid Commands: ${commands}`);
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
            guilds.forEach((guild) => {
                if (guild.id == guildID) {
                    guild.textChannels.forEach((channel) => {
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
            guilds.forEach((guild) => {
                if (guild.id == guildID) {
                    guild.textChannels.forEach((channel) => {
                        if (channel.id == channelID) {
                            const index = channel.commands.indexOf(args[1]);
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
function setVolume(
    discordManager: DiscordManager,
    guildID: Snowflake,
    channelID: Snowflake,
    newVolume: string)
    : void {
    const volume : number = parseInt(newVolume);

    guilds.forEach((guild) => {
        if (guild.id == guildID) {
            guild.settings.volume = volume;
        }
    });
}


function incrementPoll() {

}

/**
 * Directs a command and arguments to the correct setting function.
 * @param {DiscordManager} discordManager Discord Manager for the Bot.
 * @param {Snowflake} guildID The unique identifier of a Discord Guild.
 * @param {Snowflake} channelID The unique identifier of a Discord Guild.
 * @param {Array<string>} args The first argument must be a valid command function.  The remaining arguments must conform to the command function.
 */
export function handle(
    discordManager: DiscordManager,
    guildID: Snowflake,
    channelID: Snowflake,
    args: string[])
    : void {
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

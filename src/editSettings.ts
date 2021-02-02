import { Snowflake } from "discord.js";
import Settings from "./models/settings";
import { DiscordManager } from "./utility/discord/DiscordManager";
import fs from 'fs';
import Guild from "./models/guild";

let permissionTime = 0;
let settingsTime = 0;
let permissions: Guild[];
let settings: Settings;

/**
 * asdf
 */
function reloadFiles(): void {
    permissions = JSON.parse(fs.readFileSync('./data/permissions.jsonc', 'utf-8'));
    settings = JSON.parse(fs.readFileSync('./data/settings.jsonc', 'utf-8'));
}

/**
 * @return {(Guild[] | Settings)[]} 123asfd
 */
function getFiles(): (Guild[] | Settings)[] {
    return [permissions, settings];
}

/**
 * @return {(Guild[] | Settings)[]} 123asfd
 */
export function checkFileDate(): (Guild[] | Settings)[] {
    if (fs.statSync('./data/permissions.jsonc').mtime.getTime() != permissionTime || fs.statSync('./data/settings.jsonc').mtime.getTime() != settingsTime) {
        permissionTime = fs.statSync('./data/permissions.jsonc').mtime.getTime();
        settingsTime = fs.statSync('./data/settings.jsonc').mtime.getTime();
        reloadFiles();
    }
    return getFiles();
}

/**
 * asdfasd
 */
function writeFiles(): void {
    fs.writeFileSync('./data/settings.jsonc', JSON.stringify(settings, null, 4));
    fs.writeFileSync('./data/permissions.jsonc', JSON.stringify(permissions, null, 4));
}

// update prefix
function prefix(guild, prefix): void {
    settings.prefix = prefix;
    writeFiles();
    return;
}

function autoReply(guild, textChannel, autoResponse) {

}

/**
 * 123
 * @param {Snowflake} guildID 123
 * @param {Snowflake} channelID 123
 * @param {Array<string>} args 123
 * @param {DiscordManager} discordManager 123
 * @return {void}
 */
function permission(
    guildID: Snowflake,
    channelID: Snowflake,
    args: string[],
    discordManager: DiscordManager): void {
    if (!args[1] in commands) {
        discordManager.sendMessage(channelID, 'please input a valid command');
        return;
    }

    if (args[2]) {
        if (args[3]) {
            guildID = args[2];
            channelID = args[3];
        } else {
            channelID = args[2];
        }
    }

    switch (args[0]) {
        case 'a':
        case 'add':
            permissions.forEach((guild) => {
                if (guild.id == guildID) {
                    guild.channels.forEach((channel) => {
                        if (channel.id == channelID) {
                            channel.commands.push(args[1]);
                        }
                    });
                }
            });
            break;

        case 'r':
        case 'rem':
        case 'remove':
            permissions.forEach((guild) => {
                if (guild.id == guildID) {
                    guild.channels.forEach((channel) => {
                        if (channel.id == channelID) {
                            const index = channel.commands.indexOf(args[1]);
                            channel.commands.splice(index, 1);
                        }
                    });
                }
            });
            break;

        default:
            break;
    }
}

function setVolume() {

}

function incrementPoll() {

}

function handle(discordManager: DiscordManager, channelID: Snowflake, args: string[]) {

}
/*

*/
import { Message, Snowflake } from 'discord.js';
import { restartBot } from '../../bot.js';
import Guild from '../../models/guild.js';
import Instruction from '../../models/instruction.js';
import Settings from '../../models/guildSettings.js';
import { logger } from '../logger.js';
import { DiscordManager } from './DiscordManager.js';
import { checkFileDate, handle as settingsHandle } from '../../editSettings';


const sunEmote = '<:Sun:661243429648596992>';
const soundEffects: Object = require('../../../data/audioClips/_soundlist.json');

let response = checkFileDate();
let guilds: Guild[];
let settings: Settings;

/**
 * Parses message into command name and args.
 * @param {Message} message Message to parse.
 * @return {Instruction} Instruction to run command with args.
 */
function makeCommand(message: Message): Instruction {
    const instruction = new Instruction();
    const content = message.content;

    content.replace('/ ', '$&/');

    instruction.args = message.content
        .slice(settings.prefix.length)
        .split(/ /g);

    instruction.args.forEach((arg) => arg.replace('$&/', ' '));

    // get command name
    // NOTE: ALL COMMANDS MUST BE LOWERCASE IN CODE
    instruction.name = instruction.args.shift().toLowerCase();

    if (message.client.voice.connections.array() == []) {
        instruction.voice = message
            .client.voice.connections.array()[0].channel.id;
    }

    return instruction;
}

/**
 * Determines what to do with each message that the bot listens to
 * @param {Message} message Discord message recieves
 * @param {DiscordManager} discordManager Bot discord manager used to communicate with discord.
 * @return {void}
 */
export function listen(message: Message, discordManager: DiscordManager): void {
    let dmFlag = true;

    guilds = response;

    guilds.forEach((guild) => {
        if (message.guild.id == guild.id) {
            dmFlag = false;

            guild.autoReplies.forEach((autoReply) => {
                if (message.content.toLowerCase().match(autoReply.pattern)) {
                    discordManager
                        .sendMessage(message.channel.id, autoReply.response);
                }
            });

            guild.textChannels.forEach((channel) => {
                if (message.channel.id == channel.id &&
                    message.content.startsWith(guild.settings.prefix)) {
                    channel.commands.forEach((command) => {
                        const instruction = makeCommand(message);
                        if (instruction.name == command) {
                            runCommand(
                                instruction,
                                guild.id,
                                channel.id,
                                discordManager);

                            response = checkFileDate();
                        }
                    });
                }
            });
        }
    });

    // Happens if no guild is set.  Assumes DM message.
    if (dmFlag) {
        return;
    }
}

/**
 * Routs the command and arguments to the correct location to run a commands
 * @param {Instruction} instruction The instruction for the bot to run a command.
 * @param {Snowflake} guildID The unique identifier of a Discord Guild.
 * @param {Snowflake} channelID The unique identifier of a Discord Guild.
 * @param {DiscordManager} discordManager The Discord Manager that will communicate with Discord.
 * @return {void}
 */
function runCommand(
    instruction: Instruction,
    guildID: Snowflake,
    channelID: Snowflake,
    discordManager: DiscordManager
): void {
    switch (instruction.name) {
        case 'settings':
            settingsHandle(
                discordManager,
                guildID,
                channelID,
                instruction.args);
            break;

        case 'music':
            // send commandMessage to music.ts
            break;

        case 'poll':
            // send commandMessage to pollManager.ts
            break;

        case 'emote':
            // send command
            discordManager.sendMessage(channelID, sunEmote);
            break;

        case 'refresh':
            // send command
            restartBot(channelID, discordManager);
            break;

        // sound effects
        // needs a user or a voice channel
        default:
            // if (instruction.name in Object.keys(soundEffects) && ) {

            // }
            break;
    }
}

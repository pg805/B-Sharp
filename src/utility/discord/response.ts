/*

*/
import { Message, Snowflake } from 'discord.js';
import { restartBot } from '../../bot.js';
import Guild from '../../models/guild.js';
import Instruction from '../../models/instruction.js';
import Settings from '../../models/settings.js';
import { logger } from '../logger.js';
import { DiscordManager } from './DiscordManager.js';
import { checkFileDate } from '../../editSettings';


const sunEmote = '<:Sun:661243429648596992>';
const soundEffects: Object = require('../../../data/audioClips/_soundlist.json');

let permissions: Guild[];
let settings: Settings;

/**
 * Parses message into command name and args.
 * @param {Message} message Message to parse.
 * @return {Instruction} Instruction to run command with args.
 */
function makeCommand(message: Message): Instruction {
    const instruction = new Instruction();

    // separate arguments and remove prefix
    instruction.args = message.content
        .slice(settings.prefix.length)
        .split(/ +/);

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
 * @param {Message} message Discord message recieveds
 * @param {DiscordManager} discordManager Bot discord manager used to communicate with discord.
 */
function listen(message: Message, discordManager:DiscordManager) {
    let dmFlag = true;

    const response = checkFileDate();
    permissions = <Guild[]>response[0];
    settings = <Settings>response[1];

    permissions.forEach((guild) => {
        if (message.guild.id == guild.id) {
            dmFlag = false;

            guild.autoReplies.forEach((autoReply) => {
                if (message.content.toLowerCase().match(autoReply.pattern)) {
                    discordManager
                        .sendMessage(message.channel.id, autoReply.response);
                }
            });

            guild.channels.forEach((channel) => {
                if (message.channel.id == channel.id) {
                    channel.autoReplies.forEach((autoReply) => {
                        const messageContent = message.content.toLowerCase();
                        if (messageContent.match(autoReply.pattern)) {
                            discordManager.sendMessage(
                                message.channel.id,
                                autoReply.response);
                        }
                    });

                    if (message.content.startsWith(settings.prefix)) {
                        channel.commands.forEach((command) => {
                            const instruction = makeCommand(message);

                            if (instruction.name == command) {
                                runCommand(
                                    instruction,
                                    channel.id,
                                    discordManager);
                            }
                        });
                    }
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
 * @param {Instruction} instruction The instruction for the bot torun a command.
 * @param {Snowflake} channelID The unique identifier of the channel.
 * @param {DiscordManager} discordManager The Discord Manager that will communicate with Discord.
 */
function runCommand(
    instruction:Instruction,
    channelID:Snowflake,
    discordManager:DiscordManager
) {
    switch (instruction.name) {
        case 'settings':
            // send commandMessage to settings.ts
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

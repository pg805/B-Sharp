/*

*/
import { Message } from 'discord.js';
import Guild from '../../models/guild.js';
import Instruction from '../../models/instruction.js';
import { logger } from '../logger.js';
import { DiscordManager } from './DiscordManager.js';

const commandFile: Guild[] = require('../../../data/commands.jsonc');

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

    return instruction;
}

/**
 * Determines what to do with each message that the bot listens to
 * @param {Message} message Discord message recieveds
 * @param {DiscordManager} discordManager Bot discord manager used to communicate with discord.
 */
function listen(message: Message, discordManager:DiscordManager) {
    let dmFlag = true;

    commandFile.forEach((guild) => {
        if (message.guild.id == guild.id) {
            dmFlag = false;

            guild.autoReplies.forEach((autoReply) => {
                if (message.content.toLowerCase().match(autoReply.pattern)) {
                    discordManager.sendMessage(message.channel.id, autoReply.response);
                }
            });

            guild.channels.forEach((channel) => {
                // message.channel.id is a string, not an int
                if (message.channel.id == channel.id) {
                    channel.autoReplies.forEach((autoReply) => {
                        if (message.content.toLowerCase().match(autoReply.pattern)) {
                            discordManager.sendMessage(message.channel.id, autoReply.response);
                        }
                    });

                    if (message.content.startsWith(settings.prefix)) {
                        channel.commands.forEach((command) => {
                            const commandMessage = makeCommand(message);

                            if (commandMessage.name == command) {
								
                            }
                        });
                    }
                }
            });
        }
    });

    if (dmFlag) {

    }
}

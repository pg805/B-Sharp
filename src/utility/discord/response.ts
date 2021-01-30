/*

*/
import { Message } from 'discord.js';
import Guild from '../../models/guild.js';
import { logger } from '../logger.js';
import { DiscordManager } from './DiscordManager.js';

const commandFile: Guild[] = require('../../../data/commands.jsonc');

/**
 * parses message into command name and args.
 * @param {Message} message message to parse.
 * @return {Object} object with parameters *name* and *args*
 */
function makeCommand(message: Message) {
    const commandObject = {
        'name': null,
        'args': null,
    };

    // separate arguments and remove prefix
    commandObject.args = message.content
        .slice(settings.prefix.length)
        .split(/ +/);

    // get command name
    // NOTE: ALL COMMANDS MUST BE LOWERCASE IN CODE
    commandObject.name = commandObject.args.shift().toLowerCase();

    return commandObject;
}

/**
 * Determines what to do with each message that the bot listens to
 * @param {Message} message discord message recieved
 * @param {DiscordManager} discordManager bot discord manager used to communicate with discord.
 */
function listen(message: Message, discordManager:DiscordManager) {
    let dmFlag = true;

    commandFile.forEach((guild) => {
        if (message.guild.id == guild.id) {
            dmFlag = false;

            guild.autoReplies.forEach((autoReply) => {
                if(message.content.toLowerCase().match(autoReply.pattern)) {
                    discordManager.sendMessage(message.channel.id, autoReply.response);
                }
            });

            guild.channels.forEach((channel) => {
                // message.channel.id is a string, not an int
                if (message.channel.id == channel.id) {
                    channel.autoReplies.forEach((autoReply) => {
                        if(message.content.toLowerCase().match(autoReply.pattern)) {
                            discordManager.sendMessage(message.channel.id, autoReply.response);
                        }
                    });

                    if(message.content.startsWith(settings.prefix)) {
                        channel.commands.forEach((command) => {
                            const commandMessage = makeCommand(message.content);

                            if(commandMessage.name == command){
								
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
